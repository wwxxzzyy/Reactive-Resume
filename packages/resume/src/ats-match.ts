import type {
	CertificationItem,
	EducationItem,
	ExperienceItem,
	ProjectItem,
	ResumeData,
	SkillItem,
} from "@reactive-resume/schema/resume/data";

export type KeywordCategory = "hard-skill" | "tool" | "credential" | "soft-skill" | "domain";

export type MatchedKeyword = {
	keyword: string;
	category: KeywordCategory;
	countInJob: number;
	countInResume: number;
	sectionsFound: string[];
};

export type MissingKeyword = {
	keyword: string;
	category: KeywordCategory;
	countInJob: number;
	importance: "critical" | "recommended" | "optional";
	suggestedSection: string;
};

export type JobMatchResult = {
	/** Overall match score from 0 to 100 */
	score: number;
	/** Keyword match breakdown */
	matchedKeywords: MatchedKeyword[];
	missingKeywords: MissingKeyword[];
	/** Statistics */
	totalJobKeywords: number;
	matchedCount: number;
	missingCount: number;
	/** Actionable recommendations */
	recommendations: string[];
};

// Common technical skills and tools dictionary for precise entity extraction
const TECH_SKILLS = new Set([
	"javascript",
	"typescript",
	"python",
	"java",
	"c++",
	"c#",
	"go",
	"golang",
	"rust",
	"ruby",
	"php",
	"swift",
	"kotlin",
	"react",
	"react native",
	"next.js",
	"vue",
	"angular",
	"svelte",
	"node.js",
	"nodejs",
	"express",
	"hono",
	"fastapi",
	"django",
	"graphql",
	"rest",
	"restful",
	"grpc",
	"trpc",
	"sql",
	"postgresql",
	"postgres",
	"mysql",
	"mongodb",
	"redis",
	"dynamodb",
	"docker",
	"kubernetes",
	"k8s",
	"aws",
	"gcp",
	"azure",
	"terraform",
	"ansible",
	"ci/cd",
	"github actions",
	"gitlab",
	"linux",
	"git",
	"tailwind",
	"css",
	"html",
	"sass",
	"webpack",
	"vite",
	"vitest",
	"jest",
	"playwright",
	"cypress",
	"kafka",
	"rabbitmq",
	"elasticsearch",
	"spark",
	"hadoop",
	"airflow",
	"snowflake",
	"databricks",
	"dbt",
	"machine learning",
	"deep learning",
	"nlp",
	"llm",
	"pytorch",
	"tensorflow",
	"scikit-learn",
	"langchain",
	"prompt engineering",
	"figma",
	"storybook",
	"redux",
	"zustand",
	"tanstack query",
	"tanstack router",
	"drizzle",
	"prisma",
	"microservices",
]);

const CREDENTIALS = new Set([
	"bachelor",
	"master",
	"phd",
	"degree",
	"bs",
	"ms",
	"computer science",
	"engineering",
	"aws certified",
	"cissp",
	"pmp",
	"scrum master",
	"cpa",
	"cfa",
	"security+",
]);

const SOFT_SKILLS = new Set([
	"leadership",
	"mentorship",
	"collaboration",
	"communication",
	"problem solving",
	"agile",
	"scrum",
	"cross-functional",
	"stakeholder management",
	"project management",
	"code review",
	"system design",
	"architecture",
	"scalability",
	"performance optimization",
]);

