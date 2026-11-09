import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const cookies = vi.hoisted(() => ({ get: vi.fn<() => string | undefined>(), set: vi.fn() }));
vi.mock("js-cookie", () => ({ default: cookies }));

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe("locale choices (English only mode)", () => {
	it("retains en-US when trying to switch locale in English-only mode", async () => {
		vi.resetModules();
		const { changeLocale, getLocale, selectableLocales } = await import("./locale");
		const replaceState = vi.fn();
		const reload = vi.fn();
		const state = { key: "page" };
		vi.stubGlobal("window", {
			location: { href: "https://rxresu.me/?locale=zu-ZA&filter=one#section", search: "", reload },
			history: { state, replaceState },
		});

		expect(selectableLocales).toEqual(["en-US"]);
		expect(getLocale()).toBe("en-US");

		changeLocale("zu-ZA");
		expect(cookies.set).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("always returns en-US regardless of stored cookie or query param", async () => {
		vi.resetModules();
		const { getLocale, getLocaleMessages } = await import("./locale");

		vi.stubGlobal("window", { location: { search: "" } });
		cookies.get.mockReturnValue("de-DE");
		expect(getLocale()).toBe("en-US");
		expect((await getLocaleMessages(getLocale())).locale).toBe("en-US");

		window.location.search = "?locale=zh-CN";
		expect(getLocale()).toBe("en-US");
	});
});
