export type CompensationPackage = {
	company: string;
	title: string;
	baseSalary: number;
	bonusPercentage?: number;
	bonusAmount?: number;
	equityGrantTotal: number;
	equityVestingYears?: number;
	signOnBonus?: number;
	retirementMatchPercent?: number;
	retirementMatchCap?: number;
	annualBenefitsValue?: number;
};

export type YearlyCompensation = {
	year: number;
	base: number;
	bonus: number;
	equity: number;
	signOn: number;
	retirement: number;
	total: number;
};

export type TotalRewardsBreakdown = {
	firstYearTotal: number;
	annualAverageTotal: number;
	fourYearTotal: number;
	yearlyBreakdown: YearlyCompensation[];
	cashPercentage: number;
	equityPercentage: number;
};

export function calculateTotalRewards(pkg: CompensationPackage): TotalRewardsBreakdown {
	const vestingYears = pkg.equityVestingYears ?? 4;
	const annualEquity = vestingYears > 0 ? pkg.equityGrantTotal / vestingYears : 0;

	const bonus =
		pkg.bonusAmount !== undefined
			? pkg.bonusAmount
			: pkg.bonusPercentage !== undefined
				? (pkg.baseSalary * pkg.bonusPercentage) / 100
				: 0;

	const retirementMatch = pkg.retirementMatchPercent
		? Math.min((pkg.baseSalary * pkg.retirementMatchPercent) / 100, pkg.retirementMatchCap ?? Number.POSITIVE_INFINITY)
		: 0;

	const yearlyBreakdown: YearlyCompensation[] = [];
	let fourYearTotal = 0;

	for (let y = 1; y <= vestingYears; y++) {
		const signOn = y === 1 ? (pkg.signOnBonus ?? 0) : 0;
		const yearTotal = pkg.baseSalary + bonus + annualEquity + signOn + retirementMatch;
		fourYearTotal += yearTotal;

		yearlyBreakdown.push({
			year: y,
			base: pkg.baseSalary,
			bonus,
			equity: annualEquity,
			signOn,
			retirement: retirementMatch,
			total: yearTotal,
		});
	}

	const firstYearTotal = yearlyBreakdown[0]?.total ?? 0;
	const annualAverageTotal = vestingYears > 0 ? Math.round(fourYearTotal / vestingYears) : firstYearTotal;

	const totalCashOverVesting = (pkg.baseSalary + bonus + retirementMatch) * vestingYears + (pkg.signOnBonus ?? 0);
	const cashPercentage = fourYearTotal > 0 ? Math.round((totalCashOverVesting / fourYearTotal) * 100) : 100;
	const equityPercentage = 100 - cashPercentage;

	return {
		firstYearTotal,
		annualAverageTotal,
		fourYearTotal,
		yearlyBreakdown,
		cashPercentage,
		equityPercentage,
	};
}

export type OfferComparison = {
	rankings: { company: string; firstYear: number; annualAverage: number }[];
	highestYearOne: string;
	highestAnnualAverage: string;
	deltaYearOne: number;
	deltaAnnualAverage: number;
};

export function compareOffers(offers: CompensationPackage[]): OfferComparison {
	if (offers.length === 0) {
		return {
			rankings: [],
			highestYearOne: "",
			highestAnnualAverage: "",
			deltaYearOne: 0,
			deltaAnnualAverage: 0,
		};
	}

	const evaluated = offers.map((pkg) => {
		const breakdown = calculateTotalRewards(pkg);
		return {
			company: pkg.company,
			firstYear: breakdown.firstYearTotal,
			annualAverage: breakdown.annualAverageTotal,
		};
	});

	evaluated.sort((a, b) => b.firstYear - a.firstYear);

	const highestYearOne = evaluated[0]?.company ?? "";
	const lowestYearOne = evaluated[evaluated.length - 1]?.firstYear ?? 0;
	const deltaYearOne = evaluated[0] ? evaluated[0].firstYear - lowestYearOne : 0;

	const byAverage = [...evaluated].sort((a, b) => b.annualAverage - a.annualAverage);
	const highestAnnualAverage = byAverage[0]?.company ?? "";
	const lowestAverage = byAverage[byAverage.length - 1]?.annualAverage ?? 0;
	const deltaAnnualAverage = byAverage[0] ? byAverage[0].annualAverage - lowestAverage : 0;

	return {
		rankings: evaluated,
		highestYearOne,
		highestAnnualAverage,
		deltaYearOne,
		deltaAnnualAverage,
	};
}

export type NegotiationTemplateType = "competing-offer" | "counter-offer" | "equity-adjustment";

export function generateNegotiationScript(params: {
	candidateName: string;
	companyName: string;
	roleTitle: string;
	currentOffer: CompensationPackage;
	targetBaseSalary?: number;
	competingOffer?: CompensationPackage;
	type: NegotiationTemplateType;
}): string {
	const { candidateName, companyName, roleTitle, currentOffer, targetBaseSalary, competingOffer, type } = params;

	if (type === "competing-offer" && competingOffer) {
		return [
			`Dear ${companyName} Hiring Team,`,
			"",
			`Thank you for extending the offer for the ${roleTitle} role. I am enthusiastic about the opportunity to join ${companyName} and contribute to the team's goals.`,
			"",
			`I am writing to share that I have received another active offer from ${competingOffer.company} offering a first-year total compensation of $${calculateTotalRewards(competingOffer).firstYearTotal.toLocaleString()}. Because ${companyName} remains my top choice due to your culture and engineering mission, I would immediately sign if you are able to adjust the compensation package closer to this benchmark.`,
			"",
			`Thank you again for your time, support, and consideration.`,
			"",
			`Best regards,`,
			`${candidateName}`,
		].join("\n");
	}

	if (type === "counter-offer") {
		const target = targetBaseSalary ?? Math.round(currentOffer.baseSalary * 1.1);
		return [
			`Dear ${companyName} Hiring Team,`,
			"",
			`Thank you so much for the offer to join ${companyName} as ${roleTitle}. I am excited about the impact this role will have and look forward to partnering with the team.`,
			"",
			`Based on recent industry market data and my track record delivering high-impact projects, I would like to explore whether we can adjust the base salary to $${target.toLocaleString()}. With this adjustment, I am ready to accept and sign right away.`,
			"",
			`Thank you for your flexibility and partnership throughout this process.`,
			"",
			`Sincerely,`,
			`${candidateName}`,
		].join("\n");
	}

	return [
		`Dear ${companyName} Hiring Team,`,
		"",
		`Thank you for the detailed offer for ${roleTitle}. I am very impressed by the team and vision.`,
		"",
		`Given my long-term commitment to driving outsized results for ${companyName}, I would love to discuss increasing the initial equity grant or exploring a performance-based milestone adjustment.`,
		"",
		`Warm regards,`,
		`${candidateName}`,
	].join("\n");
}
