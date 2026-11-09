import type { ResumeData } from "@reactive-resume/schema/resume/data";

export type TargetLanguageCode = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ar" | "pt" | "it" | "nl" | "ru";

export const SUPPORTED_TRANSLATION_LANGUAGES: { code: TargetLanguageCode; name: string; nativeName: string }[] = [
	{ code: "en", name: "English", nativeName: "English" },
	{ code: "es", name: "Spanish", nativeName: "Español" },
	{ code: "fr", name: "French", nativeName: "Français" },
	{ code: "de", name: "German", nativeName: "Deutsch" },
	{ code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
	{ code: "ja", name: "Japanese", nativeName: "日本語" },
	{ code: "ar", name: "Arabic", nativeName: "العربية" },
	{ code: "pt", name: "Portuguese", nativeName: "Português" },
	{ code: "it", name: "Italian", nativeName: "Italiano" },
	{ code: "nl", name: "Dutch", nativeName: "Nederlands" },
	{ code: "ru", name: "Russian", nativeName: "Русский" },
];

export const SECTION_TRANSLATIONS: Record<string, Record<TargetLanguageCode, string>> = {
	experience: {
		en: "Work Experience",
		es: "Experiencia Laboral",
		fr: "Expérience Professionnelle",
		de: "Berufserfahrung",
		zh: "工作经历",
		ja: "職歴",
		ar: "الخبرة المهنية",
		pt: "Experiência Profissional",
		it: "Esperienza Lavorativa",
		nl: "Werkervaring",
		ru: "Опыт работы",
	},
	education: {
		en: "Education",
		es: "Educación",
		fr: "Formation",
		de: "Ausbildung",
		zh: "教育背景",
		ja: "学歴",
		ar: "التعليم",
		pt: "Formação Acadêmica",
		it: "Istruzione",
		nl: "Opleiding",
		ru: "Образование",
	},
	skills: {
		en: "Skills",
		es: "Habilidades",
		fr: "Compétences",
		de: "Fähigkeiten",
		zh: "专业技能",
		ja: "スキル",
		ar: "المهارات",
		pt: "Habilidades",
		it: "Competenze",
		nl: "Vaardigheden",
		ru: "Навыки",
	},
	projects: {
		en: "Projects",
		es: "Proyectos",
		fr: "Projets",
		de: "Projekte",
		zh: "项目经验",
		ja: "プロジェクト",
		ar: "المشاريع",
		pt: "Projetos",
		it: "Progetti",
		nl: "Projecten",
		ru: "Проекты",
	},
	certifications: {
		en: "Certifications",
		es: "Certificaciones",
		fr: "Certifications",
		de: "Zertifikate",
		zh: "资格证书",
		ja: "資格・認定",
		ar: "الشهادات",
		pt: "Certificações",
		it: "Certificazioni",
		nl: "Certificaten",
		ru: "Сертификаты",
	},
	summary: {
		en: "Professional Summary",
		es: "Perfil Profesional",
		fr: "Profil Professionnel",
		de: "Kurzprofil",
		zh: "个人简介",
		ja: "自己PR",
		ar: "الملخص المهني",
		pt: "Resumo Profissional",
		it: "Profilo Professionale",
		nl: "Profiel",
		ru: "О себе",
	},
	volunteer: {
		en: "Volunteer Experience",
		es: "Voluntariado",
		fr: "Bénévolat",
		de: "Freiwilligenarbeit",
		zh: "志愿服务",
		ja: "ボランティア活動",
		ar: "العمل التطوعي",
		pt: "Trabalho Voluntário",
		it: "Volontariato",
		nl: "Vrijwilligerswerk",
		ru: "Волонтерство",
	},
	languages: {
		en: "Languages",
		es: "Idiomas",
		fr: "Langues",
		de: "Sprachen",
		zh: "语言能力",
		ja: "語学力",
		ar: "اللغات",
		pt: "Idiomas",
		it: "Lingue",
		nl: "Talen",
		ru: "Языки",
	},
	publications: {
		en: "Publications",
		es: "Publicaciones",
		fr: "Publications",
		de: "Veröffentlichungen",
		zh: "发表作品",
		ja: "論文・著作",
		ar: "المنشورات",
		pt: "Publicações",
		it: "Pubblicazioni",
		nl: "Publicaties",
		ru: "Публикации",
	},
	awards: {
		en: "Awards & Honors",
		es: "Premios y Reconocimientos",
		fr: "Prix et Distinctions",
		de: "Auszeichnungen",
		zh: "荣誉奖项",
		ja: "受賞歴",
		ar: "الجوائز والتقديرات",
		pt: "Prêmios e Conquistas",
		it: "Premi e Riconoscimenti",
		nl: "Onderscheidingen",
		ru: "Награды",
	},
	references: {
		en: "References",
		es: "Referencias",
		fr: "Références",
		de: "Referenzen",
		zh: "推荐人",
		ja: "推薦人",
		ar: "المراجع",
		pt: "Referências",
		it: "Referenze",
		nl: "Referenties",
		ru: "Рекомендации",
	},
};

/** List of technical keywords and proper names that should remain untranslated */
const PROTECTED_KEYWORDS = new Set([
	"javascript",
	"typescript",
	"python",
	"java",
	"c++",
	"c#",
	"go",
	"golang",
	"rust",
	"react",
	"react native",
	"next.js",
	"vue",
	"angular",
	"node.js",
	"hono",
	"fastapi",
	"docker",
	"kubernetes",
	"aws",
	"gcp",
	"azure",
	"sql",
	"postgresql",
	"mysql",
	"mongodb",
	"redis",
	"git",
	"linux",
	"ci/cd",
	"graphql",
	"rest",
	"api",
	"html",
	"css",
	"tailwind",
]);

export function isProtectedKeyword(word: string): boolean {
	return PROTECTED_KEYWORDS.has(word.toLowerCase().trim());
}

/**
 * Translates standard resume section headers into target language while updating page locale.
 */
export function translateResumeSections(resume: ResumeData, targetLang: TargetLanguageCode): ResumeData {
	const updatedSections = { ...resume.sections };
	type SectionMap = Record<string, { title: string } & Record<string, unknown>>;
	const sectionMap = updatedSections as unknown as SectionMap;

	for (const [sectionKey, translations] of Object.entries(SECTION_TRANSLATIONS)) {
		const targetTitle = translations[targetLang];
		if (!targetTitle) continue;

		const section = sectionMap[sectionKey];
		if (section && typeof section === "object" && "title" in section) {
			sectionMap[sectionKey] = {
				...section,
				title: targetTitle,
			};
		}
	}

	// Update page locale mapping
	const localeMap: Record<TargetLanguageCode, string> = {
		en: "en-US",
		es: "es-ES",
		fr: "fr-FR",
		de: "de-DE",
		zh: "zh-CN",
		ja: "ja-JP",
		ar: "ar-SA",
		pt: "pt-BR",
		it: "it-IT",
		nl: "nl-NL",
		ru: "ru-RU",
	};

	return {
		...resume,
		sections: updatedSections,
		metadata: {
			...resume.metadata,
			page: {
				...resume.metadata?.page,
				locale: localeMap[targetLang] ?? "en-US",
			},
		},
	};
}
