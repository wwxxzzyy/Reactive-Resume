import { useMemo } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";

export type TrafficStatsData = {
	today: {
		views: number;
		visitors: number;
	};
	last7Days: {
		date: string;
		views: number;
		visitors: number;
	}[];
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
	recentVisits: {
		id: string;
		path: string;
		referrer: string;
		device: "desktop" | "mobile" | "tablet" | "bot";
		country: string;
		timestamp: string;
	}[];
};

type TrafficOverviewProps = {
	traffic: TrafficStatsData | undefined;
	isLoading: boolean;
	onRefresh: () => void;
};

function formatRelativeTime(isoString: string): string {
	const now = Date.now();
	const then = new Date(isoString).getTime();
	const diffSec = Math.max(0, Math.floor((now - then) / 1000));
	if (diffSec < 5) return "Just now";
	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHours = Math.floor(diffMin / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	return `${Math.floor(diffHours / 24)}d ago`;
}

function formatDayLabel(dateStr: string): string {
	try {
		const parts = dateStr.split("-");
		if (parts.length === 3) {
			const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
			const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
			return `${dayName} ${parts[1]}/${parts[2]}`;
		}
		return dateStr;
	} catch {
		return dateStr;
	}
}

export function TrafficOverview({ traffic, isLoading, onRefresh }: TrafficOverviewProps) {
	const last7DaysTotal = useMemo(() => {
		return (traffic?.last7Days || []).reduce((acc, point) => acc + point.views, 0);
	}, [traffic?.last7Days]);

	const maxDailyViews = useMemo(() => {
		const max = Math.max(...(traffic?.last7Days || []).map((p) => p.views), 1);
		return Math.max(max, 10);
	}, [traffic?.last7Days]);

	const totalDeviceHits = useMemo(() => {
		if (!traffic?.devices) return 0;
		return traffic.devices.desktop + traffic.devices.mobile + traffic.devices.tablet + traffic.devices.bot;
	}, [traffic?.devices]);

	return (
		<div className="space-y-6">
			{/* Header Toolbar */}
			<div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent-text">
						<Icon name="chart-line-up" size={20} />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-bold text-ink">Website Traffic &amp; Telemetry</h3>
							<span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
								<span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
								Live
							</span>
						</div>
						<p className="text-xs text-ink-3">
							Real-time visitor counts, daily pageview velocity, and page distribution.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={onRefresh}
						disabled={isLoading}
						className="gap-1.5 text-xs font-medium"
					>
						<Icon name="arrows-clockwise" className={cn("size-3.5", isLoading && "animate-spin")} />
						<span>Refresh Telemetry</span>
					</Button>
				</div>
			</div>

			{/* Traffic Metric Highlights */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{/* Today */}
				<div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-2xs">
					<div className="flex items-center justify-between gap-2">
						<span className="text-xs font-medium text-ink-3">Today's Page Views</span>
						<div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
							<Icon name="eye" className="size-4" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline justify-between gap-2">
						<span className="text-2xl font-bold tracking-tight text-ink">
							{traffic?.today.views.toLocaleString() ?? "0"}
						</span>
						<Badge variant="accent" className="text-[10px]">
							{traffic?.today.visitors ?? 0} unique
						</Badge>
					</div>
				</div>

				{/* 7 Days */}
				<div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-2xs">
					<div className="flex items-center justify-between gap-2">
						<span className="text-xs font-medium text-ink-3">Last 7 Days</span>
						<div className="grid size-8 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
							<Icon name="trend-up" className="size-4" />
						</div>
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold tracking-tight text-ink">{last7DaysTotal.toLocaleString()}</span>
					</div>
				</div>

				{/* 30 Days */}
				<div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-2xs">
					<div className="flex items-center justify-between gap-2">
						<span className="text-xs font-medium text-ink-3">Last 30 Days</span>
						<div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
							<Icon name="calendar-dots" className="size-4" />
						</div>
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold tracking-tight text-ink">
							{traffic?.last30DaysViews.toLocaleString() ?? "0"}
						</span>
					</div>
				</div>

				{/* All-Time */}
				<div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-2xs">
					<div className="flex items-center justify-between gap-2">
						<span className="text-xs font-medium text-ink-3">All-Time Views</span>
						<div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
							<Icon name="globe" className="size-4" />
						</div>
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold tracking-tight text-ink">
							{traffic?.allTimeViews.toLocaleString() ?? "0"}
						</span>
					</div>
				</div>
			</div>

			{/* 7-Day Velocity Bar Chart */}
			<div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h4 className="text-sm font-bold text-ink">7-Day Daily Traffic Velocity</h4>
						<p className="text-xs text-ink-3">Daily comparison of total pageviews and unique visitors.</p>
					</div>

					<div className="flex items-center gap-3 text-xs">
						<div className="flex items-center gap-1.5">
							<span className="size-2.5 rounded-sm bg-blue-500" />
							<span className="text-ink-3">Page Views</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="size-2.5 rounded-sm bg-emerald-500" />
							<span className="text-ink-3">Unique Visitors</span>
						</div>
					</div>
				</div>

				{/* Bar Chart Container */}
				<div className="mt-6 flex h-48 items-end gap-3 border-b border-line pb-2 sm:gap-6">
					{(traffic?.last7Days || []).map((point) => {
						const viewHeightPercent = Math.max(6, Math.round((point.views / maxDailyViews) * 100));
						const visitorHeightPercent = Math.max(4, Math.round((point.visitors / maxDailyViews) * 100));

						return (
							<div key={point.date} className="group relative flex h-full flex-1 flex-col items-center justify-end">
								{/* Tooltip */}
								<div className="pointer-events-none absolute -top-10 z-10 hidden rounded-md border border-line-2 bg-raised px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-ink shadow-md group-hover:block">
									<div>
										{point.views} views · {point.visitors} visitors
									</div>
								</div>

								{/* Bars Pair */}
								<div className="flex h-full w-full max-w-[48px] items-end justify-center gap-1.5">
									{/* Views Bar */}
									<div
										style={{ height: `${viewHeightPercent}%` }}
										className="w-1/2 rounded-t-sm bg-blue-500/80 transition-all group-hover:bg-blue-400"
										title={`${point.views} pageviews`}
									/>
									{/* Visitors Bar */}
									<div
										style={{ height: `${visitorHeightPercent}%` }}
										className="w-1/2 rounded-t-sm bg-emerald-500/80 transition-all group-hover:bg-emerald-400"
										title={`${point.visitors} unique visitors`}
									/>
								</div>

								{/* X Axis Label */}
								<span className="mt-2 text-[10px] font-medium text-ink-3">{formatDayLabel(point.date)}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Two Column Grid: Top Pages & Referrers/Devices */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Top Visited Pages */}
				<div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h4 className="text-sm font-bold text-ink">Most Visited Pages Today</h4>
							<p className="text-xs text-ink-3">Top entry points and app routes.</p>
						</div>
						<Badge variant="neutral" className="text-[10px]">
							{traffic?.topPages.length || 0} active
						</Badge>
					</div>

					{!traffic?.topPages || traffic.topPages.length === 0 ? (
						<div className="py-8 text-center text-xs text-ink-3">
							No page views recorded yet today. Traffic will appear as users browse.
						</div>
					) : (
						<div className="space-y-3">
							{traffic.topPages.map((page, idx) => (
								<div key={page.path} className="space-y-1">
									<div className="flex items-center justify-between text-xs">
										<div className="flex min-w-0 items-center gap-2">
											<span className="w-4 font-mono text-[11px] font-bold text-ink-3">#{idx + 1}</span>
											<span className="truncate font-mono font-medium text-ink" title={page.path}>
												{page.path}
											</span>
										</div>
										<span className="shrink-0 font-mono text-xs font-semibold text-ink-2">
											{page.views} ({page.percentage}%)
										</span>
									</div>
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
										<div style={{ width: `${page.percentage}%` }} className="h-full rounded-full bg-blue-500" />
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Traffic Acquisition & Devices */}
				<div className="space-y-6">
					{/* Traffic Sources */}
					<div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h4 className="text-sm font-bold text-ink">Traffic Sources &amp; Referrers</h4>
								<p className="text-xs text-ink-3">Where incoming visitors arrive from.</p>
							</div>
						</div>

						{!traffic?.topReferrers || traffic.topReferrers.length === 0 ? (
							<div className="py-6 text-center text-xs text-ink-3">No referrers recorded yet today.</div>
						) : (
							<div className="space-y-3">
								{traffic.topReferrers.map((ref) => (
									<div key={ref.source} className="space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="font-medium text-ink">{ref.source}</span>
											<span className="font-mono text-xs text-ink-2">
												{ref.count} ({ref.percentage}%)
											</span>
										</div>
										<div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
											<div style={{ width: `${ref.percentage}%` }} className="h-full rounded-full bg-emerald-500" />
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Device Distribution */}
					<div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
						<h4 className="mb-3 text-sm font-bold text-ink">Device Breakdown</h4>
						{totalDeviceHits === 0 ? (
							<div className="py-3 text-center text-xs text-ink-3">No device data yet.</div>
						) : (
							<div className="space-y-3">
								<div className="flex h-3 w-full overflow-hidden rounded-full bg-sunken">
									<div
										style={{ width: `${Math.round(((traffic?.devices.desktop || 0) / totalDeviceHits) * 100)}%` }}
										className="bg-blue-500"
										title="Desktop"
									/>
									<div
										style={{ width: `${Math.round(((traffic?.devices.mobile || 0) / totalDeviceHits) * 100)}%` }}
										className="bg-emerald-500"
										title="Mobile"
									/>
									<div
										style={{ width: `${Math.round(((traffic?.devices.tablet || 0) / totalDeviceHits) * 100)}%` }}
										className="bg-purple-500"
										title="Tablet"
									/>
									<div
										style={{ width: `${Math.round(((traffic?.devices.bot || 0) / totalDeviceHits) * 100)}%` }}
										className="bg-slate-600"
										title="Bot"
									/>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3 text-xs">
									<div className="flex items-center gap-1.5">
										<Icon name="desktop" size={14} className="text-blue-400" />
										<span className="text-ink-2">Desktop:</span>
										<span className="font-mono font-bold text-ink">
											{Math.round(((traffic?.devices.desktop || 0) / totalDeviceHits) * 100)}%
										</span>
									</div>
									<div className="flex items-center gap-1.5">
										<Icon name="device-mobile" size={14} className="text-emerald-400" />
										<span className="text-ink-2">Mobile:</span>
										<span className="font-mono font-bold text-ink">
											{Math.round(((traffic?.devices.mobile || 0) / totalDeviceHits) * 100)}%
										</span>
									</div>
									<div className="flex items-center gap-1.5">
										<span className="size-2 rounded-full bg-purple-400" />
										<span className="text-ink-2">Tablet:</span>
										<span className="font-mono font-bold text-ink">
											{Math.round(((traffic?.devices.tablet || 0) / totalDeviceHits) * 100)}%
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Real-Time Live Activity Stream */}
			<div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
				<div className="flex items-center justify-between border-b border-line p-5">
					<div className="flex items-center gap-2">
						<span className="size-2 animate-pulse rounded-full bg-emerald-400" />
						<h4 className="text-sm font-bold text-ink">Live Visitor Stream</h4>
						<span className="text-xs text-ink-3">(Last 20 hits)</span>
					</div>
					<Badge variant="accent" className="font-mono text-[10px]">
						Real-Time
					</Badge>
				</div>

				{!traffic?.recentVisits || traffic.recentVisits.length === 0 ? (
					<div className="p-8 text-center text-xs text-ink-3">
						No recent visits recorded. Navigate to the website in a separate tab to see live hits.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-start text-xs">
							<thead>
								<tr className="border-b border-line bg-raised/40 text-start font-semibold text-ink-3">
									<th className="p-3 text-start">Time</th>
									<th className="p-3 text-start">Path</th>
									<th className="p-3 text-start">Referrer</th>
									<th className="p-3 text-start">Device</th>
									<th className="p-3 text-start">Location</th>
									<th className="p-3 text-end">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-line/40">
								{traffic.recentVisits.map((visit) => (
									<tr key={visit.id} className="transition-colors hover:bg-sunken/40">
										<td className="p-3 font-mono text-[11px] whitespace-nowrap text-ink-3">
											{formatRelativeTime(visit.timestamp)}
										</td>
										<td className="max-w-[200px] truncate p-3 font-mono font-medium text-ink" title={visit.path}>
											{visit.path}
										</td>
										<td className="p-3 whitespace-nowrap text-ink-2">{visit.referrer}</td>
										<td className="p-3 whitespace-nowrap">
											<div className="flex items-center gap-1.5 text-ink-2">
												<Icon name={visit.device === "mobile" ? "device-mobile" : "desktop"} size={14} />
												<span className="capitalize">{visit.device}</span>
											</div>
										</td>
										<td className="p-3 whitespace-nowrap">
											<Badge variant="neutral" className="text-[10px]">
												{visit.country}
											</Badge>
										</td>
										<td className="p-3 text-end whitespace-nowrap">
											<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
												200 OK
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
