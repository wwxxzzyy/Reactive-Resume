// @vitest-environment happy-dom
// @vitest-environment-options {"url":"https://localhost:3000"}

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import Cookies from "js-cookie";
import { changeLocale, getLocale } from "./locale";

beforeEach(() => {
	Cookies.remove("locale");
	vi.spyOn(window.location, "reload").mockImplementation(() => {});
});

afterEach(() => {
	Cookies.remove("locale");
	vi.restoreAllMocks();
});

describe("locale in English-only mode", () => {
	it("always returns en-US and ignores changeLocale attempts", () => {
		const state = { key: "current-page" };
		window.history.replaceState(state, "", `/resume-templates?filter=modern&locale=de-DE&tag=one#gallery`);
		expect(getLocale()).toBe("en-US");

		changeLocale("de-DE");

		expect(getLocale()).toBe("en-US");
		expect(window.location.reload).not.toHaveBeenCalled();
		expect(Cookies.get("locale")).toBeUndefined();
	});

	it("returns en-US when cookie is set to another language", () => {
		Cookies.set("locale", "zh-CN");
		expect(getLocale()).toBe("en-US");
	});

	it.each([null, "", "invalid"])("ignores invalid selection %s", (value) => {
		changeLocale(value);
		expect(getLocale()).toBe("en-US");
	});
});
