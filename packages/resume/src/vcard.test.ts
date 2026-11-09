import { describe, expect, it } from "vite-plus/test";
import { sampleResumeData } from "@reactive-resume/schema/resume/sample";
import { buildVCard } from "./vcard";

describe("buildVCard", () => {
	it("generates a valid vCard 3.0 string with all standard contact fields", () => {
		const vcard = buildVCard(sampleResumeData.basics, { url: "https://rxresu.me/john/dev" });

		expect(vcard).toContain("BEGIN:VCARD");
		expect(vcard).toContain("VERSION:3.0");
		expect(vcard).toContain(`FN:${sampleResumeData.basics.name}`);
		expect(vcard).toContain(`EMAIL;TYPE=INTERNET:${sampleResumeData.basics.email}`);
		expect(vcard).toContain(`TEL;TYPE=CELL:${sampleResumeData.basics.phone}`);
		expect(vcard).toContain("URL:https://rxresu.me/john/dev");
		expect(vcard).toContain("END:VCARD");
	});

	it("escapes special characters correctly in vCard fields", () => {
		const vcard = buildVCard({
			...sampleResumeData.basics,
			name: "Smith, John; Jr.",
			location: "San Francisco, CA; USA",
		});

		expect(vcard).toContain("FN:Smith\\, John\\; Jr.");
		expect(vcard).toContain("ADR;TYPE=HOME:;;;San Francisco\\, CA\\; USA;;;");
	});

	it("handles minimal basics gracefully", () => {
		const vcard = buildVCard({
			name: "Jane",
			headline: "",
			email: "",
			phone: "",
			location: "",
			url: { label: "", url: "" },
			customFields: [],
			picture: { hidden: true, fit: "cover", url: "", size: 64 },
		});

		expect(vcard).toContain("BEGIN:VCARD");
		expect(vcard).toContain("FN:Jane");
		expect(vcard).toContain("N:Jane;;;;");
		expect(vcard).toContain("END:VCARD");
	});
});
