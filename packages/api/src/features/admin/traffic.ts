import { createHash } from "node:crypto";
import { getRedis, redisKey } from "@reactive-resume/db/redis";

export type DeviceType = "desktop" | "mobile" | "tablet" | "bot";

export type LiveVisit = {
	id: string;
	path: string;
	referrer: string;
	device: DeviceType;
	country: string;
	ip: string;
	timestamp: string;
};

export type DailyPoint = {
	date: string;
	views: number;
	visitors: number;
};

export type TrafficStats = {
	today: {
		views: number;
		visitors: number;
	};
	last7Days: DailyPoint[];
	last30DaysViews: number;
	allTimeViews: number;
	topPages: { path: string; views: number; percentage: number }[];
	topReferrers: { source: string; count: number; percentage: number }[];
	devices: {
		desktop: number;
		mobile: number;
		tablet: number;
		bot: number;
	};
	recentVisits: LiveVisit[];
};

// In-memory fallback if Redis is disabled or temporarily offline
type MemoryStore = {
	totalViews: number;
	dailyViews: Record<string, number>;
	dailyVisitors: Record<string, Set<string>>;
	dailyPaths: Record<string, Record<string, number>>;
	dailyReferrers: Record<string, Record<string, number>>;
	dailyDevices: Record<string, Record<DeviceType, number>>;
	recentVisits: LiveVisit[];
};

const memoryStore: MemoryStore = {
	totalViews: 0,
	dailyViews: {},
	dailyVisitors: {},
	dailyPaths: {},
	dailyReferrers: {},
	dailyDevices: {},
	recentVisits: [],
};

function parseDevice(userAgent: string | null): DeviceType {
	if (!userAgent) return "desktop";
	const ua = userAgent.toLowerCase();
	if (/bot|crawler|spider|googlebot|bingbot|yandex|duckduckbot/i.test(ua)) return "bot";
	if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
	if (/mobile|iphone|ipod|android/i.test(ua)) return "mobile";
	return "desktop";
}

function parseReferrer(refererHeader: string | null): string {
	if (!refererHeader) return "Direct / Bookmark";
	try {
		const parsed = new URL(refererHeader);
		const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
		if (host.includes("google.")) return "Google Search";
		if (host.includes("linkedin.")) return "LinkedIn";
		if (host.includes("indeed.")) return "Indeed";
		if (host.includes("twitter.") || host.includes("x.com")) return "Twitter / X";
		if (host.includes("reddit.")) return "Reddit";
		if (host.includes("facebook.")) return "Facebook";
		if (host.includes("bing.")) return "Bing Search";
		if (host.includes("github.")) return "GitHub";
		if (host.includes("dippergo.") || host.includes("localhost") || host.includes("192.168."))
			return "Direct / Bookmark";
		return host;
	} catch {
		return "Other";
	}
}

