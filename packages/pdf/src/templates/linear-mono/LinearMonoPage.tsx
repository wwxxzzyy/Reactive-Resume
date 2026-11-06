import type { TemplatePageProps } from "../../document";
import type { Style } from "../../forme/style-types";
import type { TemplateColorRoles, TemplateStyleContext, TemplateStyleSlots } from "../shared/types";
import { useMemo } from "react";
import { Page, StyleSheet, View } from "#react-pdf-renderer";
import { useRender } from "../../context";
import { useRenderedSectionIds, useResolvedNode } from "../../semantic/context";
import { semanticNodeKeys } from "../../semantic/node-keys";
import {
	CustomFieldContactItem,
	EmailContactItem,
	LocationContactItem,
	PhoneContactItem,
	WebsiteContactItem,
} from "../shared/contact-item";
import { TemplateProvider } from "../shared/context";
import { filterSections } from "../shared/filtering";
import { getTemplateMetrics } from "../shared/metrics";
import { hasTemplatePicture } from "../shared/picture";
import {
	Heading,
	SemanticContactListView,
	SemanticHeaderPicture,
	SemanticHeaderView,
	SemanticRegionView,
	Text,
} from "../shared/primitives";
import { Section } from "../shared/sections";
import { composeStyles, headerNameLineHeight } from "../shared/styles";
import { createIconSlot, useTemplateBase } from "../shared/template-base";

type LinearMonoStyles = Omit<TemplateStyleSlots, "page"> & {
	page: Style;
	header: Style;
	headerIdentity: Style;
	headerName: Style;
	headerHeadline: Style;
	contactList: Style;
	contactItem: Style;
	contactText: Style;
	picture: Style;
	sections: Style;
};

type LinearMonoTemplate = {
	colors: TemplateColorRoles;
	styles: LinearMonoStyles;
};

type LinearMonoHeaderProps = {
	styles: LinearMonoStyles;
};

export const LinearMonoPage = ({ page, pageSize, pageMinHeightStyle, showHeader, pageNumber }: TemplatePageProps) => {
	const data = useRender();
	const pageNodeKey = semanticNodeKeys.page(pageNumber);
	const { style: semanticPageStyle, size: semanticPageSize, ...semanticPageProps } = useResolvedNode(pageNodeKey);
	const { metadata } = data;
	const { colors, styles } = useLinearMonoTemplate();
	const metrics = getTemplateMetrics(metadata.page);
	const mainSections = useRenderedSectionIds(pageNodeKey, filterSections(page.main, data));
	const sidebarSections = useRenderedSectionIds(pageNodeKey, page.fullWidth ? [] : filterSections(page.sidebar, data));
	const sections = [...mainSections, ...sidebarSections];

	return (
		<Page
			{...semanticPageProps}
			size={semanticPageSize ?? pageSize}
			style={composeStyles(styles.page, pageMinHeightStyle, semanticPageStyle)}
		>
			<TemplateProvider pageNodeKey={pageNodeKey} styles={styles} colors={colors}>
				{showHeader && <Header styles={styles} />}

				<SemanticRegionView region="main" style={composeStyles(styles.sections, { rowGap: metrics.sectionGap })}>
					{sections.map((section) => (
						<Section key={section} section={section} placement="main" />
					))}
				</SemanticRegionView>
			</TemplateProvider>
		</Page>
	);
};

const Header = ({ styles }: LinearMonoHeaderProps) => {
	const { basics, picture } = useRender();
	const hasPicture = hasTemplatePicture(picture);

	return (
		<SemanticHeaderView style={styles.header}>
			<View style={styles.headerIdentity}>
				<Heading style={styles.headerName}>{basics.name}</Heading>
				{basics.headline && <Text style={styles.headerHeadline}>{basics.headline}</Text>}
				<SemanticContactListView style={styles.contactList}>
					<PhoneContactItem phone={basics.phone} style={styles.contactItem} textStyle={styles.contactText} />
					<EmailContactItem email={basics.email} style={styles.contactItem} textStyle={styles.contactText} />
					<LocationContactItem location={basics.location} style={styles.contactItem} textStyle={styles.contactText} />
					<WebsiteContactItem website={basics.website} style={styles.contactItem} textStyle={styles.contactText} />
					{basics.customFields.map((field) => (
						<CustomFieldContactItem
							key={field.id}
							field={field}
							style={styles.contactItem}
							textStyle={styles.contactText}
						/>
					))}
				</SemanticContactListView>
			</View>
			{hasPicture && <SemanticHeaderPicture src={picture.url} style={styles.picture} />}
		</SemanticHeaderView>
	);
};

const useLinearMonoTemplate = (): LinearMonoTemplate => {
	const { metadata, r, foreground, background, primary, metrics, base } = useTemplateBase();

	return useMemo(() => {
		const colors: TemplateColorRoles = { foreground, background, primary };

		const baseStyles = StyleSheet.create({
			...base,
			page: {
				...base.page,
				paddingHorizontal: metrics.page.paddingHorizontal,
				paddingVertical: metrics.page.paddingVertical,
				rowGap: metrics.sectionGap,
			},
			section: {
				flexDirection: "column",
				rowGap: metrics.gapY(0.22),
			},
			sectionHeading: {
				fontSize: metadata.typography.heading.fontSize,
				color: foreground,
				borderLeftWidth: 3,
				borderLeftColor: primary,
				paddingLeft: metrics.gapX(0.35),
				borderBottomWidth: 0.5,
				borderBottomColor: "#CBD5E1",
				paddingBottom: metrics.gapY(0.1),
				textTransform: "uppercase",
				letterSpacing: 0.6,
			},
			item: {
				rowGap: metrics.gapY(0.12),
			},
			levelContainer: {
				width: "100%",
			},
			levelItem: {
				borderColor: primary,
			},
			levelItemActive: {
				backgroundColor: primary,
			},
			header: {
				width: "100%",
				flexDirection: r.row,
				justifyContent: "space-between",
				alignItems: "flex-start",
				borderBottomWidth: 1.5,
				borderBottomColor: primary,
				paddingBottom: metrics.gapY(0.4),
			},
			headerIdentity: {
				flex: 1,
				rowGap: metrics.gapY(0.18),
			},
			headerName: {
				fontSize: metadata.typography.heading.fontSize * 1.55,
				lineHeight: headerNameLineHeight,
				letterSpacing: -0.3,
			},
			headerHeadline: {
				fontSize: metadata.typography.body.fontSize * 1.05,
				color: primary,
			},
			contactList: {
				flexDirection: r.row,
				flexWrap: "wrap",
				rowGap: metrics.gapY(0.1),
				columnGap: metrics.gapX(0.55),
				marginTop: metrics.gapY(0.08),
			},
			contactItem: {
				flexDirection: r.row,
				alignItems: "center",
				columnGap: metrics.gapX(0.2),
			},
			contactText: {},
			picture: {
				marginLeft: metrics.gapX(0.5),
			},
			sections: {
				flexDirection: "column",
			},
		});

		const accentFor = ({ colors }: TemplateStyleContext) => colors.primary;

		return {
			colors,
			styles: {
				...baseStyles,
				sectionHeading: (context) => ({
					...baseStyles.sectionHeading,
					borderLeftColor: accentFor(context),
				}),
				levelItem: (context) => ({ borderColor: accentFor(context) }),
				levelItemActive: (context) => ({ backgroundColor: accentFor(context) }),
				icon: createIconSlot({ metadata, accentFor }),
			} satisfies LinearMonoStyles,
		};
	}, [metadata, r, primary, metrics, base, foreground, background]);
};
