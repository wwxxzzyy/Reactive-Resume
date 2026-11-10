import { describe, expect, it } from "vite-plus/test";
import { createElement } from "react";
import { render } from "react-email";
import { ResetPasswordEmail, VerifyEmail, VerifyEmailChange } from "./templates/auth";

describe("Email Templates Rendering", () => {
	it("renders VerifyEmail template to html and text without error", async () => {
		const elem = createElement(VerifyEmail, { url: "https://dippergo.com/api/auth/verify-email?token=xyz" });
		const html = await render(elem);
		const text = await render(elem, { plainText: true });

		expect(html).toContain("Verify your email");
		expect(html).toContain("DipperGo");
		expect(html).toContain("https://dippergo.com/api/auth/verify-email?token=xyz");
		expect(text).toContain("DipperGo");
	});

	it("renders ResetPasswordEmail template to html and text without error", async () => {
		const elem = createElement(ResetPasswordEmail, { url: "https://dippergo.com/auth/reset-password?token=xyz" });
		const html = await render(elem);
		expect(html).toContain("Reset your password");
		expect(html).toContain("DipperGo");
	});

	it("renders VerifyEmailChange template to html and text without error", async () => {
		const elem = createElement(VerifyEmailChange, {
			url: "https://dippergo.com/auth/verify-email-change?token=xyz",
			previousEmail: "old@example.com",
			newEmail: "new@example.com",
		});
		const html = await render(elem);
		expect(html).toContain("Approve email change");
		expect(html).toContain("old@example.com");
		expect(html).toContain("new@example.com");
	});
});