const STOPWORDS = new Set([
	"a",
	"about",
	"above",
	"after",
	"again",
	"against",
	"all",
	"am",
	"an",
	"and",
	"any",
	"are",
	"aren't",
	"as",
	"at",
	"be",
	"because",
	"been",
	"before",
	"being",
	"below",
	"between",
	"both",
	"but",
	"by",
	"can",
	"can't",
	"cannot",
	"could",
	"couldn't",
	"did",
	"didn't",
	"do",
	"does",
	"doesn't",
	"doing",
	"don't",
	"down",
	"during",
	"each",
	"few",
	"for",
	"from",
	"further",
	"had",
	"hadn't",
	"has",
	"hasn't",
	"have",
	"haven't",
	"having",
	"he",
	"he'd",
	"he'll",
	"he's",
	"her",
	"here",
	"here's",
	"hers",
	"herself",
	"him",
	"himself",
	"his",
	"how",
	"how's",
	"i",
	"i'd",
	"i'll",
	"i'm",
	"i've",
	"if",
	"in",
	"into",
	"is",
	"isn't",
	"it",
	"it's",
	"its",
	"itself",
	"let's",
	"me",
	"more",
	"most",
	"mustn't",
	"my",
	"myself",
	"no",
	"nor",
	"not",
	"of",
	"off",
	"on",
	"once",
	"only",
	"or",
	"other",
	"ought",
	"our",
	"ours",
	"ourselves",
	"out",
	"over",
	"own",
	"same",
	"shan't",
	"she",
	"she'd",
	"she'll",
	"she's",
	"should",
	"shouldn't",
	"so",
	"some",
	"such",
	"than",
	"that",
	"that's",
	"the",
	"their",
	"theirs",
	"them",
	"themselves",
	"then",
	"there",
	"there's",
	"these",
	"they",
	"they'd",
	"they'll",
	"they're",
	"they've",
	"this",
	"those",
	"through",
	"to",
	"too",
	"under",
	"until",
	"up",
	"very",
	"was",
	"wasn't",
	"we",
	"we'd",
	"we'll",
	"we're",
	"we've",
	"were",
	"weren't",
	"what",
	"what's",
	"when",
	"when's",
	"where",
	"where's",
	"which",
	"while",
	"who",
	"who's",
	"whom",
	"why",
	"why's",
	"with",
	"won't",
	"would",
	"wouldn't",
	"you",
	"you'd",
	"you'll",
	"you're",
	"you've",
	"your",
	"yours",
	"yourself",
	"yourselves",
	"will",
	"shall",
	"must",
	"work",
	"experience",
	"year",
	"years",
	"job",
	"role",
	"team",
	"company",
	"opportunity",
	"candidate",
	"responsibilities",
	"requirements",
	"plus",
	"required",
	"preferred",
]);

function normalizeText(text: string): string {
	return text.toLowerCase().replace(/[\r\n\t]+/g, " ");
}

/**
 * Extracts candidate keywords from job description text, preserving multi-word technical entities.
 */
