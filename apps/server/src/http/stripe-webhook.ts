import type { Context } from "hono";
import { creditsService, stripeService } from "@reactive-resume/api/features/credits";

export async function handleStripeWebhook(c: Context) {
	const rawBody = await c.req.text();
	const signature = c.req.header("stripe-signature") ?? null;

	// Verify webhook signature
	if (!stripeService.verifyWebhookSignature(rawBody, signature)) {
		return c.json(
			{
				error: "Invalid or missing Stripe webhook signature.",
			},
			400,
		);
	}

	try {
		const event = JSON.parse(rawBody) as {
			type: string;
			data?: {
				object?: {
					id: string;
					client_reference_id?: string | null;
					payment_intent?: string | null;
					amount_total?: number | null;
					currency?: string | null;
					metadata?: Record<string, string> | null;
				};
			};
		};

		if (event.type === "checkout.session.completed") {
			const session = event.data?.object;
			if (session?.id) {
				const result = await creditsService.handleStripeCheckoutCompleted(session);
				return c.json({ received: true, result });
			}
		}

		return c.json({ received: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to process Stripe webhook.";
		return c.json({ error: message }, 500);
	}
}
