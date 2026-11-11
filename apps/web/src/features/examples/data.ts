export type ResumeRoleExample = {
	id: string;
	title: string;
	shortTitle: string;
	category: string;
	salaryRange: string;
	templateId: string;
	templateName: string;
	keywords: string[];
	summary: string;
	highlights: string[];
	atsAdvice: string;
	commonPitfalls: string;
};

export const RESUME_ROLE_EXAMPLES: ResumeRoleExample[] = [
	{
		id: "software-engineer",
		title: "Software Engineer / Full Stack Developer",
		shortTitle: "Software Engineer",
		category: "Engineering & Tech",
		salaryRange: "$115,000 – $170,000",
		templateId: "azurill",
		templateName: "Azurill (Single Column)",
		keywords: [
			"TypeScript",
			"React",
			"Node.js",
			"Python",
			"Docker",
			"AWS",
			"PostgreSQL",
			"REST APIs",
			"Microservices",
			"CI/CD",
			"Git",
			"Distributed Systems",
		],
		summary:
			"Full-stack software engineer with 4+ years of experience designing and scaling distributed web applications and high-throughput microservices. Proven track record reducing API response latency by 42% and architecting fault-tolerant cloud backends serving 500k+ daily active users.",
		highlights: [
			"Architected and deployed event-driven payment processing microservices handling 2M+ daily transactions with 99.99% uptime.",
			"Refactored React SPA state management and bundle chunking, improving Core Web Vitals LCP by 1.8s and reducing bounce rate by 24%.",
			"Designed automated CI/CD deployment pipelines on AWS ECS and Docker, reducing release cycle times from 4 hours to 12 minutes.",
			"Mentored 4 junior engineers on test-driven development (TDD), boosting unit and integration test coverage from 61% to 92%.",
		],
		atsAdvice:
			"Applicant tracking systems look for specific programming languages, frameworks, and deployment tools mentioned directly in context alongside measurable engineering achievements.",
		commonPitfalls:
			"Avoid listing tech skills in unparseable graphic skill bars or tables. Use simple comma-separated technical skill categories and quantify your achievements with numbers and percentages.",
	},
	{
		id: "product-manager",
		title: "Technical Product Manager",
		shortTitle: "Product Manager",
		category: "Product & Strategy",
		salaryRange: "$125,000 – $180,000",
		templateId: "ditto",
		templateName: "Ditto (Dual Column)",
		keywords: [
			"Product Roadmap",
			"A/B Testing",
			"User Research",
			"Agile / Scrum",
			"GTM Strategy",
			"OKRs & KPIs",
			"Stakeholder Management",
			"Data Telemetry",
			"SQL",
			"Feature Prioritization",
		],
		summary:
			"Data-driven Product Manager with 5+ years of experience steering cross-functional agile squads from 0-to-1 concept through international launch. Skilled in user journey mapping, quantitative telemetry, and customer retention strategies resulting in 38% ARR growth.",
		highlights: [
			"Led end-to-end launch of self-serve enterprise onboarding workflow, lifting user conversion rate by 31% within 90 days of release.",
			"Defined North Star metric and operational OKRs for a 14-person engineering and design squad, delivering 6 major quarterly releases on schedule.",
			"Conducted 45+ customer discovery interviews and analyzed behavioral cohort funnels to reduce 30-day user churn by 18%.",
			"Championed rigorous A/B experimentation culture, running 24 growth experiments yielding an incremental $1.4M in annualized revenue.",
		],
		atsAdvice:
			"ATS parsers search for ownership words (led, launched, drove) paired with business metrics ($ revenue, % retention, conversion gains, user growth).",
		commonPitfalls:
			"Describing features built rather than customer impact delivered. Every bullet point should answer 'why did this matter to the business?'.",
	},
	{
		id: "data-analyst",
		title: "Data Analyst & Business Intelligence Specialist",
		shortTitle: "Data Analyst",
		category: "Data & Analytics",
		salaryRange: "$85,000 – $130,000",
		templateId: "lapras",
		templateName: "Lapras (Compact Sidebar)",
		keywords: [
			"SQL",
			"Python",
			"Tableau",
			"Power BI",
			"Data Modeling",
			"ETL Pipelines",
			"Statistical Analysis",
			"A/B Testing",
			"Snowflake",
			"Excel Modeling",
			"BigQuery",
		],
		summary:
			"Detail-oriented Data Analyst with 3+ years of expertise translating complex multi-source datasets into actionable executive dashboards. Expert in automated SQL pipelines, statistical regression, and business intelligence reporting for executive leadership.",
		highlights: [
			"Built automated daily financial reconciliations in SQL and dbt, saving 15 finance team hours weekly and eliminating manual spreadsheet reporting errors.",
			"Designed interactive executive Tableau dashboards tracking customer acquisition cost (CAC) and lifetime value (LTV) across 8 global marketing channels.",
			"Formulated predictive customer churn models using Python (pandas, scikit-learn), identifying high-risk enterprise accounts with 84% accuracy.",
			"Standardized company data dictionary and SQL metrics across 6 departments, resolving conflicting revenue definitions and reporting drift.",
		],
		atsAdvice:
			"Highlight concrete data stack tools (SQL, Tableau, Python, Snowflake) in both your Skills section and Work Experience bullets.",
		commonPitfalls:
			"Listing vague queries or charts instead of automated reporting workflows, pipeline efficiency gains, and business decisions influenced.",
	},
	{
		id: "registered-nurse",
		title: "Registered Nurse (RN) – Acute Care & Telemetry",
		shortTitle: "Registered Nurse",
		category: "Healthcare & Clinical",
		salaryRange: "$80,000 – $120,000",
		templateId: "pikachu",
		templateName: "Pikachu (Classic Medical)",
		keywords: [
			"Patient Care",
			"BLS / ACLS Certified",
			"Epic / Cerner EHR",
			"Triage & Vitals",
			"Care Plans",
			"Medication Administration",
			"HIPAA Compliance",
			"IV Therapy",
			"Patient Advocacy",
		],
		summary:
			"Compassionate, board-certified Registered Nurse (BSN, RN) with 4+ years of fast-paced acute care and telemetry floor experience. Dedicated to evidence-based clinical protocols, seamless interdisciplinary coordination, and exceptional patient satisfaction scores.",
		highlights: [
			"Managed direct clinical care for 5–6 telemetry patients per shift, administering medications and IV therapy with zero adverse events over 3 consecutive years.",
			"Documented comprehensive clinical assessments and rapid intervention protocols in Epic EHR adhering strictly to Joint Commission and HIPAA standards.",
			"Mentored 8 newly graduated nurses during clinical preceptorships, focusing on emergency bedside triage and patient-family communication.",
			"Spearheaded department unit safety committee, implementing fall-reduction checklist that dropped patient falls by 34% annually.",
		],
		atsAdvice:
			"Hospital ATS systems (Taleo, iCIMS, Workday) verify credentials first: put degrees (BSN), licenses (RN State License #), and certifications (BLS, ACLS) near the top.",
		commonPitfalls:
			"Leaving off state license numbers or EHR software experience (Epic, Cerner). Hospital recruiters filter by EHR familiarity.",
	},
	{
		id: "project-manager",
		title: "Project Manager (PMP / Agile)",
		shortTitle: "Project Manager",
		category: "Operations & Leadership",
		salaryRange: "$95,000 – $145,000",
		templateId: "gengar",
		templateName: "Gengar (Executive Split)",
		keywords: [
			"PMP Certified",
			"Risk Management",
			"Budget Control",
			"Cross-Functional Teams",
			"Resource Allocation",
			"Jira / Confluence",
			"Scope Management",
			"Process Optimization",
		],
		summary:
			"PMP-certified Project Manager with 6+ years driving enterprise technical implementations, system migrations, and operational transformations on time and within budget. Proven ability to align executives, technical engineers, and external vendors.",
		highlights: [
			"Delivered $3.2M enterprise ERP migration across 4 regional branches 3 weeks ahead of schedule and 6% under initial allocated budget.",
			"Standardized agile sprint ceremonies and risk mitigation frameworks across 5 departments, eliminating 28% of project milestone blockers.",
			"Negotiated SLAs with 12 external third-party software vendors, realizing $140K in annual contract cost efficiencies.",
			"Implemented automated milestone reporting dashboards in Jira, reducing executive status briefing preparation time by 60%.",
		],
		atsAdvice:
			"Include budget numbers ($), team sizes, and project methodology certifications (PMP, CSM, Lean Six Sigma) prominently.",
		commonPitfalls:
			"Using ambiguous descriptions like 'assisted with project'. Use direct action verbs like 'budgeted', 'directed', 'executed', and 'delivered'.",
	},
	{
		id: "entry-level",
		title: "College Graduate / Entry-Level Professional",
		shortTitle: "Entry-Level / Graduate",
		category: "General & Early Career",
		salaryRange: "$55,000 – $85,000",
		templateId: "azurill",
		templateName: "Azurill (Clean Education First)",
		keywords: [
			"Relevant Coursework",
			"Academic Projects",
			"Team Collaboration",
			"Problem Solving",
			"Time Management",
			"Research & Analysis",
			"Quick Learner",
			"Internship Experience",
		],
		summary:
			"Driven, high-achieving graduate (B.S. Magna Cum Laude) with hands-on internship experience, strong analytical foundations, and demonstrated leadership across collegiate projects. Eager to bring adaptability, technical curiosity, and strong work ethic to a fast-growing team.",
		highlights: [
			"Collaborated with a 4-person team to research, develop, and present a capstone web application serving 1,200 student users during campus testing.",
			"Completed 12-week summer internship supporting operations and customer data auditing, achieving 99.4% record accuracy.",
			"Served as Vice President of Student Association, coordinating 8 campus workshops and managing a $12,000 annual event budget.",
			"Authored 35-page undergraduate research paper on algorithmic efficiency, presented at annual regional student engineering symposium.",
		],
		atsAdvice:
			"When you have less work experience, place your Education, GPA (if > 3.5), Dean's List honors, and Academic Capstone Projects before Work Experience.",
		commonPitfalls:
			"Writing an outdated 'Objective' statement. Replace it with a strong 3-sentence Professional Summary that states your degree, top strengths, and what value you offer.",
	},
];

