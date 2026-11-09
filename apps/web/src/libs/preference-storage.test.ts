import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
// @vitest-environment happy-dom
import Cookies from "js-cookie";
import { getLocale } from "./locale";
import { getTheme, setThemeCookie } from "./theme";

describe("explicit browser preferences", () => {
	beforeEach(() => {
		Cookies.remove("locale");
		Cookies.remove("theme");
		window.history.replaceState(null, "", "/");
	});

	it("retains en-US language in English-only mode", () => {
		window.history.replaceState(null, "", "/?locale=de-DE");
		expect(getLocale()).toBe("en-US");
		window.history.replaceState(null, "", "/dashboard");
		expect(getLocale()).toBe("en-US");
	});

	it("saves explicit theme through real cookies", () => {
		const writes = vi.spyOn(document, "cookie", "set");
		setThemeCookie("dark");
		expect(getTheme()).toBe("dark");
		expect(writes.mock.calls.at(-1)?.[0]).toMatch(/expires=/i);
	});
});
