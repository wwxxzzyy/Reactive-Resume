import { createHmac } from "node:crypto";
import { describe, expect, it } from "vite-plus/test";
import { stripeService } from "./stripe";

describe("stripeService.verifyWebhookSignature", () => {
	const secret = "whsec_test_secret_12345";

	it("returns false when header or secret is missing", () => {
		expect(stripeService.verifyWebhookSignature("{}", null)).toBe(false);
	});

	it("validates authentic signatures within timestamp tolerance", () => {
		process.env.STRIPE_WEBHOOK_SECRET = secret;
		const payload = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
		const timestamp = Math.floor(Date.now() / 1000);
		const signedPayload = `${timestamp}.${payload}`;
		const sig = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
		const header = `t=${timestamp},v1=${sig}`;

		expect(stripeService.verifyWebhookSignature(payload, header)).toBe(true);
	});

	it("rejects tampered payloads", () => {
		process.env.STRIPE_WEBHOOK_SECRET = secret;
		const payload = JSON.stringify({ id: "evt_123" });
		const timestamp = Math.floor(Date.now() / 1000);
		const signedPayload = `${timestamp}.${payload}`;
		const sig = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
		const header = `t=${timestamp},v1=${sig}`;

		expect(stripeService.verifyWebhookSignature('{"tampered":true}', header)).toBe(false);
	});

	it("rejects timestamps older than 5 minutes", () => {
		process.env.STRIPE_WEBHOOK_SECRET = secret;
		const payload = JSON.stringify({ id: "evt_123" });
		const expiredTimestamp = Math.floor(Date.now() / 1000) - 301;
		const signedPayload = `${expiredTimestamp}.${payload}`;
		const sig = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
		const header = `t=${expiredTimestamp},v1=${sig}`;

		expect(stripeService.verifyWebhookSignature(payload, header)).toBe(false);
	});
});
