import { Icon } from "@reactive-resume/ui/components/icon";

const FAQS = [
	{
		question: "Is DipperGo really free with no paywall?",
		answer:
			"Yes. Core resume creation, editing, all 12 recruiter-approved templates, vector PDF downloads, Microsoft Word (DOCX) exports, the ATS checker, and the job application tracker are 100% free forever. There are no forced watermarks, no trial expirations, and no credit card required.",
	},
	{
		question: "Will my resume get past Applicant Tracking Systems (ATS)?",
		answer:
			"Yes. Every template generates a clean text-based vector document with natural reading order, Unicode font encoding, and standard semantic headings (Experience, Education, Skills) required by Workday, Taleo, Greenhouse, and Lever. You can also scan your PDF anytime using our free in-browser ATS Checker.",
	},
	{
		question: "Which format is better for job applications: PDF or Word (DOCX)?",
		answer:
			"Most modern companies and tech firms prefer PDF because it locks fonts, layout geometry, and line breaks identically across all devices and operating systems. However, some staffing agencies and enterprise recruiters request editable Word DOCX files. DipperGo gives you 1-click instant downloads for both.",
	},
	{
		question: "How does the ATS Resume Checker work?",
		answer:
			"Our ATS checker runs 100% locally in your web browser. It extracts text and inspects character encoding, column order, contact placement, and keyword density using the same parsing logic as corporate ATS engines. Your file is never uploaded to any remote server or stored in a database.",
	},
	{
		question: "Can I import an existing resume or LinkedIn profile?",
		answer:
			"Yes. You can import any existing resume PDF, a LinkedIn data export, JSON Resume, or Reactive Resume backup. All your experience, education, and skills are parsed into structured fields so you can switch templates or edit immediately.",
	},
	{
		question: "Can I use AI to tailor my resume for each job posting?",
		answer:
			"Yes. DipperGo includes AI tools to score job description alignment, rewrite bullet points with quantifiable action verbs, and generate targeted cover letters. You can use free starter credits, top up pay-as-you-go credit packs, or connect your own API key (OpenAI, Anthropic Claude, Google Gemini, Ollama, DeepSeek) for unlimited free AI.",
	},
	{
		question: "Who can see my resume and personal data?",
		answer:
			"Only you. All documents and job tracking data remain private to your account by default. If you choose to share your resume with a recruiter or colleague, you can generate a public or password-protected sharing link and revoke it at any time.",
	},
];

export function FaqSection() {
	return (
		<section
			id="faq"
			aria-labelledby="faq-title"
			className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28"
		>
			<div className="mx-auto max-w-2xl text-center">
				<span className="font-martian text-xs font-semibold tracking-wider text-accent-text uppercase">
					Frequently Asked Questions
				</span>
				<h2 id="faq-title" className="font-anybody mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
					Everything you need to know about beating the ATS
				</h2>
				<p className="mt-3 text-sm text-ink-3 sm:text-base">
					Clear answers on templates, ATS parsing, formatting, downloads, and privacy.
				</p>
			</div>

			<div className="mt-12 space-y-3.5">
				{FAQS.map((faq, index) => (
					<details
						key={faq.question}
						open={index === 0}
						className="group rounded-xl border border-line bg-surface p-5 transition-colors focus-within:ring-1 focus-within:ring-accent hover:border-line-2"
					>
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink select-none">
							<span className="text-sm sm:text-base">{faq.question}</span>
							<span className="grid size-7 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-ink-3 transition-transform duration-200 group-open:rotate-180 group-open:text-ink">
								<Icon name="caret-down" className="size-4" />
							</span>
						</summary>
						<div className="mt-3.5 border-t border-line/60 pt-3.5 text-sm leading-relaxed text-ink-2">
							<p>{faq.answer}</p>
						</div>
					</details>
				))}
			</div>
		</section>
	);
}
