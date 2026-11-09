import type { TargetLanguageCode } from "@reactive-resume/resume/translator";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SUPPORTED_TRANSLATION_LANGUAGES, translateResumeSections } from "@reactive-resume/resume/translator";
import { DialogHeader, DialogTitle } from "@reactive-resume/ui/components/dialog";
import { Icon } from "@reactive-resume/ui/components/icon";
import { toast } from "@reactive-resume/ui/components/toast";
import { useUpdateResumeData } from "@/features/resume/builder/draft";

export function TranslateSectionsDialog({ onClose }: { onClose: () => void }) {
	const updateResumeData = useUpdateResumeData();

	const handleTranslate = (code: TargetLanguageCode, name: string) => {
		updateResumeData((draft) => {
			const translated = translateResumeSections(draft, code);
			draft.sections = translated.sections;
			if (draft.metadata?.page && translated.metadata?.page) {
				draft.metadata.page.locale = translated.metadata.page.locale;
			}
		});
		toast.add({ description: t`Resume section headers translated to ${name}!` });
		onClose();
	};

	return (
		<div className="grid gap-4">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2">
					<Icon name="translate" size={18} className="text-accent" />
					<Trans>Translate Resume Sections</Trans>
				</DialogTitle>
			</DialogHeader>

			<p className="text-xs leading-relaxed text-ink-2">
				<Trans>
					Instantly localize all standard section headers (Experience, Education, Skills, Projects, etc.) and date
					formats into your chosen target language.
				</Trans>
			</p>

			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{SUPPORTED_TRANSLATION_LANGUAGES.map((lang) => (
					<button
						key={lang.code}
						type="button"
						onClick={() => handleTranslate(lang.code, lang.name)}
						className="flex flex-col items-start rounded-xl border border-line bg-surface p-3 text-start transition-colors duration-quick hover:border-accent hover:bg-hover active:scale-[0.98]"
					>
						<span className="text-ink-1 text-sm font-semibold">{lang.nativeName}</span>
						<span className="text-xs text-ink-3">{lang.name}</span>
					</button>
				))}
			</div>
		</div>
	);
}