function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export const trafficService = {
	async recordHit(params: {
		path: string;
		referer: string | null;
		userAgent: string | null;
		ip: string;
		country: string | null;
	}): Promise<void> {
		const now = new Date();
		const dateStr = formatDate(now);
		const device = parseDevice(params.userAgent);
		const referrer = parseReferrer(params.referer);
		const country = params.country || "Global";
		const path = params.path || "/";

		// Anonymize IP with salt
		const ipHash = createHash("sha256").update(`${params.ip}:${dateStr}:dippergo_telemetry`).digest("hex").slice(0, 16);

		const visit: LiveVisit = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			path,
			referrer,
			device,
			country,
			ip: params.ip,
			timestamp: now.toISOString(),
		};

		const redis = getRedis();

		if (redis) {
			try {
				const pipeline = redis.pipeline();

				// 1. All-time views
				pipeline.incr(redisKey("traffic", "views", "total"));

				// 2. Daily views
				pipeline.incr(redisKey("traffic", "views", "daily", dateStr));

				// 3. Unique visitors (HyperLogLog)
				pipeline.pfadd(redisKey("traffic", "visitors", "daily", dateStr), ipHash);

				// 4. Daily paths (Sorted Set)
				pipeline.zincrby(redisKey("traffic", "paths", dateStr), 1, path);

				// 5. Daily referrers (Sorted Set)
				pipeline.zincrby(redisKey("traffic", "referrers", dateStr), 1, referrer);

				// 6. Daily devices (Sorted Set)
				pipeline.zincrby(redisKey("traffic", "devices", dateStr), 1, device);

				// 7. Recent live stream (List capped to 50 items)
				pipeline.lpush(redisKey("traffic", "recent"), JSON.stringify(visit));
				pipeline.ltrim(redisKey("traffic", "recent"), 0, 49);

				// Set 90 day TTL on daily aggregations to prevent unbounded growth
				const TTL_SECONDS = 90 * 24 * 60 * 60;
				pipeline.expire(redisKey("traffic", "views", "daily", dateStr), TTL_SECONDS);
				pipeline.expire(redisKey("traffic", "visitors", "daily", dateStr), TTL_SECONDS);
				pipeline.expire(redisKey("traffic", "paths", dateStr), TTL_SECONDS);
				pipeline.expire(redisKey("traffic", "referrers", dateStr), TTL_SECONDS);
				pipeline.expire(redisKey("traffic", "devices", dateStr), TTL_SECONDS);

				await pipeline.exec();
				return;
			} catch (err) {
				console.error("[TrafficService] Redis record failed, using memory fallback", err);
			}
		}

		// Fallback to in-memory store
		memoryStore.totalViews++;
		memoryStore.dailyViews[dateStr] = (memoryStore.dailyViews[dateStr] || 0) + 1;

		if (!memoryStore.dailyVisitors[dateStr]) memoryStore.dailyVisitors[dateStr] = new Set();
		memoryStore.dailyVisitors[dateStr].add(ipHash);

		if (!memoryStore.dailyPaths[dateStr]) memoryStore.dailyPaths[dateStr] = {};
		memoryStore.dailyPaths[dateStr][path] = (memoryStore.dailyPaths[dateStr][path] || 0) + 1;

		if (!memoryStore.dailyReferrers[dateStr]) memoryStore.dailyReferrers[dateStr] = {};
		memoryStore.dailyReferrers[dateStr][referrer] = (memoryStore.dailyReferrers[dateStr][referrer] || 0) + 1;

		if (!memoryStore.dailyDevices[dateStr]) {
			memoryStore.dailyDevices[dateStr] = { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
		}
		memoryStore.dailyDevices[dateStr][device] = (memoryStore.dailyDevices[dateStr][device] || 0) + 1;

		memoryStore.recentVisits.unshift(visit);
		if (memoryStore.recentVisits.length > 50) memoryStore.recentVisits.pop();
	},

	async getTrafficStats(): Promise<TrafficStats> {
		const redis = getRedis();
		const now = new Date();
		const dateStr = formatDate(now);

		// Generate past 7 days keys
		const last7DaysDates: string[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			last7DaysDates.push(formatDate(d));
		}

		// Generate past 30 days keys
		const last30DaysDates: string[] = [];
		for (let i = 29; i >= 0; i--) {
			const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			last30DaysDates.push(formatDate(d));
		}

		if (redis) {
			try {
				// Query Redis in parallel
				const totalViewsRaw = await redis.get(redisKey("traffic", "views", "total"));
				const allTimeViews = Number(totalViewsRaw || 0);

				// 7 days points
				const last7Days: DailyPoint[] = [];
				for (const d of last7DaysDates) {
					const [viewsRaw, visitorsRaw] = await Promise.all([
						redis.get(redisKey("traffic", "views", "daily", d)),
						redis.pfcount(redisKey("traffic", "visitors", "daily", d)),
					]);
					last7Days.push({
						date: d,
						views: Number(viewsRaw || 0),
						visitors: Number(visitorsRaw || 0),
					});
				}

				// 30 days views
				const thirtyDayViewKeys = last30DaysDates.map((d) => redisKey("traffic", "views", "daily", d));
				const thirtyDayViewsResults = await redis.mget(...thirtyDayViewKeys);
				const last30DaysViews = thirtyDayViewsResults.reduce((acc, v) => acc + Number(v || 0), 0);

				// Today stats
				const todayViews = Number((await redis.get(redisKey("traffic", "views", "daily", dateStr))) || 0);
				const todayVisitors = Number((await redis.pfcount(redisKey("traffic", "visitors", "daily", dateStr))) || 0);

				// Top paths (combine today and yesterday for fresh distribution)
				const rawPaths = await redis.zrevrange(redisKey("traffic", "paths", dateStr), 0, 9, "WITHSCORES");
				const topPages: { path: string; views: number; percentage: number }[] = [];
				let totalPathViews = 0;
				for (let i = 0; i < rawPaths.length; i += 2) {
					const p = rawPaths[i];
					const count = Number(rawPaths[i + 1] || 0);
					if (p) {
						totalPathViews += count;
						topPages.push({ path: p, views: count, percentage: 0 });
					}
				}
				for (const item of topPages) {
					item.percentage = totalPathViews > 0 ? Math.round((item.views / totalPathViews) * 100) : 0;
				}

				// Top referrers
				const rawRefs = await redis.zrevrange(redisKey("traffic", "referrers", dateStr), 0, 6, "WITHSCORES");
				const topReferrers: { source: string; count: number; percentage: number }[] = [];
				let totalRefViews = 0;
				for (let i = 0; i < rawRefs.length; i += 2) {
					const s = rawRefs[i];
					const count = Number(rawRefs[i + 1] || 0);
					if (s) {
						totalRefViews += count;
						topReferrers.push({ source: s, count, percentage: 0 });
					}
				}
				for (const item of topReferrers) {
					item.percentage = totalRefViews > 0 ? Math.round((item.count / totalRefViews) * 100) : 0;
				}

				// Device breakdown
				const rawDevices = await redis.zrevrange(redisKey("traffic", "devices", dateStr), 0, 3, "WITHSCORES");
				const devices = { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
				for (let i = 0; i < rawDevices.length; i += 2) {
					const dev = rawDevices[i] as DeviceType | undefined;
					const count = Number(rawDevices[i + 1] || 0);
					if (dev && dev in devices) devices[dev] = count;
				}

				// Recent visits
				const rawRecent = await redis.lrange(redisKey("traffic", "recent"), 0, 20);
				const recentVisits: LiveVisit[] = [];
				for (const item of rawRecent) {
					try {
						const parsed = JSON.parse(item);
						if (!parsed.ip) parsed.ip = "—";
						recentVisits.push(parsed);
					} catch {
						// Ignore parse error
					}
				}

				return {
					today: { views: todayViews, visitors: todayVisitors },
					last7Days,
					last30DaysViews,
					allTimeViews,
					topPages,
					topReferrers,
					devices,
					recentVisits,
				};
			} catch (err) {
				console.error("[TrafficService] Redis read failed, falling back to memory store", err);
			}
		}

		// Fallback from memory store
		const last7Days: DailyPoint[] = last7DaysDates.map((d) => ({
			date: d,
			views: memoryStore.dailyViews[d] || 0,
			visitors: memoryStore.dailyVisitors[d]?.size || 0,
		}));

		const last30DaysViews = last30DaysDates.reduce((acc, d) => acc + (memoryStore.dailyViews[d] || 0), 0);
		const todayViews = memoryStore.dailyViews[dateStr] || 0;
		const todayVisitors = memoryStore.dailyVisitors[dateStr]?.size || 0;

		const todayPathMap = memoryStore.dailyPaths[dateStr] || {};
		const sortedPaths = Object.entries(todayPathMap)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);
		const totalPathViews = sortedPaths.reduce((acc, [, count]) => acc + count, 0);
		const topPages = sortedPaths.map(([path, views]) => ({
			path,
			views,
			percentage: totalPathViews > 0 ? Math.round((views / totalPathViews) * 100) : 0,
		}));

		const todayRefMap = memoryStore.dailyReferrers[dateStr] || {};
		const sortedRefs = Object.entries(todayRefMap)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 7);
		const totalRefViews = sortedRefs.reduce((acc, [, count]) => acc + count, 0);
		const topReferrers = sortedRefs.map(([source, count]) => ({
			source,
			count,
			percentage: totalRefViews > 0 ? Math.round((count / totalRefViews) * 100) : 0,
		}));

		const devMap = memoryStore.dailyDevices[dateStr] || { desktop: 0, mobile: 0, tablet: 0, bot: 0 };

		return {
			today: { views: todayViews, visitors: todayVisitors },
			last7Days,
			last30DaysViews,
			allTimeViews: memoryStore.totalViews,
			topPages,
			topReferrers,
			devices: devMap,
			recentVisits: memoryStore.recentVisits.slice(0, 20),
		};
	},
};
