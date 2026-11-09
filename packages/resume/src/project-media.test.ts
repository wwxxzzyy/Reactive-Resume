import { describe, expect, it } from "vite-plus/test";
import { detectProjectMedia } from "./project-media";

describe("detectProjectMedia", () => {
	it("detects GitHub repository links", () => {
		const badge = detectProjectMedia("https://github.com/dippergo/resume");
		expect(badge.platform).toBe("github");
		expect(badge.label).toBe("GitHub Repository");
		expect(badge.icon).toBe("github-logo");
	});

	it("detects Figma prototypes", () => {
		const badge = detectProjectMedia("https://www.figma.com/design/xyz123");
		expect(badge.platform).toBe("figma");
		expect(badge.label).toBe("Figma Prototype");
	});

	it("detects YouTube and Loom video walkthroughs", () => {
		const yt = detectProjectMedia("https://youtu.be/dQw4w9WgXcQ");
		expect(yt.platform).toBe("youtube");
		expect(yt.label).toBe("YouTube Video Demo");

		const loom = detectProjectMedia("https://www.loom.com/share/abc12345");
		expect(loom.platform).toBe("loom");
		expect(loom.label).toBe("Loom Walkthrough");
	});

	it("handles generic website URLs gracefully", () => {
		const site = detectProjectMedia("https://dippergo.com");
		expect(site.platform).toBe("website");
		expect(site.displayHost).toBe("dippergo.com");
	});
});
