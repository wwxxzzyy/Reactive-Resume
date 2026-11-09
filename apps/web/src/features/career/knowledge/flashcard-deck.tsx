import type { Story } from "../hooks";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Kbd } from "@reactive-resume/ui/components/kbd";
import { cn } from "@reactive-resume/utils/style";

type FlashcardDeckProps = {
	stories: Story[];
	onExit: () => void;
	onEditStory?: (storyId: string) => void;
};

const STARR_PARTS = [
	{ key: "situation", letter: "S", label: t`Situation`, bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
	{ key: "task", letter: "T", label: t`Task`, bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
	{ key: "action", letter: "A", label: t`Action`, bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
	{ key: "result", letter: "R", label: t`Result`, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
	{ key: "reflection", letter: "R", label: t`Reflection`, bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
] as const;

export function FlashcardDeck({ stories, onExit, onEditStory }: FlashcardDeckProps) {
	const [order, setOrder] = useState<number[]>(() => stories.map((_, i) => i));
	const [currentIndex, setCurrentIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

	const storyIndex = order[currentIndex] ?? 0;
	const currentStory = stories[storyIndex];

	const handleNext = useCallback(() => {
		if (currentIndex < order.length - 1) {
			setFlipped(false);
			setCurrentIndex((i) => i + 1);
		}
	}, [currentIndex, order.length]);

	const handlePrev = useCallback(() => {
		if (currentIndex > 0) {
			setFlipped(false);
			setCurrentIndex((i) => i - 1);
		}
	}, [currentIndex]);

	const handleFlip = useCallback(() => {
		setFlipped((f) => !f);
	}, []);

	const handleShuffle = useCallback(() => {
		setFlipped(false);
		setCurrentIndex(0);
		setOrder((current) => [...current].sort(() => Math.random() - 0.5));
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			if (e.code === "Space") {
				e.preventDefault();
				handleFlip();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				handleNext();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				handlePrev();
			} else if (e.key === "Escape") {
				e.preventDefault();
				onExit();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleFlip, handleNext, handlePrev, onExit]);

	if (!currentStory) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface p-12 text-center">
				<p className="text-ink-2">
					<Trans>No stories available for flashcard rehearsal.</Trans>
				</p>
				<Button variant="secondary" onClick={onExit}>
					<Trans>Back to stories</Trans>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Top toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Badge variant="accent" className="font-mono text-xs">
						<Trans>Flashcard Drill</Trans>
					</Badge>
					<span className="text-xs text-ink-3">
						<Trans>
							Card {currentIndex + 1} of {order.length}
						</Trans>
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleShuffle}
						title={t`Shuffle cards`}
						className="gap-1.5 text-xs"
					>
						<Icon name="arrows-down-up" size={14} />
						<Trans>Shuffle</Trans>
					</Button>
					<Button variant="secondary" size="sm" onClick={onExit} className="gap-1.5 text-xs">
						<Icon name="x" size={14} />
						<Trans>Exit</Trans>
					</Button>
				</div>
			</div>

			{/* Main Flashcard Container */}
			<div className="relative min-h-[420px] w-full">
				<AnimatePresence mode="wait">
					<motion.div
						key={`${storyIndex}-${flipped ? "back" : "front"}`}
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						onClick={handleFlip}
						role="button"
						tabIndex={0}
						className={cn(
							"group relative flex min-h-[420px] cursor-pointer flex-col justify-between rounded-2xl border bg-surface p-6 shadow-sm sm:p-8",
							flipped ? "border-accent/40 bg-surface" : "border-line hover:border-line-2",
						)}
					>
						{!flipped ? (
							/* ---- FRONT: Question / Prompt ---- */
							<div className="flex flex-1 flex-col justify-between gap-6">
								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between">
										<Badge variant="neutral">
											<Trans>Behavioral Interview Question</Trans>
										</Badge>
										<span className="text-xs text-ink-3">
											<Trans>Click or press Space to reveal</Trans>
										</span>
									</div>

									<h2 className="text-xl font-semibold text-ink sm:text-2xl">{currentStory.data.title}</h2>

									<p className="text-base leading-relaxed text-ink-2 sm:text-lg">
										<Trans>
											&ldquo;Tell me about a time you worked on {currentStory.data.title}. What challenge did you
											encounter, and how did you resolve it?&rdquo;
										</Trans>
									</p>

									{currentStory.data.tags.length > 0 && (
										<div className="flex flex-wrap gap-1.5 pt-2">
											{currentStory.data.tags.map((tag) => (
												<Badge key={tag} variant="outline" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									)}
								</div>

								<div className="flex items-center justify-between rounded-xl bg-sunken p-4 text-xs text-ink-3">
									<span className="flex items-center gap-2">
										<Icon name="microphone" size={16} />
										<Trans>Formulate your answer aloud using Situation, Task, Action, Result.</Trans>
									</span>
									<span className="hidden items-center gap-1 sm:flex">
										<Kbd>Space</Kbd> <Trans>to flip</Trans>
									</span>
								</div>
							</div>
						) : (
							/* ---- BACK: STAR Breakdown ---- */
							<div className="flex flex-1 flex-col justify-between gap-6">
								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between">
										<Badge variant="solid">
											<Trans>STAR Breakdown</Trans>
										</Badge>
										<span className="text-xs text-ink-3">
											<Trans>Click to return to question</Trans>
										</span>
									</div>

									<h3 className="text-lg font-semibold text-ink">{currentStory.data.title}</h3>

									<div className="grid gap-3 pt-1">
										{STARR_PARTS.map((part) => {
											const text = currentStory.data[part.key];
											if (!text) return null;
											return (
												<div
													key={part.key}
													className="flex items-start gap-3 rounded-lg border border-line-2/50 p-2.5 sm:p-3"
												>
													<span
														className={cn(
															"flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
															part.bg,
														)}
													>
														{part.letter}
													</span>
													<div className="flex flex-col gap-0.5">
														<span className="text-xs font-semibold text-ink-2">{part.label}</span>
														<p className="text-sm leading-snug text-ink">{text}</p>
													</div>
												</div>
											);
										})}
									</div>
								</div>

								{onEditStory && (
									<div className="flex justify-end pt-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												onEditStory(currentStory.id);
											}}
											className="text-xs text-ink-3 hover:text-ink"
										>
											<Icon name="pencil-simple" size={14} className="mr-1" />
											<Trans>Edit Story</Trans>
										</Button>
									</div>
								)}
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Navigation Controls */}
			<div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={handlePrev}
					disabled={currentIndex === 0}
					className="gap-1.5 text-xs"
				>
					<Icon name="arrow-left" size={16} />
					<Trans>Previous</Trans>
				</Button>

				<Button variant="secondary" size="sm" onClick={handleFlip} className="gap-2 px-4 text-xs font-medium">
					<Icon name="arrows-left-right" size={16} />
					{flipped ? <Trans>Show Question</Trans> : <Trans>Reveal STAR</Trans>}
					<Kbd className="hidden sm:inline-block">Space</Kbd>
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleNext}
					disabled={currentIndex === order.length - 1}
					className="gap-1.5 text-xs"
				>
					<Trans>Next</Trans>
					<Icon name="arrow-right" size={16} />
				</Button>
			</div>

			{/* Mock Interview Partner Callout */}
			<div className="flex flex-col gap-2 rounded-xl border border-line/60 bg-sunken/30 p-3 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<Icon name="chat-text" size={16} className="shrink-0 text-accent-text" />
					<span>Want real-time mock interview practice with verified tech engineers?</span>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<a
						href="https://www.tryexponent.com/?ref=dippergo&utm_source=dippergo&utm_medium=interview_deck"
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="font-medium text-accent-text hover:underline"
					>
						Exponent Mocks →
					</a>
					<span>·</span>
					<a
						href="https://interviewing.io/?ref=dippergo&utm_source=dippergo&utm_medium=interview_deck"
						target="_blank"
						rel="noopener noreferrer sponsored"
						className="font-medium text-accent-text hover:underline"
					>
						interviewing.io →
					</a>
				</div>
			</div>
		</div>
	);
}
