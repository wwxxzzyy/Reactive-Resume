export function getTrustedOrigins(appUrl: string, additionalUrls: (string | undefined)[] = []): string[] {
	const trustedOrigins = new Set<string>();

	if (process.env.NODE_ENV !== "production") {
		trustedOrigins.add("http://localhost:3000");
		trustedOrigins.add("http://127.0.0.1:3000");
	}

	const urlsToProcess = [appUrl, ...additionalUrls.filter((u): u is string => Boolean(u))];

	for (const urlStr of urlsToProcess) {
		try {
			const parsed = new URL(urlStr);
			trustedOrigins.add(parsed.origin);

			if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
				const loopbackAlias = parsed.hostname === "localhost" ? "127.0.0.1" : "localhost";
				const loopbackUrl = new URL(parsed.toString());
				loopbackUrl.hostname = loopbackAlias;
				trustedOrigins.add(loopbackUrl.origin);
			} else {
				const hostname = parsed.hostname;
				const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith("[");
				if (!isIp) {
					if (hostname.startsWith("www.")) {
						const apexUrl = new URL(parsed.toString());
						apexUrl.hostname = hostname.slice(4);
						trustedOrigins.add(apexUrl.origin);
					} else if (hostname.split(".").length === 2) {
						// Apex domain (e.g. dippergo.com) -> also trust www.dippergo.com
						const wwwUrl = new URL(parsed.toString());
						wwwUrl.hostname = `www.${hostname}`;
						trustedOrigins.add(wwwUrl.origin);
					}
				}
			}
		} catch {
			// Ignore invalid URLs
		}
	}

	return [...trustedOrigins];
}
