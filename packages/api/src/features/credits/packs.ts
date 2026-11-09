export type CreditPackId = "starter" | "hunter" | "executive";

export type CreditPack = {
	id: CreditPackId;
	name: string;
	credits: number;
	price: number;
	priceDisplay: string;
	badge?: string;
	popular?: boolean;
	perCreditDisplay: string;
	savingsDisplay?: string;
	description: string;
	features: string[];
};

export const CREDIT_PACKS: CreditPack[] = [
	{
		id: "starter",
		name: "Starter Pack",
		credits: 25,
		price: 4.99,
		priceDisplay: "$4.99",
		perCreditDisplay: "20¢ / credit",
		description: "Perfect for quick targeted resume tailoring and ATS checks.",
		features: [
			"25 AI Tailoring & ATS Scans",
			"Cover Letter Generator",
			"Never expires",
			"No monthly recurring charges",
		],
	},
	{
		id: "hunter",
		name: "Job Hunter Pack",
		credits: 80,
		price: 12.99,
		priceDisplay: "$12.99",
		badge: "Most Popular",
		popular: true,
		perCreditDisplay: "16¢ / credit",
		savingsDisplay: "Save 20%",
		description: "High impact for active job seekers applying across 20–40 roles.",
		features: [
			"80 AI Credits",
			"Full Resume Job Tailoring",
			"ATS Keyword Gap Analysis",
			"STAR Interview Prep Stories",
			"Priority Generation Speed",
		],
	},
	{
		id: "executive",
		name: "Career Accelerator",
		credits: 200,
		price: 24.99,
		priceDisplay: "$24.99",
		badge: "Best Value",
		perCreditDisplay: "12¢ / credit",
		savingsDisplay: "Save 40%",
		description: "Maximum firepower for executive transitions and multiple variations.",
		features: [
			"200 AI Credits",
			"Everything in Job Hunter",
			"Executive Summary & Bullet Rewrite",
			"Unlimited Cover Letters",
			"Permanent Account Balance",
		],
	},
];

export const CREDIT_COSTS = {
	tailorLine: 1,
	atsScan: 1,
	coverLetter: 1,
	tailorResume: 2,
	starStory: 2,
} as const;
