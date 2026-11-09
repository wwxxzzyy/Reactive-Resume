import { describe, expect, it } from "vite-plus/test";
import { sampleResumeData } from "@reactive-resume/schema/resume/sample";
import { diffResume } from "./diff";

describe("diffResume", () => {
	it("returns 0 changes for identical resume data", () => {
		const result = diffResume(sampleResumeData, sampleResumeData);
		expect(result.totalChanges).toBe(0);
		expect(result.items).toHaveLength(0);
	});

	it("detects basic information changes", () => {
		const modified = {
			...sampleResumeData,
			basics: {
				...sampleResumeData.basics,
				name: "Jane Doe",
				headline: "Principal Engineer",
			},
		};

		const result = diffResume(sampleResumeData, modified);
		expect(result.totalChanges).toBe(2);
		expect(result.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ section: "Basics", kind: "changed", label: "Full Name", after: "Jane Doe" }),
				expect.objectContaining({ section: "Basics", kind: "changed", label: "Headline", after: "Principal Engineer" }),
			]),
		);
	});

	it("detects added, removed, and modified section items", () => {
		const before = JSON.parse(JSON.stringify(sampleResumeData));
		const after = JSON.parse(JSON.stringify(sampleResumeData));

		// Remove first experience
		const removedExp = after.sections.experience.items.shift();

		// Add new skill
		after.sections.skills.items.push({
			id: "skill-new-123",
			hidden: false,
			icon: "",
			iconColor: "",
			name: "Rust & WebAssembly",
			proficiency: "Expert",
			level: 5,
			keywords: ["systems", "wasm"],
		});

		// Modify first education
		if (after.sections.education.items[0]) {
			after.sections.education.items[0].degree = "Master of Science";
		}

		const result = diffResume(before, after);
		expect(result.totalChanges).toBeGreaterThanOrEqual(3);

		// Removed check
		expect(result.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					section: expect.any(String),
					kind: "removed",
					label: expect.stringContaining(removedExp.company || removedExp.position),
				}),
				expect.objectContaining({
					section: expect.any(String),
					kind: "added",
					label: "Rust & WebAssembly",
				}),
				expect.objectContaining({
					section: expect.any(String),
					kind: "changed",
					details: expect.arrayContaining(["degree"]),
				}),
			]),
		);
	});

	it("detects template changes", () => {
		const modified = {
			...sampleResumeData,
			metadata: {
				...sampleResumeData.metadata,
				template: "linear-mono" as const,
			},
		};

		const result = diffResume(sampleResumeData, modified);
		expect(result.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					section: "Design",
					kind: "changed",
					label: "Template",
					after: "linear-mono",
				}),
			]),
		);
	});
});
