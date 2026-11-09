import type { ApplicationSummary } from "../types";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Input } from "@reactive-resume/ui/components/input";
import { Skeleton } from "@reactive-resume/ui/components/skeleton";
import { toast } from "@reactive-resume/ui/components/toast";
import { cn } from "@reactive-resume/utils/style";
import { buildAffiliateUrl } from "../affiliate";
import { useInvalidateApplications } from "../use-application-actions";
import { Combobox } from "@/components/ui/combobox";
import { toastError } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";

export type DiscoveredJob = {
	id: string;
	title: string;
	company: string;
	location: string;
	remote: boolean;
	url: string;
	description: string;
	snippet: string;
	tags: string[];
	source: "Remotive" | "Arbeitnow";
	postedAt?: string | undefined;
};

type FindJobsViewProps = {
	applications: ApplicationSummary[];
};

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, " ")
		.trim();
}

async function searchPublicJobs(searchQuery: string, remoteOnly: boolean): Promise<DiscoveredJob[]> {
	const query = searchQuery.trim();
	if (!query) return [];

	const [remotiveRes, arbeitnowRes] = await Promise.allSettled([
		fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=25`).then((res) => {
			if (!res.ok) throw new Error(`Remotive error: ${res.status}`);
			return res.json() as Promise<{ jobs?: Array<Record<string, unknown>> }>;
		}),
		fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`).then((res) => {
			if (!res.ok) throw new Error(`Arbeitnow error: ${res.status}`);
			return res.json() as Promise<{ data?: Array<Record<string, unknown>> }>;
		}),
	]);

	const jobs: DiscoveredJob[] = [];
	const seen = new Set<string>();

	if (remotiveRes.status === "fulfilled" && Array.isArray(remotiveRes.value.jobs)) {
		for (const item of remotiveRes.value.jobs) {
			const id = `remotive-${item.id}`;
			const title = String(item.title || "").trim();
			const company = String(item.company_name || "").trim();
			const url = String(item.url || "");
			const key = `${company.toLowerCase()}:${title.toLowerCase()}`;
			if (!title || !company || !url || seen.has(key)) continue;
			seen.add(key);

			const rawDesc = String(item.description || "");
			const plain = stripHtml(rawDesc);
			const tags = Array.isArray(item.tags) ? item.tags.map(String).slice(0, 6) : [];

			jobs.push({
				id,
				title,
				company,
				location: String(item.candidate_required_location || "Worldwide"),
				remote: true,
				url,
				description: plain,
				snippet: plain.slice(0, 260) + (plain.length > 260 ? "…" : ""),
				tags,
				source: "Remotive",
				postedAt: item.publication_date ? String(item.publication_date).slice(0, 10) : undefined,
			});
		}
	}

	if (arbeitnowRes.status === "fulfilled" && Array.isArray(arbeitnowRes.value.data)) {
		for (const item of arbeitnowRes.value.data) {
			const id = `arbeitnow-${item.slug || item.id}`;
			const title = String(item.title || "").trim();
			const company = String(item.company_name || "").trim();
			const url = String(item.url || "");
			const isRemote = Boolean(item.remote);
			if (remoteOnly && !isRemote) continue;

			const key = `${company.toLowerCase()}:${title.toLowerCase()}`;
			if (!title || !company || !url || seen.has(key)) continue;
			seen.add(key);

			const rawDesc = String(item.description || "");
			const plain = stripHtml(rawDesc);
			const tags = Array.isArray(item.tags) ? item.tags.map(String).slice(0, 6) : [];

			jobs.push({
				id,
				title,
				company,
				location: isRemote ? "Remote" : String(item.location || "Multiple locations"),
				remote: isRemote,
				url,
				description: plain,
				snippet: plain.slice(0, 260) + (plain.length > 260 ? "…" : ""),
				tags,
				source: "Arbeitnow",
				postedAt: item.created_at ? new Date(Number(item.created_at) * 1000).toISOString().slice(0, 10) : undefined,
			});
		}
	}

	return jobs;
}

