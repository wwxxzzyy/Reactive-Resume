import { cleanup, render, screen, within } from "@testing-library/react";
// @vitest-environment happy-dom
// @vitest-environment-options {"url":"https://localhost:3000"}
import { afterEach, expect, it, vi } from "vite-plus/test";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import Cookies from "js-cookie";
import { LanguageDoorway } from "./sections";
import { loadLocale } from "@/libs/locale";

afterEach(() => {
	cleanup();
	Cookies.remove("locale");
	vi.restoreAllMocks();
	window.history.replaceState(null, "", "/");
});

it("renders LanguageDoorway button with current language", async () => {
	await loadLocale("en-US");
	render(
		<I18nProvider i18n={i18n}>
			<LanguageDoorway />
		</I18nProvider>,
	);

	const button = screen.getByRole("button", { name: "Change language" });
	expect(button).toBeDefined();
	expect(within(button).getByText("English")).toBeDefined();
});
