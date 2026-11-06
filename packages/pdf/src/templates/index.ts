import type { TemplatePage } from "../document";
import type { Template } from "@reactive-resume/schema/templates";
import { legacyTemplateAliasMap } from "@reactive-resume/schema/templates";
import { ArticunoPage } from "./articuno/ArticunoPage";
import { AzurillPage } from "./azurill/AzurillPage";
import { BronzorPage } from "./bronzor/BronzorPage";
import { ChikoritaPage } from "./chikorita/ChikoritaPage";
import { DitgarPage } from "./ditgar/DitgarPage";
import { DittoPage } from "./ditto/DittoPage";
import { EeveePage } from "./eevee/EeveePage";
import { GengarPage } from "./gengar/GengarPage";
import { GlaliePage } from "./glalie/GlaliePage";
import { JakeAtsPage } from "./jake-ats/JakeAtsPage";
import { KakunaPage } from "./kakuna/KakunaPage";
import { LaprasPage } from "./lapras/LaprasPage";
import { LeafishPage } from "./leafish/LeafishPage";
import { LinearMonoPage } from "./linear-mono/LinearMonoPage";
import { MeowthPage } from "./meowth/MeowthPage";
import { OnyxPage } from "./onyx/OnyxPage";
import { PersianPage } from "./persian/PersianPage";
import { PikachuPage } from "./pikachu/PikachuPage";
import { PorygonPage } from "./porygon/PorygonPage";
import { RhyhornPage } from "./rhyhorn/RhyhornPage";
import { ScizorPage } from "./scizor/ScizorPage";
import { SmearglePage } from "./smeargle/SmearglePage";
import { SnorlaxPage } from "./snorlax/SnorlaxPage";

export const HarvardPage = ArticunoPage;
export const SiliconPage = EeveePage;
export const McKinseyPage = ScizorPage;
export const StanfordPage = LaprasPage;
export const WallStreetPage = PersianPage;
export { JakeAtsPage };
export { LinearMonoPage };
export const ModernSplitPage = AzurillPage;
export const TokyoCompactPage = MeowthPage;
export const CorporateSplitPage = ChikoritaPage;
export const CambridgeCVPage = SnorlaxPage;
export const CreativeStudioPage = PikachuPage;

// Legacy named exports for backwards compatibility
export const MITEngineerPage = OnyxPage;
export const NordicPage = RhyhornPage;
export const TechSplitPage = DitgarPage;
export const SwissGridPage = BronzorPage;
export const MinimalSplitPage = DittoPage;
export const ProductManagerPage = PorygonPage;
export const ClinicalHealthPage = LeafishPage;
export const EditorialSerifPage = SmearglePage;
export const EntryLaunchPage = KakunaPage;
export const LegalUnderstatedPage = GlaliePage;
export const BusinessAnalystPage = GengarPage;

const templatePages: Record<Template, TemplatePage> = {
	// Curated 12 Elite Templates
	harvard: HarvardPage,
	silicon: SiliconPage,
	mckinsey: McKinseyPage,
	stanford: StanfordPage,
	"wall-street": WallStreetPage,
	"jake-ats": JakeAtsPage,
	"linear-mono": LinearMonoPage,
	"modern-split": ModernSplitPage,
	"tokyo-compact": TokyoCompactPage,
	"corporate-split": CorporateSplitPage,
	"cambridge-cv": CambridgeCVPage,
	"creative-studio": CreativeStudioPage,

	// Legacy aliases
	articuno: ArticunoPage,
	azurill: AzurillPage,
	bronzor: BronzorPage,
	chikorita: ChikoritaPage,
	ditgar: DitgarPage,
	ditto: DittoPage,
	eevee: EeveePage,
	gengar: GengarPage,
	glalie: GlaliePage,
	kakuna: KakunaPage,
	lapras: LaprasPage,
	leafish: LeafishPage,
	meowth: MeowthPage,
	onyx: OnyxPage,
	persian: PersianPage,
	pikachu: PikachuPage,
	porygon: PorygonPage,
	rhyhorn: RhyhornPage,
	scizor: ScizorPage,
	smeargle: SmearglePage,
	snorlax: SnorlaxPage,
	"mit-engineer": OnyxPage,
	nordic: RhyhornPage,
	"tech-split": DitgarPage,
	"swiss-grid": BronzorPage,
	"minimal-split": DittoPage,
	"product-manager": PorygonPage,
	"clinical-health": LeafishPage,
	"editorial-serif": SmearglePage,
	"entry-launch": KakunaPage,
	"legal-understated": GlaliePage,
	"business-analyst": GengarPage,
};

const defaultTemplatePage = HarvardPage;

export const getTemplatePage = (template: Template): TemplatePage => {
	if (template in templatePages) {
		return templatePages[template];
	}
	const aliased = legacyTemplateAliasMap[template as keyof typeof legacyTemplateAliasMap];
	if (aliased && aliased in templatePages) {
		return templatePages[aliased];
	}
	return defaultTemplatePage;
};
