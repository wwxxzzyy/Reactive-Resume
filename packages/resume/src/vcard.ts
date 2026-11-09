import type { ResumeData } from "@reactive-resume/schema/resume/data";

/** Escapes special characters for vCard text fields per RFC 2426 / RFC 6350. */
function escapeVCard(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export type VCardOptions = {
	url?: string;
	note?: string;
};

/**
 * Builds a standards-compliant vCard (3.0) string from resume basics.
 * When scanned by phone cameras or imported into Contacts apps,
 * this automatically opens the "Add Contact" interface.
 */
export function buildVCard(basics: ResumeData["basics"], options?: VCardOptions): string {
	const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

	const name = basics.name?.trim();
	if (name) {
		lines.push(`FN:${escapeVCard(name)}`);
		// Split into Given and Family names if space is present
		const parts = name.split(/\s+/);
		if (parts.length > 1) {
			const family = parts.slice(1).join(" ");
			const given = parts[0] ?? "";
			lines.push(`N:${escapeVCard(family)};${escapeVCard(given)};;;`);
		} else {
			lines.push(`N:${escapeVCard(name)};;;;`);
		}
	}

	const headline = basics.headline?.trim();
	if (headline) {
		lines.push(`TITLE:${escapeVCard(headline)}`);
	}

	const email = basics.email?.trim();
	if (email) {
		lines.push(`EMAIL;TYPE=INTERNET:${email}`);
	}

	const phone = basics.phone?.trim();
	if (phone) {
		lines.push(`TEL;TYPE=CELL:${phone}`);
	}

	const location = basics.location?.trim();
	if (location) {
		lines.push(`ADR;TYPE=HOME:;;;${escapeVCard(location)};;;`);
	}

	const website = options?.url || basics.website?.url?.trim() || "";
	if (website) {
		lines.push(`URL:${website}`);
	}

	const note = options?.note?.trim();
	if (note) {
		lines.push(`NOTE:${escapeVCard(note)}`);
	}

	lines.push("END:VCARD");
	return lines.join("\r\n");
}

/** Convenience wrapper that accepts full ResumeData */
export function generateVCard(data: ResumeData, options?: VCardOptions): string {
	return buildVCard(data.basics, options);
}
