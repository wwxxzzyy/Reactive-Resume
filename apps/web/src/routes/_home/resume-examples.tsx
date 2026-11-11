import { createFileRoute } from "@tanstack/react-router";
import { ResumeExamplesPage } from "@/features/examples/page";
import { getResumeExamplesMeta } from "@/libs/seo";

export const Route = createFileRoute("/_home/resume-examples")({
	component: ResumeExamplesPage,
	head: () => {
		const { title, description } = getResumeExamplesMeta();
		return { meta: [{ title }, { name: "description", content: description }] };
	},
});
