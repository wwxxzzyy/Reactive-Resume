import type { ResumeData } from "@reactive-resume/schema/resume/data";
import { describe, expect, it } from "vite-plus/test";
import { extractJobKeywords, matchResumeWithJob } from "./ats-match";

const sampleResume = {
	basics: {
		name: "Alex Morgan",
		headline: "Senior Full Stack Engineer",
		email: "alex@example.com",
		phone: "123-456-7890",
		location: "San Francisco, CA",
		website: { url: "https://alex.dev", label: "Portfolio" },
		customFields: [],
	},
	summary: {
		title: "Summary",
		columns: 1,
		hidden: false,
		content: "Experienced software engineer with expertise in TypeScript, React, and PostgreSQL.",
	},
	sections: {
		experience: {
			title: "Experience",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "exp-1",
					hidden: false,
					company: "TechCorp",
					position: "Senior Engineer",
					location: "Remote",
					period: "2021 - Present",
					website: { url: "", label: "", inlineLink: false },
					description:
						"Built scalable web applications using TypeScript, Node.js, and Docker. Implemented CI/CD pipelines.",
				},
			],
		},
		skills: {
			title: "Skills",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "skill-1",
					hidden: false,
					name: "Web Development",
					proficiency: "Expert",
					icon: "",
					iconColor: "",
					level: 5,
					keywords: ["TypeScript", "React", "Node.js", "Docker", "PostgreSQL"],
				},
			],
		},
		education: {
			title: "Education",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "edu-1",
					hidden: false,
					school: "Stanford University",
					degree: "Bachelor of Science",
					area: "Computer Science",
					grade: "3.9",
					location: "Stanford, CA",
					period: "2015 - 2019",
					website: { url: "", label: "", inlineLink: false },
					description: "",
				},
			],
		},
		projects: { title: "Projects", columns: 1, hidden: false, items: [] },
		certifications: { title: "Certifications", columns: 1, hidden: false, items: [] },
		volunteer: { title: "Volunteer", columns: 1, hidden: false, items: [] },
		interests: { title: "Interests", columns: 1, hidden: false, items: [] },
		awards: { title: "Awards", columns: 1, hidden: false, items: [] },
		languages: { title: "Languages", columns: 1, hidden: false, items: [] },
		publications: { title: "Publications", columns: 1, hidden: false, items: [] },
		references: { title: "References", columns: 1, hidden: false, items: [] },
	},
	metadata: {} as ResumeData["metadata"],
} as unknown as ResumeData;

describe("extractJobKeywords", () => {
	it("extracts technical skills, credentials, and soft skills from job text", () => {
		const jd = `
			We are looking for a Senior Software Engineer with strong TypeScript and React experience.
			Knowledge of Kubernetes, Docker, and AWS is required.
			Candidates must have a Bachelor in Computer Science and experience with Agile and system design.
		`;
		const keywords = extractJobKeywords(jd);
		expect(keywords.has("typescript")).toBe(true);
		expect(keywords.has("react")).toBe(true);
		expect(keywords.has("kubernetes")).toBe(true);
		expect(keywords.has("docker")).toBe(true);
		expect(keywords.has("aws")).toBe(true);
		expect(keywords.has("bachelor")).toBe(true);
		expect(keywords.has("computer science")).toBe(true);
		expect(keywords.has("agile")).toBe(true);
	});
});

describe("matchResumeWithJob", () => {
	it("returns 100 for empty job description with guidance recommendation", () => {
		const res = matchResumeWithJob(sampleResume, "");
		expect(res.score).toBe(100);
		expect(res.totalJobKeywords).toBe(0);
		expect(res.recommendations[0]).toContain("Paste a job description");
	});

	it("identifies matched and missing keywords correctly", () => {
		const jd = `
			Required Skills:
			- TypeScript, React, and Node.js
			- Docker containerization
			- Kubernetes orchestration (Must have)
			- AWS cloud infrastructure (Must have)
			- Bachelor degree in Computer Science
		`;
		const result = matchResumeWithJob(sampleResume, jd);

		// Matched keywords should include typescript, react, node.js, docker, bachelor, computer science
		const matchedWords = result.matchedKeywords.map((k) => k.keyword);
		expect(matchedWords).toContain("typescript");
		expect(matchedWords).toContain("react");
		expect(matchedWords).toContain("docker");
		expect(matchedWords).toContain("bachelor");

		// Missing keywords should include kubernetes and aws
		const missingWords = result.missingKeywords.map((k) => k.keyword);
		expect(missingWords).toContain("kubernetes");
		expect(missingWords).toContain("aws");

		expect(result.score).toBeGreaterThan(40);
		expect(result.score).toBeLessThan(100);
		expect(result.recommendations.length).toBeGreaterThan(0);
	});

	it("returns high score when resume covers all requirements", () => {
		const jd = `
			Requirements:
			- TypeScript and React development
			- PostgreSQL database experience
			- Bachelor in Computer Science
		`;
		const result = matchResumeWithJob(sampleResume, jd);
		expect(result.score).toBe(100);
		expect(result.missingKeywords.length).toBe(0);
		expect(result.recommendations[0]).toContain("Strong ATS alignment");
	});
});
