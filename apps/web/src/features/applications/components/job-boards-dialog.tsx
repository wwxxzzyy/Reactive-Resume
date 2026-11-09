import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@reactive-resume/ui/components/dialog";
import { Icon, type IconName } from "@reactive-resume/ui/components/icon";
import { Label } from "@reactive-resume/ui/components/label";
import { toast } from "@reactive-resume/ui/components/toast";
import { buildAffiliateUrl } from "../affiliate";
import { useDocumentDownload } from "../use-document-download";
import { Combobox } from "@/components/ui/combobox";
import { orpc } from "@/libs/orpc/client";

type JobBoard = {
	id: string;
	name: string;
	url: string;
	tag: string;
	description: string;
	icon: IconName;
	sponsored?: boolean;
};

const JOB_BOARDS: JobBoard[] = [
	{
		id: "ziprecruiter",
		name: "ZipRecruiter",
		url: buildAffiliateUrl("https://www.ziprecruiter.com/jobs", "ziprecruiter"),
		tag: "1-Click Apply",
		description:
			"Smart matching technology distributes your resume directly to verified employers looking to hire fast.",
		icon: "lightning",
		sponsored: true,
	},
	{
		id: "flexjobs",
		name: "FlexJobs",
		url: buildAffiliateUrl("https://www.flexjobs.com/", "flexjobs"),
		tag: "Vetted Remote",
		description: "Hand-screened, verified scam-free remote and flexible opportunities across 50+ career fields.",
		icon: "globe",
		sponsored: true,
	},
	{
		id: "linkedin",
		name: "LinkedIn Jobs",
		url: buildAffiliateUrl("https://www.linkedin.com/jobs/", "linkedin"),
		tag: "Easy Apply",
		description: "Browse millions of active postings and apply directly with 1-click Easy Apply or recruiter reach.",
		icon: "briefcase",
	},
	{
		id: "indeed",
		name: "Indeed Resume & Jobs",
		url: buildAffiliateUrl("https://resumes.indeed.com/", "indeed"),
		tag: "Direct Upload",
		description: "Upload your resume directly into Indeed's candidate database or apply across listings nationwide.",
		icon: "globe",
	},
	{
		id: "wellfound",
		name: "Wellfound (AngelList)",
		url: buildAffiliateUrl("https://wellfound.com/jobs", "wellfound"),
		tag: "Startups & Tech",
		description: "Direct access to high-growth tech startups and founder hiring teams with upfront salary and equity.",
		icon: "sparkle",
	},
	{
		id: "dice",
		name: "Dice Tech Careers",
		url: buildAffiliateUrl("https://www.dice.com/jobs", "dice"),
		tag: "Engineering & Cloud",
		description: "Specialized tech portal for software engineers, cloud architects, DevOps and security experts.",
		icon: "desktop",
	},
	{
		id: "glassdoor",
		name: "Glassdoor Jobs",
		url: buildAffiliateUrl("https://www.glassdoor.com/Job/index.htm", "glassdoor"),
		tag: "Salaries & Reviews",
		description:
			"Search open positions paired with verified employee salaries, company reviews, and interview questions.",
		icon: "trend-up",
	},
	{
		id: "remoteok",
		name: "RemoteOK",
		url: buildAffiliateUrl("https://remoteok.com/", "remoteok"),
		tag: "Remote Only",
		description: "Curated worldwide remote positions in software engineering, design, marketing, and operations.",
		icon: "desktop",
	},
	{
		id: "google-jobs",
		name: "Google Jobs",
		url: buildAffiliateUrl("https://www.google.com/search?ibp=htl;jobs", "google-jobs"),
		tag: "Aggregator",
		description: "Search across hundreds of job boards, company career portals, and staffing agencies in one view.",
		icon: "magnifying-glass",
	},
];

type JobBoardsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional pre-selected resume ID */
	defaultResumeId?: string | null;
};