export function FindJobsView({ applications }: FindJobsViewProps) {
	const id = useId();
	const invalidateApplications = useInvalidateApplications();

	// 1. Get user's resumes
	const { data: resumes } = useQuery(orpc.resume.list.queryOptions());
	const [selectedResumeIdOverride, setSelectedResumeId] = useState<string | null>(null);
	const selectedResumeId = selectedResumeIdOverride ?? resumes?.[0]?.id ?? null;

	// 2. Fetch selected resume details to extract title & skills
	const { data: resumeDetail } = useQuery({
		...orpc.resume.getById.queryOptions({ input: { id: selectedResumeId ?? "" } }),
		enabled: Boolean(selectedResumeId),
	});

	// Extract keywords from resume
	const extractedKeywords = useMemo(() => {
		if (!resumeDetail?.data) return { role: "", skills: [] as string[], location: "" };
		const basics = resumeDetail.data.basics;
		const headline = basics?.headline?.trim() || "";
		const location = basics?.location?.trim() || "";

		// Experience roles
		const firstRole = resumeDetail.data.sections?.experience?.items?.[0]?.position?.trim() || "";

		// Skills
		const skills = (resumeDetail.data.sections?.skills?.items || [])
			.map((s) => s.name?.trim())
			.filter(Boolean) as string[];

		const suggestedRole = headline || firstRole || resumeDetail.name;
		return { role: suggestedRole, skills: skills.slice(0, 8), location };
	}, [resumeDetail]);

	// Search criteria state
	const [customSearchQuery, setSearchQuery] = useState<string | null>(null);
	const searchQuery = customSearchQuery ?? extractedKeywords.role;
	const [customActiveQuery, setActiveQuery] = useState<string | null>(null);
	const activeQuery = customActiveQuery ?? extractedKeywords.role;
	const [remoteOnly, setRemoteOnly] = useState(false);

	// 3. Tracked URLs lookup
	const trackedUrls = useMemo(() => {
		const urls = new Set<string>();
		for (const app of applications) {
			if (app.sourceUrl) urls.add(app.sourceUrl);
		}
		return urls;
	}, [applications]);

	const [locallyTracked, setLocallyTracked] = useState<Set<string>>(new Set());

	// 4. Fetch jobs query
	const {
		data: jobs = [],
		isLoading: isSearching,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["discovered-jobs", activeQuery, remoteOnly],
		queryFn: () => searchPublicJobs(activeQuery, remoteOnly),
		enabled: Boolean(activeQuery.trim()),
		staleTime: 5 * 60 * 1000,
	});

	// 5. Create application mutation
	const createMutation = useMutation(orpc.applications.create.mutationOptions());
	const [savingId, setSavingId] = useState<string | null>(null);

	const handleSaveJob = async (job: DiscoveredJob) => {
		if (savingId) return;
		setSavingId(job.id);
		try {
			await createMutation.mutateAsync({
				company: job.company,
				role: job.title,
				location: job.location,
				sourceUrl: job.url,
				jobDescription: job.description || null,
				resumeId: selectedResumeId || undefined,
				status: "saved",
			});
			setLocallyTracked((prev) => new Set(prev).add(job.url));
			invalidateApplications();
			toast.add({ description: `Saved "${job.title}" at ${job.company} to Applications!` });
		} catch (error) {
			toastError(error, "Couldn't save this job to Applications. Try again.");
		} finally {
			setSavingId(null);
		}
	};

	const handleSearchSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setActiveQuery(searchQuery.trim());
		}
	};

	const resumeOptions = (resumes ?? []).map((r) => ({
		value: r.id,
		label: r.name,
		textValue: r.name,
	}));

	return (
		<div className="grid gap-6">
			{/* Top control card */}
			<div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
						<div className="flex items-center gap-2">
							<Icon name="briefcase" className="text-accent-text" size={20} />
							<h2 className="text-base font-semibold text-ink">Find Job Openings</h2>
						</div>

						{/* Resume selector */}
						{resumeOptions.length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-xs text-ink-3">Match with resume:</span>
								<div className="w-56">
									<Combobox
										id={`${id}-resume`}
										className="h-8 bg-bg text-xs"
										options={resumeOptions}
										value={selectedResumeId}
										onValueChange={(val) => {
											setSelectedResumeId(val);
											setSearchQuery(null);
											setActiveQuery(null);
										}}
										placeholder="Select resume…"
									/>
								</div>
							</div>
						)}
					</div>

					{/* Search inputs */}
					<form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
						<div className="relative min-w-64 flex-1">
							<Icon
								name="magnifying-glass"
								size={18}
								className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-3"
							/>
							<Input
								type="search"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Job title, keywords, or role (e.g. Frontend Developer, Data Engineer)…"
								className="h-10 ps-9.5 text-sm"
							/>
						</div>

						<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-xs font-medium text-ink-2 select-none hover:bg-hover">
							<input
								type="checkbox"
								checked={remoteOnly}
								onChange={(e) => setRemoteOnly(e.target.checked)}
								className="size-4 rounded border-line text-accent accent-accent"
							/>
							Remote only
						</label>

						<Button type="submit" disabled={!searchQuery.trim() || isSearching} className="h-10 px-5">
							<Icon name="magnifying-glass" size={16} />
							Search Jobs
						</Button>
					</form>

					{/* Resume keywords chips */}
					{extractedKeywords.skills.length > 0 && (
						<div className="flex flex-wrap items-center gap-1.5 pt-1">
							<span className="text-xs font-medium text-ink-3">Resume skills:</span>
							{extractedKeywords.skills.map((skill) => (
								<button
									key={skill}
									type="button"
									onClick={() => {
										const next = `${searchQuery.trim()} ${skill}`.trim();
										setSearchQuery(next);
										setActiveQuery(next);
									}}
									className="inline-flex items-center gap-1 rounded-md border border-line bg-sunken/60 px-2 py-0.5 text-xs text-ink-2 transition-colors hover:border-line-2 hover:bg-hover hover:text-ink"
									title={`Add ${skill} to search`}
								>
									<Icon name="plus" size={11} className="text-ink-3" />
									{skill}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Partner Fast-Track Sourcing */}
			<div className="flex flex-col gap-2 rounded-xl border border-line bg-surface/80 p-3.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<span className="flex size-6 items-center justify-center rounded-full bg-accent/15 text-accent-text">
						<Icon name="lightning" size={13} />
					</span>
					<span className="text-xs font-semibold text-ink">Partner Sourcing Fast-Track:</span>
					<span className="hidden text-xs text-ink-3 md:inline">
						Distribute your resume across top hiring platforms in 1 click
					</span>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<a
						href={buildAffiliateUrl("https://www.ziprecruiter.com/jobs", "ziprecruiter")}
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken/40 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-line-2 hover:bg-hover hover:text-accent-text"
					>
						<span>ZipRecruiter</span>
						<Badge variant="accent" className="px-1 py-0 text-[9px]">
							1-Click
						</Badge>
					</a>
					<a
						href={buildAffiliateUrl("https://www.flexjobs.com/", "flexjobs")}
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken/40 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-line-2 hover:bg-hover hover:text-accent-text"
					>
						<span>FlexJobs</span>
						<Badge variant="neutral" className="px-1 py-0 text-[9px]">
							Remote
						</Badge>
					</a>
					<a
						href={buildAffiliateUrl("https://wellfound.com/jobs", "wellfound")}
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken/40 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-line-2 hover:bg-hover hover:text-accent-text"
					>
						<span>Wellfound</span>
						<Badge variant="neutral" className="px-1 py-0 text-[9px]">
							Startups
						</Badge>
					</a>
					<a
						href={buildAffiliateUrl("https://www.topresume.com/resume-review", "topresume")}
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken/40 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-line-2 hover:bg-hover hover:text-accent-text"
					>
						<span>TopResume</span>
						<Badge variant="accent" className="px-1 py-0 text-[9px]">
							Free Audit
						</Badge>
					</a>
				</div>
			</div>

			{/* Results header & count */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-ink">
						{activeQuery ? `Results for “${activeQuery}”` : "Enter a search term to find jobs"}
					</span>
					{jobs.length > 0 && (
						<Badge variant="neutral" className="font-mono text-xs">
							{jobs.length} jobs
						</Badge>
					)}
				</div>
				{activeQuery && (
					<Button
						variant="ghost"
						size="sm"
						disabled={isSearching}
						onClick={() => void refetch()}
						className="gap-1.5 text-xs text-ink-2"
					>
						<Icon name="arrows-clockwise" size={14} className={cn(isSearching && "animate-spin")} />
						Refresh
					</Button>
				)}
			</div>

			{/* Job listings */}
			{isSearching ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{Array.from({ length: 6 }, (_, index) => (
						<div key={index} className="space-y-3 rounded-xl border border-line p-4">
							<div className="flex justify-between gap-4">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-5 w-20" />
							</div>
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-12 w-full" />
							<div className="flex justify-between pt-2">
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-8 w-28" />
							</div>
						</div>
					))}
				</div>
			) : isError ? (
				<div className="rounded-xl border border-line bg-surface p-8 text-center">
					<p className="text-sm font-medium text-danger-text">Couldn't load job postings right now.</p>
					<Button variant="secondary" size="sm" onClick={() => void refetch()} className="mt-3">
						Retry Search
					</Button>
				</div>
			) : jobs.length === 0 ? (
				<div className="rounded-xl border border-line bg-surface py-16 text-center">
					<div className="mx-auto grid size-12 place-items-center rounded-full bg-sunken text-ink-3">
						<Icon name="briefcase" size={24} />
					</div>
					<h3 className="mt-4 text-sm font-semibold text-ink">
						{activeQuery ? "No job postings matched your query" : "Search to discover active jobs"}
					</h3>
					<p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
						{activeQuery
							? "Try searching for broader keywords like 'Developer', 'Engineer', or unchecking 'Remote only'."
							: "Choose a resume above and click Search Jobs to query current openings across tech job boards."}
					</p>
				</div>
			) : (
				<div className="grid gap-3.5 sm:grid-cols-2">
					{jobs.map((job) => {
						const isSaved = trackedUrls.has(job.url) || locallyTracked.has(job.url);
						const isSaving = savingId === job.id;

						return (
							<div
								key={job.id}
								className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4.5 shadow-2xs transition-[border-color,box-shadow] hover:border-line-2 hover:shadow-xs"
							>
								<div className="space-y-2.5">
									<div className="flex items-start justify-between gap-2.5">
										<div className="min-w-0">
											<h4 className="line-clamp-1 text-sm font-semibold text-ink hover:underline">
												<a href={job.url} target="_blank" rel="noopener noreferrer">
													{job.title}
												</a>
											</h4>
											<p className="truncate text-xs font-medium text-ink-2">{job.company}</p>
										</div>

										<Badge variant="neutral" className="shrink-0 text-[10px] tracking-wide uppercase">
											{job.source}
										</Badge>
									</div>

									{/* Badges row */}
									<div className="flex flex-wrap items-center gap-1.5 text-[11px]">
										{job.remote && (
											<Badge variant="accent" className="gap-1 py-0.5">
												<Icon name="globe" size={11} />
												Remote
											</Badge>
										)}
										<Badge variant="neutral" className="gap-1 py-0.5">
											<Icon name="map-pin" size={11} />
											{job.location}
										</Badge>
										{job.postedAt && <span className="ms-auto text-[11px] text-ink-3">{job.postedAt}</span>}
									</div>

									{/* Snippet */}
									<p className="line-clamp-3 text-xs leading-relaxed text-ink-3">{job.snippet}</p>

									{/* Tags */}
									{job.tags.length > 0 && (
										<div className="flex flex-wrap items-center gap-1 pt-1">
											{job.tags.map((tag) => (
												<span key={tag} className="rounded bg-sunken px-1.5 py-0.5 text-[10px] text-ink-3">
													{tag}
												</span>
											))}
										</div>
									)}
								</div>

								{/* Action buttons */}
								<div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
									<Button
										variant="ghost"
										size="sm"
										nativeButton={false}
										render={<a href={job.url} target="_blank" rel="noopener noreferrer" />}
										className="h-8 gap-1.5 text-xs text-ink-2 hover:text-ink"
									>
										<Icon name="arrow-square-out" size={14} />
										View posting
									</Button>

									{isSaved ? (
										<Badge variant="accent" className="h-8 gap-1.5 px-3 text-xs font-medium">
											<Icon name="check" size={14} />
											In Applications
										</Badge>
									) : (
										<Button
											size="sm"
											variant="secondary"
											disabled={isSaving}
											onClick={() => void handleSaveJob(job)}
											className="h-8 gap-1.5 px-3 text-xs font-medium text-accent-text hover:bg-accent-soft"
										>
											<Icon name="plus" size={14} />
											{isSaving ? "Saving…" : "Save to board"}
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
