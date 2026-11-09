import type z from "zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { applyOnePageAutoFit, applyTwoPageRelaxedFit, microAdjustFit } from "@reactive-resume/resume/page-fit";
import { pageSchema } from "@reactive-resume/schema/resume/data";
import { Button } from "@reactive-resume/ui/components/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@reactive-resume/ui/components/form";
import { Icon } from "@reactive-resume/ui/components/icon";
import { InputGroup, InputGroupAddon, InputGroupText } from "@reactive-resume/ui/components/input-group";
import { Switch } from "@reactive-resume/ui/components/switch";
import { toast } from "@reactive-resume/ui/components/toast";
import { SectionBase } from "../shared/section-base";
import { NumberInput } from "@/components/input/number-input";
import { useCurrentResume, useUpdateResumeData } from "@/features/resume/builder/draft";
import { useSyncFormValues } from "@/hooks/use-sync-form-values";
import { useAppForm } from "@/libs/tanstack-form";

export function PageSectionBuilder() {
	return (
		<SectionBase type="page">
			<PageSectionForm />
		</SectionBase>
	);
}

const formSchema = pageSchema;

type FormValues = z.infer<typeof formSchema>;

const CLAMP_MIN = 0;
const CLAMP_MAX = 100;

function PageSectionForm() {
	const resume = useCurrentResume();
	const page = resume.data.metadata.page;
	const updateResumeData = useUpdateResumeData();

	const persist = (data: FormValues) => {
		updateResumeData((draft) => {
			draft.metadata.page = data;
		});
	};

	const form = useAppForm({
		defaultValues: page,
		validators: { onChange: formSchema },
	});
	useSyncFormValues(form, page);

	const handleAutoSave = () => {
		persist(form.state.values);
	};

	const handleOnePageFit = () => {
		updateResumeData((draft) => {
			draft.metadata = applyOnePageAutoFit(draft.metadata);
		});
		toast.add({ description: t`Auto-fit to 1 page applied!` });
	};

	const handleTwoPageFit = () => {
		updateResumeData((draft) => {
			draft.metadata = applyTwoPageRelaxedFit(draft.metadata);
		});
		toast.add({ description: t`Relaxed two-page layout applied!` });
	};

	const handleMicroTighten = () => {
		updateResumeData((draft) => {
			draft.metadata = microAdjustFit(draft.metadata, "tighten");
		});
		toast.add({ description: t`Spacing micro-tightened.` });
	};

	const pageNumberFields = [
		{ name: "marginX" as const, label: <Trans>Horizontal margin</Trans>, min: CLAMP_MIN, max: CLAMP_MAX },
		{ name: "marginY" as const, label: <Trans>Vertical margin</Trans>, min: CLAMP_MIN, max: CLAMP_MAX },
		{ name: "gapX" as const, label: <Trans>Horizontal spacing</Trans>, min: 0, max: undefined },
		{ name: "gapY" as const, label: <Trans>Vertical spacing</Trans>, min: 0, max: undefined },
	];

	const pageSwitchFields = [
		{ name: "hideLinkUnderline" as const, label: <Trans>Underline links</Trans> },
		{ name: "hideIcons" as const, label: <Trans>Show icons</Trans> },
		{ name: "hideSectionIcons" as const, label: <Trans>Show section icons</Trans> },
	];

	return (
		<div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
			<div className="col-span-full rounded-xl border border-line bg-raised p-3 shadow-xs">
				<div className="mb-2 flex items-center justify-between">
					<div className="flex items-center gap-1.5 text-sm font-semibold">
						<Icon name="sparkle" size={16} className="text-accent" />
						<Trans>Smart Page Squeezer</Trans>
					</div>
					<span className="text-[11px] font-medium text-ink-3">
						<Trans>Auto-Fit</Trans>
					</span>
				</div>
				<p className="mb-3 text-xs leading-relaxed text-ink-2">
					<Trans>Eliminate awkward spillover lines and balance page density with one click.</Trans>
				</p>
				<div className="flex flex-wrap gap-2">
					<Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs" onClick={handleOnePageFit}>
						<Icon name="arrows-in-line-vertical" size={14} />
						<Trans>Fit 1 Page</Trans>
					</Button>
					<Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs" onClick={handleTwoPageFit}>
						<Icon name="arrows-out-simple" size={14} />
						<Trans>2-Page Relaxed</Trans>
					</Button>
					<Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={handleMicroTighten}>
						<Icon name="minus" size={13} />
						<Trans>Micro-Tighten</Trans>
					</Button>
				</div>
			</div>

			{pageNumberFields.map(({ name, label, min, max }) => (
				<form.Field key={name} name={name}>
					{(field) => (
						<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
							<FormLabel>{label}</FormLabel>
							<InputGroup>
								<FormControl
									render={
										<NumberInput
											name={field.name}
											value={field.state.value}
											min={min}
											max={max}
											step={1}
											onBlur={field.handleBlur}
											onValueChange={(value) => {
												field.handleChange(value);
												handleAutoSave();
											}}
										/>
									}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupText>pt</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
							<FormMessage errors={field.state.meta.errors} />
						</FormItem>
					)}
				</form.Field>
			))}

			{pageSwitchFields.map(({ name, label }) => (
				<form.Field key={name} name={name}>
					{(field) => (
						<FormItem
							className="col-span-full flex items-center gap-x-3 py-1"
							hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}
						>
							<FormControl
								render={
									<Switch
										// Labels describe the ON state; the stored flags are hide*, so the switch is inverted.
										checked={!field.state.value}
										onCheckedChange={(checked) => {
											field.handleChange(!checked);
											handleAutoSave();
										}}
									/>
								}
							/>
							<FormLabel>{label}</FormLabel>
						</FormItem>
					)}
				</form.Field>
			))}
		</div>
	);
}