export function JobBoardsDialog({ open, onOpenChange, defaultResumeId }: JobBoardsDialogProps) {
	const id = useId();
	const { data: resumes, isLoading } = useQuery(orpc.resume.list.queryOptions());
	const { download, downloading } = useDocumentDownload();

	const [selectedResumeIdOverride, setSelectedResumeId] = useState<string | null>(null);
	const selectedResumeId = selectedResumeIdOverride ?? defaultResumeId ?? resumes?.[0]?.id ?? null;

	const resumeOptions = (resumes ?? []).map((resume) => ({
		value: resume.id,
		label: resume.name,
		textValue: resume.name,
	}));

	const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

	const handleSubmitToBoard = async (board: JobBoard) => {
		if (selectedResumeId) {
			try {
				await download("resume", selectedResumeId);
				toast.add({ description: `Resume downloaded! Opening ${board.name} to complete submission.` });
			} catch {
				// useDocumentDownload handles toastError
			}
		} else {
			toast.add({ description: `Opening ${board.name}. Select a resume above to download a copy for submission.` });
		}
		window.open(board.url, "_blank", "noopener,noreferrer");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-[620px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Icon name="arrow-square-out" className="text-accent-text" size={22} />
						<DialogTitle>Submit to job search websites</DialogTitle>
					</div>
					<DialogDescription>
						Choose your resume to export as PDF and open the target job portal ready to submit your application.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="space-y-1.5 rounded-lg border border-line bg-sunken/40 p-3.5">
						<div className="flex items-center justify-between gap-2">
							<Label htmlFor={`${id}-resume-select`} className="text-sm font-medium">
								Select resume to submit
							</Label>
							{selectedResume && (
								<Badge variant="accent">
									<Icon name="check" size={12} />
									Ready
								</Badge>
							)}
						</div>
						{isLoading ? (
							<p className="text-xs text-ink-3">Loading your resumes…</p>
						) : resumeOptions.length === 0 ? (
							<p className="text-xs text-ink-3">
								No resumes found. Create a resume first before submitting to job boards.
							</p>
						) : (
							<Combobox
								id={`${id}-resume-select`}
								className="w-full bg-bg"
								options={resumeOptions}
								value={selectedResumeId}
								onValueChange={(val) => setSelectedResumeId(val)}
								placeholder="Choose a resume…"
							/>
						)}
					</div>

					<div className="grid gap-2.5">
						<span className="text-xs font-semibold tracking-wider text-ink-3 uppercase">Job Search Portals</span>

						{JOB_BOARDS.map((board) => {
							const isBusy = downloading === selectedResumeId;
							return (
								<div
									key={board.id}
									className="flex flex-col justify-between gap-3 rounded-lg border border-line p-3.5 transition-colors hover:border-line-2 sm:flex-row sm:items-center"
								>
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<Icon name={board.icon} size={18} className="text-ink-2" />
											<span className="text-sm font-semibold text-ink">{board.name}</span>
											<Badge variant="neutral" className="text-[11px]">
												{board.tag}
											</Badge>
										</div>
										<p className="line-clamp-2 text-xs text-ink-3">{board.description}</p>
									</div>

									<Button
										size="sm"
										variant="secondary"
										disabled={isBusy}
										onClick={() => void handleSubmitToBoard(board)}
										className="shrink-0 gap-1.5"
									>
										{selectedResumeId ? (
											<>
												<Icon name="file-arrow-up" size={14} />
												Submit resume
											</>
										) : (
											<>
												<Icon name="arrow-square-out" size={14} />
												Open board
											</>
										)}
									</Button>
								</div>
							);
						})}
					</div>

					<div className="flex items-center justify-between rounded-lg border border-line bg-sunken/20 px-3.5 py-2.5 text-xs text-ink-3">
						<span>Need automated form filling on job portals?</span>
						<a href="/capture-helper.zip" download className="font-medium text-accent-text hover:underline">
							Download browser helper
						</a>
					</div>

					<p className="text-[11px] leading-relaxed text-ink-3/80">
						DipperGo partners with verified job boards and career services. We may receive affiliate compensation when
						you submit through select partner platforms, which helps keep DipperGo free for job seekers.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
