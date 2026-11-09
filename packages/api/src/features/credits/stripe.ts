import { createHmac, timingSafeEqual } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { env } from "@reactive-resume/env/server";
import { CREDIT_PACKS, type CreditPackId } from "./packs";

export const stripeService = {
	/**
	 * Returns true if Stripe secret key is configured.
	 */
	isConfigured(): boolean {
		return Boolean(env.STRIPE_SECRET_KEY);
	},

	/**
	 * Creates a Stripe Hosted Checkout Session for buying an AI credit pack.
	 */
	async createCheckoutSession(userId: string, userEmail: string | undefined, packId: CreditPackId) {
		const pack = CREDIT_PACKS.find((p) => p.id === packId);
		if (!pack) {
			throw new ORPCError("BAD_REQUEST", { message: "Invalid credit pack selected." });
		}

		const secretKey = env.STRIPE_SECRET_KEY;
		if (!secretKey) {
			throw new ORPCError("PRECONDITION_FAILED", {
				message:
					"Stripe payment gateway is not configured on this server. Please set STRIPE_SECRET_KEY in server environment.",
			});
		}

		const appUrl = (env.APP_URL || "https://dippergo.com").replace(/\/+$/, "");
		const successUrl = `${appUrl}/dashboard?payment=success&pack=${pack.id}&session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = `${appUrl}/dashboard?payment=cancelled`;

		const unitAmount = Math.round(pack.price * 100); // Amount in USD cents

		const params = new URLSearchParams();
		params.append("mode", "payment");
		params.append("success_url", successUrl);
		params.append("cancel_url", cancelUrl);
		params.append("client_reference_id", userId);
		params.append("payment_method_types[0]", "card");
		if (userEmail) {
			params.append("customer_email", userEmail);
		}

		// Line item
		params.append("line_items[0][quantity]", "1");
		params.append("line_items[0][price_data][currency]", "usd");
		params.append("line_items[0][price_data][unit_amount]", unitAmount.toString());
		params.append(
			"line_items[0][price_data][product_data][name]",
			`DipperGo - ${pack.name} (+${pack.credits} AI Credits)`,
		);
		params.append(
			"line_items[0][price_data][product_data][description]",
			`${pack.credits} permanent AI credits for resume tailoring, cover letters, and ATS scans.`,
		);

		// Metadata
		params.append("metadata[userId]", userId);
		params.append("metadata[packId]", pack.id);
		params.append("metadata[credits]", pack.credits.toString());

		const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${secretKey}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = "Failed to create Stripe Checkout session.";
			try {
				const errorJson = JSON.parse(errorText) as { error?: { message?: string } };
				if (errorJson.error?.message) {
					errorMessage = errorJson.error.message;
				}
			} catch {
				// use default fallback
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: errorMessage });
		}

		const session = (await response.json()) as { id: string; url: string };
		return {
			sessionId: session.id,
			url: session.url,
		};
	},

	/**
	 * Verifies Stripe Webhook HMAC-SHA256 signature against STRIPE_WEBHOOK_SECRET.
	 */
	verifyWebhookSignature(payload: string, header: string | null, customSecret?: string): boolean {
		const webhookSecret = customSecret ?? env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret || !header) return false;

		// Format: t=1492774577,v1=5257a869e7ecebeda32affa62cd493...
		const parts = header.split(",");
		let timestamp = "";
		const signatures: string[] = [];

		for (const part of parts) {
			const [key, value] = part.trim().split("=");
			if (key === "t") timestamp = value ?? "";
			if (key === "v1" && value) signatures.push(value);
		}

		if (!timestamp || signatures.length === 0) return false;

		// 5-minute tolerance check against replay attacks
		const time = Number.parseInt(timestamp, 10);
		if (Number.isNaN(time)) return false;
		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - time) > 300) {
			return false;
		}

		const signedPayload = `${timestamp}.${payload}`;
		const expectedSignature = createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");

		for (const sig of signatures) {
			if (
				sig.length === expectedSignature.length &&
				timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))
			) {
				return true;
			}
		}

		return false;
	},
};
