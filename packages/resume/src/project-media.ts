export type MediaPlatform =
	| "github"
	| "gitlab"
	| "figma"
	| "dribbble"
	| "youtube"
	| "loom"
	| "app-store"
	| "play-store"
	| "medium"
	| "website";

export type ProjectMediaBadge = {
	url: string;
	platform: MediaPlatform;
	label: string;
	icon: string;
	displayHost: string;
};

export function detectProjectMedia(rawUrl: string): ProjectMediaBadge {
	const trimmed = rawUrl.trim();
	let parsedUrl: URL | null = null;

	try {
		parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
	} catch {
		return {
			url: rawUrl,
			platform: "website",
			label: "Project Link",
			icon: "globe",
			displayHost: rawUrl,
		};
	}

	const host = parsedUrl.hostname.toLowerCase();
	const path = parsedUrl.pathname;

	if (host.includes("github.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "github",
			label: "GitHub Repository",
			icon: "github-logo",
			displayHost: `github.com${path}`,
		};
	}

	if (host.includes("gitlab.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "gitlab",
			label: "GitLab Repository",
			icon: "gitlab-logo",
			displayHost: `gitlab.com${path}`,
		};
	}

	if (host.includes("figma.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "figma",
			label: "Figma Prototype",
			icon: "figma-logo",
			displayHost: "figma.com",
		};
	}

	if (host.includes("dribbble.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "dribbble",
			label: "Dribbble Shots",
			icon: "dribbble-logo",
			displayHost: "dribbble.com",
		};
	}

	if (host.includes("youtube.com") || host.includes("youtu.be")) {
		return {
			url: parsedUrl.toString(),
			platform: "youtube",
			label: "YouTube Video Demo",
			icon: "youtube-logo",
			displayHost: "youtube.com",
		};
	}

	if (host.includes("loom.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "loom",
			label: "Loom Walkthrough",
			icon: "video-camera",
			displayHost: "loom.com",
		};
	}

	if (host.includes("apps.apple.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "app-store",
			label: "iOS App Store",
			icon: "app-store-logo",
			displayHost: "apps.apple.com",
		};
	}

	if (host.includes("play.google.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "play-store",
			label: "Google Play Store",
			icon: "google-play-logo",
			displayHost: "play.google.com",
		};
	}

	if (host.includes("medium.com")) {
		return {
			url: parsedUrl.toString(),
			platform: "medium",
			label: "Technical Case Study",
			icon: "medium-logo",
			displayHost: "medium.com",
		};
	}

	return {
		url: parsedUrl.toString(),
		platform: "website",
		label: "Live Demo / Site",
		icon: "globe",
		displayHost: host.replace(/^www\./, ""),
	};
}
