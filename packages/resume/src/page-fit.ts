import type { ResumeData } from "@reactive-resume/schema/resume/data";

export type PageFitPreset = "compact-1-page" | "standard" | "relaxed-2-page";

export type FitRecommendation = {
	estimatedLinesToSave: number;
	actions: string[];
	optimizedMetadata: ResumeData["metadata"];
};

/**
 * Optimizes page margins, spacing gaps, and typography to fit content onto one page
 * while preserving recruiter readability and ATS compliance standards.
 */
export function applyOnePageAutoFit(metadata: ResumeData["metadata"]): ResumeData["metadata"] {
	return {
		...metadata,
		page: {
			...metadata.page,
			// Tighten page margins slightly to standard 10mm (approx 28pt) safe printable margin
			marginX: Math.max(10, Math.min(metadata.page.marginX, 12)),
			marginY: Math.max(8, Math.min(metadata.page.marginY, 10)),
			gapX: Math.max(8, Math.min(metadata.page.gapX, 10)),
			gapY: Math.max(8, Math.min(metadata.page.gapY, 10)),
		},
		typography: {
			...metadata.typography,
			body: {
				...metadata.typography.body,
				// Set compact but legible line height (1.35x) and 9.5pt font
				lineHeight: Math.max(1.25, Math.min(metadata.typography.body.lineHeight, 1.35)),
				fontSize: Math.max(8.5, Math.min(metadata.typography.body.fontSize, 9.5)),
			},
			heading: {
				...metadata.typography.heading,
				// Set compact heading size
				fontSize: Math.max(12, Math.min(metadata.typography.heading.fontSize, 14)),
				lineHeight: Math.max(1.15, Math.min(metadata.typography.heading.lineHeight, 1.25)),
			},
		},
	};
}

/**
 * Optimizes layout for comfortable multi-page reading when content exceeds single page.
 */
export function applyTwoPageRelaxedFit(metadata: ResumeData["metadata"]): ResumeData["metadata"] {
	return {
		...metadata,
		page: {
			...metadata.page,
			marginX: Math.max(metadata.page.marginX, 16),
			marginY: Math.max(metadata.page.marginY, 14),
			gapX: Math.max(metadata.page.gapX, 14),
			gapY: Math.max(metadata.page.gapY, 14),
		},
		typography: {
			...metadata.typography,
			body: {
				...metadata.typography.body,
				lineHeight: Math.max(metadata.typography.body.lineHeight, 1.5),
				fontSize: Math.max(metadata.typography.body.fontSize, 10),
			},
			heading: {
				...metadata.typography.heading,
				fontSize: Math.max(metadata.typography.heading.fontSize, 16),
				lineHeight: Math.max(metadata.typography.heading.lineHeight, 1.3),
			},
		},
	};
}

/**
 * Micro-adjusts margins and line spacing by ±3% to pull an orphan line back
 * without noticeably changing visual design.
 */
export function microAdjustFit(
	metadata: ResumeData["metadata"],
	direction: "tighten" | "loosen",
): ResumeData["metadata"] {
	const factor = direction === "tighten" ? 0.95 : 1.05;

	return {
		...metadata,
		page: {
			...metadata.page,
			gapY: Math.max(6, Math.min(24, Math.round(metadata.page.gapY * factor))),
			marginY: Math.max(6, Math.min(24, Math.round(metadata.page.marginY * factor))),
		},
		typography: {
			...metadata.typography,
			body: {
				...metadata.typography.body,
				lineHeight: Number(Math.max(1.2, Math.min(1.8, metadata.typography.body.lineHeight * factor)).toFixed(2)),
			},
		},
	};
}

/**
 * Evaluates resume content volume and provides recommendations for optimal page fit.
 */
export function analyzePageFit(resume: ResumeData): FitRecommendation {
	// Approximate line count estimation based on section counts
	const expCount = resume.sections?.experience?.items?.length ?? 0;
	const eduCount = resume.sections?.education?.items?.length ?? 0;
	const projCount = resume.sections?.projects?.items?.length ?? 0;
	const skillCount = resume.sections?.skills?.items?.length ?? 0;

	// Total entry blocks
	const totalBlocks = expCount + eduCount + projCount + skillCount;

	const actions: string[] = [];
	let estimatedLinesToSave = 0;

	if (resume.metadata?.page?.marginY > 14) {
		actions.push("Reduce top/bottom page margins from " + resume.metadata.page.marginY + "pt to 10pt");
		estimatedLinesToSave += 3;
	}

	if (resume.metadata?.page?.gapY > 12) {
		actions.push("Reduce inter-section vertical gap from " + resume.metadata.page.gapY + "pt to 10pt");
		estimatedLinesToSave += 4;
	}

	if (resume.metadata?.typography?.body?.lineHeight > 1.4) {
		actions.push("Adjust body line height from " + resume.metadata.typography.body.lineHeight + "x to 1.35x");
		estimatedLinesToSave += 5;
	}

	if (actions.length === 0) {
		if (totalBlocks > 8) {
			actions.push("Consider trimming older experience or condensing bullet points to fit 1 page.");
		} else {
			actions.push("Layout is already well-optimized for single page rendering.");
		}
	}

	return {
		estimatedLinesToSave,
		actions,
		optimizedMetadata: applyOnePageAutoFit(resume.metadata),
	};
}
