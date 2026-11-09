import { describe, expect, it } from "vite-plus/test";
import {
	type CompensationPackage,
	calculateTotalRewards,
	compareOffers,
	generateNegotiationScript,
} from "./compensation";

const offerA: CompensationPackage = {
	company: "Acme Corp",
	title: "Senior Engineer",
	baseSalary: 150000,
	bonusPercentage: 15, // 22,500
	equityGrantTotal: 120000, // 30,000 / yr over 4 yrs
	signOnBonus: 10000,
	retirementMatchPercent: 4, // 6,000
};

const offerB: CompensationPackage = {
	company: "Beta Tech",
	title: "Staff Engineer",
	baseSalary: 175000,
	bonusAmount: 15000,
	equityGrantTotal: 160000, // 40,000 / yr
	signOnBonus: 20000,
};

describe("calculateTotalRewards", () => {
	it("accurately computes first-year total and annualized average", () => {
		const result = calculateTotalRewards(offerA);
		// Year 1: Base (150k) + Bonus (22.5k) + Equity (30k) + Sign-on (10k) + 401k (6k) = 218,500
		expect(result.firstYearTotal).toBe(218500);

		// Year 2-4: 208,500 each. Total 4 years: 218,500 + 3 * 208,500 = 844,000
		expect(result.fourYearTotal).toBe(844000);
		expect(result.annualAverageTotal).toBe(211000);
		expect(result.yearlyBreakdown).toHaveLength(4);
		expect(result.cashPercentage).toBeGreaterThan(80);
	});
});

describe("compareOffers", () => {
	it("ranks competing offers by year one and annual average", () => {
		const comparison = compareOffers([offerA, offerB]);
		expect(comparison.rankings[0].company).toBe("Beta Tech");
		expect(comparison.highestYearOne).toBe("Beta Tech");
		expect(comparison.deltaYearOne).toBeGreaterThan(0);
	});
});

describe("generateNegotiationScript", () => {
	it("generates professional counter-offer email with specific amounts", () => {
		const script = generateNegotiationScript({
			candidateName: "Alex",
			companyName: "Acme Corp",
			roleTitle: "Senior Engineer",
			currentOffer: offerA,
			targetBaseSalary: 165000,
			type: "counter-offer",
		});
		expect(script).toContain("Alex");
		expect(script).toContain("Acme Corp");
		expect(script).toContain("$165,000");
	});

	it("generates competing-offer email highlighting higher compensation", () => {
		const script = generateNegotiationScript({
			candidateName: "Alex",
			companyName: "Acme Corp",
			roleTitle: "Senior Engineer",
			currentOffer: offerA,
			competingOffer: offerB,
			type: "competing-offer",
		});
		expect(script).toContain("Beta Tech");
		expect(script).toContain("Acme Corp");
		expect(script).toContain("immediately sign");
	});
});