export const EXAMPLE_FAQS = [
	{
		question: "How do applicant tracking systems (ATS) screen resumes?",
		answer:
			"ATS software like Workday, Taleo, Greenhouse, and Lever scans resume files to extract candidate contact details, work history, education, and specific role skills. It scores resumes by matching your bullet points and skills against the job posting requirements.",
	},
	{
		question: "How many keywords should I include in an ATS-friendly resume?",
		answer:
			"Aim for 8 to 15 relevant technical and role-specific keywords naturally embedded within your work experience bullet points and skills section. Avoid 'keyword stuffing' (hidden or repetitive words), as modern ATS algorithms and human recruiters detect and penalize artificial lists.",
	},
	{
		question: "Can I customize these resume examples for free on DipperGo?",
		answer:
			"Yes! DipperGo is 100% free and open-source. You can load any recruiter-approved template, edit your experience, test your score with the ATS checker, and download vector PDF and Word DOCX files with zero paywalls or subscriptions.",
	},
	{
		question: "Should I download my resume as PDF or Word (DOCX)?",
		answer:
			"Both formats are fully supported. High-resolution vector PDF is recommended for 95% of job submissions because it guarantees exact visual formatting across all devices. If an employer application explicitly states 'Word document only', DipperGo includes 1-click DOCX export.",
	},
];
