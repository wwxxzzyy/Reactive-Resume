import type { ResumeData } from "@reactive-resume/schema/resume/data";

export type DiffKind = "added" | "removed" | "changed";

export type ResumeDiffItem = {
	section: string;
	kind: DiffKind;
	label: string;
	before?: string | null;
	after?: string | null;
	details?: string[];
};

export type ResumeDiffResult = {
	totalChanges: number;
	items: ResumeDiffItem[];
};

function getItemLabel(sectionKey: string, item: Record<string, unknown>): string {
	switch (sectionKey) {
		case "experience": {
			const pos = typeof item.position === "string" ? item.position.trim() : "";
			const company = typeof item.company === "string" ? item.company.trim() : "";
			if (pos && company) return `${pos} at ${company}`;
			return company || pos || "Experience entry";
		}
		case "education": {
			const degree = typeof item.degree === "string" ? item.degree.trim() : "";
			const school = typeof item.school === "string" ? item.school.trim() : "";
			if (degree && school) return `${degree}, ${school}`;
			return school || degree || "Education entry";
		}
		case "skills":
			return typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Skill entry";
		case "projects":
			return typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Project entry";
		case "awards":
		case "certifications":
		case "publications":
			return typeof item.title === "string" && item.title.trim() ? item.title.trim() : `${sectionKey} entry`;
		case "volunteer":
			return typeof item.organization === "string" && item.organization.trim()
				? item.organization.trim()
				: "Volunteer entry";
		case "languages":
			return typeof item.language === "string" && item.language.trim() ? item.language.trim() : "Language entry";
		case "interests":
			return typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Interest entry";
		case "references":
			return typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Reference entry";
		case "profiles": {
			const network = typeof item.network === "string" ? item.network.trim() : "";
			const username = typeof item.username === "string" ? item.username.trim() : "";
			if (network && username) return `${network} (${username})`;
			return network || username || "Profile entry";
		}
		default:
			return "Entry";
	}
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Computes semantic differences between a historical resume version snapshot (before)
 * and the current draft (after).
 */
export function diffResume(before: ResumeData, after: ResumeData): ResumeDiffResult {
	const items: ResumeDiffItem[] = [];

	// 1. Basics
	const basicFields: Array<{ key: keyof ResumeData["basics"]; label: string }> = [
		{ key: "name", label: "Full Name" },
		{ key: "headline", label: "Headline" },
		{ key: "email", label: "Email" },
		{ key: "phone", label: "Phone" },
		{ key: "location", label: "Location" },
	];

	for (const { key, label } of basicFields) {
		const bVal = (before.basics[key] ?? "").toString().trim();
		const aVal = (after.basics[key] ?? "").toString().trim();
		if (bVal !== aVal) {
			items.push({
				section: "Basics",
				kind: "changed",
				label,
				before: bVal || null,
				after: aVal || null,
			});
		}
	}

	// 2. Summary
	const bSummary = stripHtml(before.summary?.content ?? "");
	const aSummary = stripHtml(after.summary?.content ?? "");
	if (bSummary !== aSummary) {
		items.push({
			section: "Summary",
			kind: "changed",
			label: "Summary Text",
			before: bSummary.slice(0, 100) + (bSummary.length > 100 ? "…" : ""),
			after: aSummary.slice(0, 100) + (aSummary.length > 100 ? "…" : ""),
		});
	}

	// 3. Sections
	const sectionKeys = Object.keys(after.sections) as Array<keyof ResumeData["sections"]>;
	for (const key of sectionKeys) {
		const bSec = before.sections[key];
		const aSec = after.sections[key];
		if (!bSec || !aSec) continue;

		const bItems = (bSec.items as Array<Record<string, unknown> & { id: string }>) ?? [];
		const aItems = (aSec.items as Array<Record<string, unknown> & { id: string }>) ?? [];

		const bMap = new Map(bItems.map((item) => [item.id, item]));
		const aMap = new Map(aItems.map((item) => [item.id, item]));

		const sectionTitle = aSec.title?.trim() || key;

		// Added items
		for (const aItem of aItems) {
			if (!bMap.has(aItem.id)) {
				items.push({
					section: sectionTitle,
					kind: "added",
					label: getItemLabel(key, aItem),
				});
			}
		}

		// Removed items
		for (const bItem of bItems) {
			if (!aMap.has(bItem.id)) {
				items.push({
					section: sectionTitle,
					kind: "removed",
					label: getItemLabel(key, bItem),
				});
			}
		}

		// Modified items
		for (const aItem of aItems) {
			const bItem = bMap.get(aItem.id);
			if (!bItem) continue;

			// Compare content ignoring metadata
			const changedFields: string[] = [];
			for (const prop of Object.keys(aItem)) {
				if (prop === "id" || prop === "hidden") continue;
				const bProp = JSON.stringify(bItem[prop]);
				const aProp = JSON.stringify(aItem[prop]);
				if (bProp !== aProp) {
					changedFields.push(prop);
				}
			}

			if (changedFields.length > 0) {
				items.push({
					section: sectionTitle,
					kind: "changed",
					label: getItemLabel(key, aItem),
					details: changedFields,
				});
			}
		}
	}

	// 4. Metadata (Template)
	if (before.metadata?.template !== after.metadata?.template) {
		items.push({
			section: "Design",
			kind: "changed",
			label: "Template",
			before: before.metadata.template,
			after: after.metadata.template,
		});
	}

	return {
		totalChanges: items.length,
		items,
	};
}
