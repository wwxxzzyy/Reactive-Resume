import type { StarFlashcardOutput } from "@reactive-resume/schema/career";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@reactive-resume/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@reactive-resume/ui/components/dialog";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Input } from "@reactive-resume/ui/components/input";
import { Label } from "@reactive-resume/ui/components/label";
import { Spinner } from "@reactive-resume/ui/components/spinner";
import { Textarea } from "@reactive-resume/ui/components/textarea";
import { toast } from "@reactive-resume/ui/components/toast";
import { toastError } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";

type GenerateStoryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onGenerated: (output: StarFlashcardOutput) => void;
};

export function GenerateStoryDialog({ open, onOpenChange, onGenerated }: GenerateStoryDialogProps) {
	const [bullet, setBullet] = useState("");
	const [role, setRole] = useState("");
	const [company, setCompany] = useState("");

	const generate = useMutation({
		...orpc.career.generateStarFlashcard.mutationOptions(),
		onSuccess: (data) => {
			toast.add({ description: t`STAR story drafted from bullet point!` });
			onGenerated(data);
			onOpenChange(false);
			setBullet("");
			setRole("");
			setCompany("");
		},
		onError: (error) => toastError(error, t`Couldn't generate story from bullet. Try again.`),
	});

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const trimmedBullet = bullet.trim();
		if (trimmedBullet.length < 5) return;

		generate.mutate({
			bullet: trimmedBullet,
			role: role.trim() || undefined,
			company: company.trim() || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent closeLabel={t`Close`} className="sm:max-w-lg">
				<form onSubmit={handleSubmit} className="grid gap-4">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl font-semibold">
							<Icon name="sparkle" size={20} className="text-accent-text" />
							<Trans>Draft STAR Story from Resume Bullet</Trans>
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-2">
							<Trans>
								Paste a bullet point or accomplishment. AI will extract behavioral interview questions and format it
								into Situation, Task, Action, Result, and Reflection.
							</Trans>
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3 py-1">
						<div className="grid gap-1.5">
							<Label htmlFor="star-bullet-input">
								<Trans>Resume bullet or accomplishment</Trans>
							</Label>
							<Textarea
								id="star-bullet-input"
								rows={3}
								value={bullet}
								placeholder={t`e.g. Led migration of microservices to Kubernetes, reducing downtime by 35% and cut cloud costs by $40k/yr.`}
								onChange={(e) => setBullet(e.target.value)}
								required
								minLength={5}
								maxLength={2000}
								className="text-sm"
							/>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="grid gap-1.5">
								<Label htmlFor="star-role-input">
									<Trans>Role (optional)</Trans>
								</Label>
								<Input
									id="star-role-input"
									value={role}
									placeholder={t`e.g. Senior DevOps Engineer`}
									onChange={(e) => setRole(e.target.value)}
									maxLength={200}
									className="h-9 text-sm"
								/>
							</div>
							<div className="grid gap-1.5">
								<Label htmlFor="star-company-input">
									<Trans>Company (optional)</Trans>
								</Label>
								<Input
									id="star-company-input"
									value={company}
									placeholder={t`e.g. Acme Cloud`}
									onChange={(e) => setCompany(e.target.value)}
									maxLength={200}
									className="h-9 text-sm"
								/>
							</div>
						</div>
					</div>

					<DialogFooter className="flex items-center justify-end gap-2 pt-2">
						<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button type="submit" disabled={bullet.trim().length < 5 || generate.isPending} className="gap-2">
							{generate.isPending ? (
								<>
									<Spinner className="size-4" />
									<Trans>Drafting STARR…</Trans>
								</>
							) : (
								<>
									<Icon name="sparkle" size={16} />
									<Trans>Generate</Trans>
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
