import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@reactive-resume/ui/components/dropdown-menu";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { changeLocale, localeMap, selectableLocales } from "@/libs/locale";

// Languages more than one locale shares are told apart by region or script; the rest go by the language alone.
const nameVariants: Record<string, string> = { "zh-CN": "zh-Hans", "zh-TW": "zh-Hant" };
const sharedLanguages = new Set(["en", "pt", "zh"]);
// Chromium ships no locale data for these, so it would name them in English; the names are the platform's own (CLDR).
const unlistedNames: Record<string, string> = { km: "ខ្មែរ", ne: "नेपाली", or: "ଓଡ଼ିଆ", sq: "shqip" };

/**
 * A locale's name in its own language ("Deutsch", "日本語"), from the platform's locale data. `exact` tells locales of
 * one language apart ("British English"); without it, it's the language alone ("English").
 */
function ownLanguageName(locale: string, exact = true) {
	const language = locale.split("-")[0] ?? locale;
	const code = exact && sharedLanguages.has(language) ? (nameVariants[locale] ?? locale) : language;
	const name =
		(Intl.DisplayNames.supportedLocalesOf([locale]).length === 0 ? unlistedNames[language] : undefined) ??
		new Intl.DisplayNames([locale], { type: "language" }).of(code) ??
		locale;
	return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

type LanguageDoorwayProps = { className?: string; nameClassName?: string };

/** The current language selector dropdown: the header's and the footer's way to switch language. */
export function LanguageDoorway({ className, nameClassName }: LanguageDoorwayProps) {
	const { i18n } = useLingui();
	if (selectableLocales.length <= 1) return null;
	const name = ownLanguageName(i18n.locale, false);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				title={t`Change language`}
				aria-label={t`Change language`}
				className={cn("flex cursor-pointer items-center", className)}
			>
				<Icon name="translate" size={16} />
				<span lang={i18n.locale} className={nameClassName}>
					{name}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="max-h-[360px] overflow-y-auto">
				<DropdownMenuRadioGroup value={i18n.locale} onValueChange={changeLocale}>
					{selectableLocales.map((value) => (
						<DropdownMenuRadioItem key={value} value={value}>
							{i18n._(localeMap[value])}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
