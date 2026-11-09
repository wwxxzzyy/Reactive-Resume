import type { IconName } from "@reactive-resume/ui/components/icon";

export type PartnerCategory = "jobs" | "resume" | "interview" | "skills";

export type CareerPartner = {
	id: string;
	name: string;
	category: PartnerCategory;
	categoryLabel: string;
	badge?: string;
	perk: string;
	description: string;
	url: string;
	icon: IconName;
	popular?: boolean;
	accentColor?: string;
};

/** Default DipperGo referral tracking parameters */
export function buildAffiliateUrl(
	baseUrl: string,
	partnerId: string,
	options: { campaign?: string; customParams?: Record<string, string> } = {},
): string {
	try {
		const parsed = new URL(baseUrl);
		parsed.searchParams.set("ref", "dippergo");
		parsed.searchParams.set("utm_source", "dippergo");
		parsed.searchParams.set("utm_medium", "affiliate");
		parsed.searchParams.set("utm_campaign", options.campaign || `partner_${partnerId}`);

		if (options.customParams) {
			for (const [key, value] of Object.entries(options.customParams)) {
				parsed.searchParams.set(key, value);
			}
		}
		return parsed.toString();
	} catch {
		return baseUrl;
	}
}

export const CAREER_PARTNERS: CareerPartner[] = [
	// 1. Job Boards & Sourcing
	{
		id: "ziprecruiter",
		name: "ZipRecruiter",
		category: "jobs",
		categoryLabel: "Job Board",
		badge: "Top Sourcing",
		perk: "1-Click Resume Distribution",
		description:
			"Smart matching technology distributes your resume directly to thousands of hiring managers looking to fill roles urgently.",
		url: buildAffiliateUrl("https://www.ziprecruiter.com/jobs", "ziprecruiter"),
		icon: "lightning",
		popular: true,
	},
	{
		id: "flexjobs",
		name: "FlexJobs",
		category: "jobs",
		categoryLabel: "Remote Jobs",
		badge: "Verified Scam-Free",
		perk: "Hand-Screened Remote Roles",
		description:
			"Every listing is hand-researched and vetted for legitimacy. The #1 destination for full-time, hybrid, and contract remote careers.",
		url: buildAffiliateUrl("https://www.flexjobs.com/", "flexjobs"),
		icon: "globe",
	},
	{
		id: "wellfound",
		name: "Wellfound (AngelList)",
		category: "jobs",
		categoryLabel: "Startups & Tech",
		badge: "Direct Founder Access",
		perk: "Upfront Salary & Equity",
		description:
			"Apply directly to high-growth tech startups and Y Combinator companies without recruiter gatekeeping.",
		url: buildAffiliateUrl("https://wellfound.com/jobs", "wellfound"),
		icon: "sparkle",
	},
	{
		id: "dice",
		name: "Dice Careers",
		category: "jobs",
		categoryLabel: "Tech & Engineering",
		badge: "Specialized Tech",
		perk: "Dev & Cyber Sourcing",
		description:
			"Tailored exclusively for software engineers, DevOps architects, data scientists, and cybersecurity specialists.",
		url: buildAffiliateUrl("https://www.dice.com/jobs", "dice"),
		icon: "desktop",
	},

	// 2. Expert Resume & ATS Review
	{
		id: "topresume",
		name: "TopResume",
		category: "resume",
		categoryLabel: "Resume Audit",
		badge: "Free 48h Review",
		perk: "Recruiter ATS Diagnostic",
		description:
			"Get a confidential, expert critique of your resume from professional recruiters. Checks formatting, keyword density, and visual hierarchy.",
		url: buildAffiliateUrl("https://www.topresume.com/resume-review", "topresume"),
		icon: "check-circle",
		popular: true,
	},
	{
		id: "zipjob",
		name: "ZipJob",
		category: "resume",
		categoryLabel: "Resume Rewrite",
		badge: "60-Day Interview Guarantee",
		perk: "ATS-Guaranteed Rewrite",
		description:
			"Professional resume writers trained in modern ATS compliance rewrite your resume with guaranteed interview results within 60 days.",
		url: buildAffiliateUrl("https://www.zipjob.com/", "zipjob"),
		icon: "file-text",
	},

	// 3. Interview Prep & Mock Interviews
	{
		id: "exponent",
		name: "Exponent",
		category: "interview",
		categoryLabel: "Mock Interviews",
		badge: "Top Rated",
		perk: "FAANG Mock Interviews",
		description:
			"Master product management, system design, coding, and behavioral interviews with lessons and live peer mock sessions.",
		url: buildAffiliateUrl("https://www.tryexponent.com/", "exponent"),
		icon: "chat-text",
		popular: true,
	},
	{
		id: "interviewing-io",
		name: "interviewing.io",
		category: "interview",
		categoryLabel: "Technical Practice",
		badge: "Real Staff Engineers",
		perk: "Anonymous FAANG Mocks",
		description:
			"Practice technical coding, algorithms, and system architecture anonymously with verified staff engineers from Google, Meta, and Amazon.",
		url: buildAffiliateUrl("https://interviewing.io/", "interviewing-io"),
		icon: "microphone",
	},
	{
		id: "leetcode",
		name: "LeetCode Premium",
		category: "interview",
		categoryLabel: "Coding Questions",
		badge: "Company Tagged",
		perk: "Targeted Question Sets",
		description:
			"Unlock company-specific interview frequency lists (Google, Meta, Apple, Microsoft) and detailed editorial walkthroughs.",
		url: buildAffiliateUrl("https://leetcode.com/premium/", "leetcode"),
		icon: "brackets-curly",
	},

	// 4. Upskilling & Certifications
	{
		id: "coursera",
		name: "Coursera Career Certs",
		category: "skills",
		categoryLabel: "Certifications",
		badge: "Industry Accredited",
		perk: "Google & Meta Certificates",
		description:
			"Add recognized credentials from Google, IBM, and Meta directly to your resume to pass algorithmic screening filters.",
		url: buildAffiliateUrl("https://www.coursera.org/professional-certificates", "coursera"),
		icon: "graduation-cap",
	},
	{
		id: "datacamp",
		name: "DataCamp",
		category: "skills",
		categoryLabel: "Data & AI",
		badge: "Hands-on Coding",
		perk: "Python, SQL & AI Certs",
		description:
			"Interactive coding exercises and industry-certified assessments in Python, SQL, Power BI, and Applied Machine Learning.",
		url: buildAffiliateUrl("https://www.datacamp.com/", "datacamp"),
		icon: "chart-line-up",
	},
];