export function extractJobKeywords(text: string): Map<string, { count: number; category: KeywordCategory }> {
	const normalized = normalizeText(text);
	const keywords = new Map<string, { count: number; category: KeywordCategory }>();

	// 1. Check known multi-word & single-word technical skills
	for (const skill of TECH_SKILLS) {
		const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
		const matches = normalized.match(regex);
		if (matches && matches.length > 0) {
			keywords.set(skill, { count: matches.length, category: "hard-skill" });
		}
	}

	// 2. Check credentials
	for (const cred of CREDENTIALS) {
		const regex = new RegExp(`\\b${cred.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
		const matches = normalized.match(regex);
		if (matches && matches.length > 0) {
			keywords.set(cred, { count: matches.length, category: "credential" });
		}
	}

	// 3. Check soft skills
	for (const soft of SOFT_SKILLS) {
		const regex = new RegExp(`\\b${soft.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
		const matches = normalized.match(regex);
		if (matches && matches.length > 0) {
			keywords.set(soft, { count: matches.length, category: "soft-skill" });
		}
	}

	// 4. Tokenize remaining words for repeated domain terms (frequency >= 2 and length >= 4)
	const words = normalized
		.replace(/[^a-z0-9+#./-]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length >= 4 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

	const wordCounts = new Map<string, number>();
	for (const w of words) {
		wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
	}

	for (const [w, count] of wordCounts.entries()) {
		if (count >= 2 && !keywords.has(w)) {
			keywords.set(w, { count, category: "domain" });
		}
	}

	return keywords;
}

/**
 * Inspects a resume and calculates how well it matches a target job description.
 */
export function matchResumeWithJob(resume: ResumeData, jobDescriptionText: string): JobMatchResult {
	if (!jobDescriptionText || !jobDescriptionText.trim()) {
		return {
			score: 100,
			matchedKeywords: [],
			missingKeywords: [],
			totalJobKeywords: 0,
			matchedCount: 0,
			missingCount: 0,
			recommendations: ["Paste a job description to calculate your ATS match score."],
		};
	}

	const jobKeywords = extractJobKeywords(jobDescriptionText);
	if (jobKeywords.size === 0) {
		return {
			score: 100,
			matchedKeywords: [],
			missingKeywords: [],
			totalJobKeywords: 0,
			matchedCount: 0,
			missingCount: 0,
			recommendations: ["No specific technical or domain keywords identified in the pasted job description."],
		};
	}

	// Build section text maps for resume
	const resumeSections: Record<string, string> = {
		Summary: normalizeText(`${resume.basics?.headline ?? ""} ${resume.summary?.content ?? ""}`),
		Experience: normalizeText(
			resume.sections?.experience?.items
				?.map((item: ExperienceItem) => `${item.company} ${item.position} ${item.description}`)
				.join(" ") ?? "",
		),
		Skills: normalizeText(
			resume.sections?.skills?.items
				?.map((item: SkillItem) => `${item.name} ${item.keywords?.join(" ") ?? ""}`)
				.join(" ") ?? "",
		),
		Projects: normalizeText(
			resume.sections?.projects?.items?.map((item: ProjectItem) => `${item.name} ${item.description}`).join(" ") ?? "",
		),
		Education: normalizeText(
			resume.sections?.education?.items
				?.map((item: EducationItem) => `${item.school} ${item.degree} ${item.area} ${item.description}`)
				.join(" ") ?? "",
		),
		Certifications: normalizeText(
			resume.sections?.certifications?.items
				?.map((item: CertificationItem) => `${item.title} ${item.issuer} ${item.description}`)
				.join(" ") ?? "",
		),
	};

	const matched: MatchedKeyword[] = [];
	const missing: MissingKeyword[] = [];

	let totalWeight = 0;
	let earnedWeight = 0;

	for (const [kw, info] of jobKeywords.entries()) {
		const weight =
			info.category === "hard-skill" ? 3 : info.category === "credential" ? 2.5 : info.category === "domain" ? 1.5 : 1;

		totalWeight += weight;

		const sectionsFound: string[] = [];
		let totalCountInResume = 0;

		const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`\\b${escapedKw}\\b`, "gi");

		for (const [sectionName, text] of Object.entries(resumeSections)) {
			const matches = text.match(regex);
			if (matches && matches.length > 0) {
				sectionsFound.push(sectionName);
				totalCountInResume += matches.length;
			}
		}

		if (totalCountInResume > 0) {
			earnedWeight += weight;
			matched.push({
				keyword: kw,
				category: info.category,
				countInJob: info.count,
				countInResume: totalCountInResume,
				sectionsFound,
			});
		} else {
			const importance =
				info.category === "hard-skill" || info.category === "credential" || info.count >= 3
					? "critical"
					: info.count >= 2
						? "recommended"
						: "optional";

			const suggestedSection =
				info.category === "hard-skill"
					? "Skills or Experience"
					: info.category === "credential"
						? "Education or Certifications"
						: "Summary or Experience";

			missing.push({
				keyword: kw,
				category: info.category,
				countInJob: info.count,
				importance,
				suggestedSection,
			});
		}
	}

	const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;
	const score = Math.round(Math.min(100, Math.max(0, rawScore)));

	// Sort matched by countInJob desc
	matched.sort((a, b) => b.countInJob - a.countInJob);

	// Sort missing by importance (critical first), then frequency in job
	const importanceOrder: Record<string, number> = { critical: 3, recommended: 2, optional: 1 };
	missing.sort(
		(a, b) =>
			(importanceOrder[b.importance] ?? 0) - (importanceOrder[a.importance] ?? 0) || b.countInJob - a.countInJob,
	);

	// Generate actionable recommendations
	const recommendations: string[] = [];
	const criticalMissing = missing.filter((m) => m.importance === "critical").slice(0, 5);
	if (criticalMissing.length > 0) {
		recommendations.push(
			`Add critical missing skills to your resume: ${criticalMissing.map((m) => `"${m.keyword}"`).join(", ")}.`,
		);
	}

	const skillsMissing = missing.filter((m) => m.category === "hard-skill").slice(0, 4);
	if (skillsMissing.length > 0) {
		recommendations.push(
			`Include these tools in your Skills section: ${skillsMissing.map((m) => m.keyword).join(", ")}.`,
		);
	}

	if (score >= 80) {
		recommendations.push("Strong ATS alignment! Your resume matches the key competencies and terminology.");
	} else if (score >= 55) {
		recommendations.push(
			"Moderate match. Incorporate missing keywords into recent bullet points to beat automated screeners.",
		);
	} else {
		recommendations.push(
			"Low match score. Tailor your work accomplishments and skills to mirror the job requirements more closely.",
		);
	}

	return {
		score,
		matchedKeywords: matched,
		missingKeywords: missing,
		totalJobKeywords: jobKeywords.size,
		matchedCount: matched.length,
		missingCount: missing.length,
		recommendations,
	};
}
