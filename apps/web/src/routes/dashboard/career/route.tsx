import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/career")({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard/applications", replace: true });
	},
});
