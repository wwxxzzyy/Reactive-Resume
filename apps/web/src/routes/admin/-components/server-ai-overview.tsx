import type { AIProvider } from "@reactive-resume/ai/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
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
import { NativeSelect } from "@reactive-resume/ui/components/native-select";
import { Switch } from "@reactive-resume/ui/components/switch";
import { toast } from "@reactive-resume/ui/components/toast";
import { cn } from "@reactive-resume/utils/style";
import { orpc } from "@/libs/orpc/client";

const PROVIDER_PRESETS: Record<
	AIProvider,
	{ label: string; defaultModel: string; models: string[]; defaultBaseUrl: string }
> = {
	deepseek: {
		label: "DeepSeek",
		defaultModel: "deepseek-chat",
		models: ["deepseek-chat", "deepseek-reasoner"],
		defaultBaseUrl: "https://api.deepseek.com",
	},
	openai: {
		label: "OpenAI",
		defaultModel: "gpt-4o-mini",
		models: ["gpt-4o-mini", "gpt-4o", "o1-mini", "gpt-4-turbo"],
		defaultBaseUrl: "https://api.openai.com/v1",
	},
	anthropic: {
		label: "Anthropic Claude",
		defaultModel: "claude-3-5-haiku-20241022",
		models: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
		defaultBaseUrl: "https://api.anthropic.com/v1",
	},
	gemini: {
		label: "Google Gemini",
		defaultModel: "gemini-1.5-flash",
		models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"],
		defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
	},
	groq: {
		label: "Groq",
		defaultModel: "llama-3.3-70b-versatile",
		models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
		defaultBaseUrl: "https://api.groq.com/openai/v1",
	},
	mistral: {
		label: "Mistral AI",
		defaultModel: "mistral-large-latest",
		models: ["mistral-large-latest", "codestral-latest", "mistral-small-latest"],
		defaultBaseUrl: "https://api.mistral.ai/v1",
	},
	ollama: {
		label: "Ollama (Local / Self-Hosted)",
		defaultModel: "llama3.2",
		models: ["llama3.2", "mistral", "qwen2.5", "deepseek-r1:8b"],
		defaultBaseUrl: "http://localhost:11434/v1",
	},
	openrouter: {
		label: "OpenRouter",
		defaultModel: "deepseek/deepseek-chat",
		models: ["deepseek/deepseek-chat", "anthropic/claude-3.5-sonnet", "openai/gpt-4o-mini"],
		defaultBaseUrl: "https://openrouter.ai/api/v1",
	},
	"openai-compatible": {
		label: "OpenAI-Compatible Custom Endpoint",
		defaultModel: "default",
		models: ["default"],
		defaultBaseUrl: "",
	},
	cohere: {
		label: "Cohere",
		defaultModel: "command-r-plus",
		models: ["command-r-plus", "command-r"],
		defaultBaseUrl: "https://api.cohere.com/v2",
	},
	xai: {
		label: "xAI Grok",
		defaultModel: "grok-beta",
		models: ["grok-beta", "grok-2-1212"],
		defaultBaseUrl: "https://api.x.ai/v1",
	},
	togetherai: {
		label: "Together AI",
		defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
		models: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "deepseek-ai/DeepSeek-V3"],
		defaultBaseUrl: "https://api.together.xyz/v1",
	},
	fireworks: {
		label: "Fireworks AI",
		defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct",
		models: ["accounts/fireworks/models/llama-v3p3-70b-instruct"],
		defaultBaseUrl: "https://api.fireworks.ai/inference/v1",
	},
	cerebras: {
		label: "Cerebras",
		defaultModel: "llama3.1-70b",
		models: ["llama3.1-70b", "llama3.1-8b"],
		defaultBaseUrl: "https://api.cerebras.ai/v1",
	},
	perplexity: {
		label: "Perplexity",
		defaultModel: "llama-3.1-sonar-small-128k-online",
		models: ["llama-3.1-sonar-small-128k-online", "llama-3.1-sonar-large-128k-online"],
		defaultBaseUrl: "https://api.perplexity.ai",
	},
	"vercel-ai-gateway": {
		label: "Vercel AI Gateway",
		defaultModel: "openai/gpt-4o-mini",
		models: ["openai/gpt-4o-mini", "anthropic/claude-3-5-sonnet"],
		defaultBaseUrl: "https://gateway.ai.cloudflare.com/v1",
	},
};

type ServerAiConfigData = {
	configured: boolean;
	source: "database" | "environment" | "none";
	provider: string | null;
	model: string | null;
	baseUrl: string | null;
	enabled: boolean;
	testStatus: string;
	testError: string | null;
	apiKeyPreview: string;
	lastTestedAt: Date | null;
	updatedAt: Date | null;
};

type ServerAiOverviewProps = {
	onRefreshAll?: () => void;
};

export function ServerAiOverview({ onRefreshAll }: ServerAiOverviewProps) {
	// Fetch current server AI config
	const { data: config, isPending: isLoading, refetch } = useQuery(orpc.admin.getServerAi.queryOptions({}));

	const configKey = `${config?.source ?? "none"}-${config?.provider ?? "empty"}-${config?.model ?? "empty"}-${config?.updatedAt?.toString() ?? "none"}`;

	return (
		<div className="space-y-8">
			{/* Current Status Overview Card */}
			<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-xl bg-accent/15 text-accent-text">
							<Icon name="lightning" className="size-6 text-accent" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="font-anybody text-lg font-bold text-ink">Server-Wide AI Provider</h2>
								{config?.enabled && config?.testStatus === "success" ? (
									<Badge variant="accent" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
										<Icon name="check-circle" className="mr-1 size-3" />
										Active &amp; Operational
									</Badge>
								) : config?.testStatus === "error" ? (
									<Badge variant="accent" className="bg-rose-500/15 text-rose-600 dark:text-rose-400">
										<Icon name="prohibit" className="mr-1 size-3" />
										Connection Error
									</Badge>
								) : config?.configured ? (
									<Badge variant="warn">Disabled</Badge>
								) : (
									<Badge variant="neutral">Unconfigured</Badge>
								)}
							</div>
							<p className="text-xs text-ink-3">
								Powers platform resume tailoring, STAR interview coaching, and ATS scanning for all users.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => void refetch()}
							disabled={isLoading}
							className="gap-1.5 text-xs"
						>
							<Icon name="arrows-clockwise" className={cn("size-3.5", isLoading && "animate-spin")} />
							<span>Refresh</span>
						</Button>
					</div>
				</div>

				{/* Quick Stats Grid */}
				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-lg border border-line bg-raised/50 p-4">
						<span className="text-[11px] font-medium tracking-wider text-ink-3 uppercase">Active Provider</span>
						<p className="mt-1 text-sm font-semibold text-ink">
							{config?.provider ? PROVIDER_PRESETS[config.provider as AIProvider]?.label || config.provider : "None"}
						</p>
						<span className="text-[10px] text-ink-3">
							Source:{" "}
							<strong className="text-ink-2">
								{config?.source === "database"
									? "PostgreSQL (Admin DB)"
									: config?.source === "environment"
										? "Environment (.env.local)"
										: "Not set"}
							</strong>
						</span>
					</div>

					<div className="rounded-lg border border-line bg-raised/50 p-4">
						<span className="text-[11px] font-medium tracking-wider text-ink-3 uppercase">Configured Model</span>
						<p className="mt-1 truncate text-sm font-semibold text-ink" title={config?.model ?? "None"}>
							{config?.model ?? "None"}
						</p>
						<span className="text-[10px] text-ink-3">Tested status: {config?.testStatus ?? "untested"}</span>
					</div>

					<div className="rounded-lg border border-line bg-raised/50 p-4">
						<span className="text-[11px] font-medium tracking-wider text-ink-3 uppercase">Credential Storage</span>
						<p className="mt-1 truncate text-sm font-semibold text-ink">
							{config?.apiKeyPreview || "No key registered"}
						</p>
						<span className="text-[10px] text-emerald-600 dark:text-emerald-400">
							<Icon name="lock" className="mr-1 inline size-3" />
							AES-256-GCM Encrypted
						</span>
					</div>

					<div className="rounded-lg border border-line bg-raised/50 p-4">
						<span className="text-[11px] font-medium tracking-wider text-ink-3 uppercase">Endpoint Base URL</span>
						<p className="mt-1 truncate text-sm font-semibold text-ink" title={config?.baseUrl ?? "Official Default"}>
							{config?.baseUrl ? config.baseUrl : "Official Provider Default"}
						</p>
						<span className="text-[10px] text-ink-3">
							{config?.lastTestedAt ? `Last tested ${new Date(config.lastTestedAt).toLocaleDateString()}` : "Never"}
						</span>
					</div>
				</div>

				{config?.source === "environment" && (
					<div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
						<div className="flex items-start gap-2">
							<Icon name="info" className="mt-0.5 size-4 shrink-0" />
							<div>
								<strong>Using Environment Variables:</strong> The server is currently reading AI credentials from{" "}
								<code className="rounded bg-raised px-1 py-0.5 font-mono text-[11px]">.env.local</code>. Saving a
								configuration in this form stores AES-256 encrypted credentials in PostgreSQL, allowing dynamic
								switching without restarting Docker or touching server files.
							</div>
						</div>
					</div>
				)}

				{config?.testStatus === "error" && config?.testError && (
					<div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
						<div className="flex items-start gap-2">
							<Icon name="prohibit" className="mt-0.5 size-4 shrink-0" />
							<div>
								<strong>Connection Error:</strong> {config.testError}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Configuration & Testing Form */}
			<ServerAiForm
				key={configKey}
				config={config}
				onRefreshAll={() => {
					void refetch();
					onRefreshAll?.();
				}}
			/>

			{/* Economic Model & Credits Explainer */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-xl border border-line bg-surface p-5">
					<div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
						<Icon name="key" className="size-4.5" />
					</div>
					<h4 className="mt-3 text-sm font-semibold text-ink">Zero Client Setup</h4>
					<p className="mt-1 text-xs leading-relaxed text-ink-3">
						Users don&apos;t need their own OpenAI or Anthropic API accounts. The server orchestrates requests securely
						on their behalf.
					</p>
				</div>

				<div className="rounded-xl border border-line bg-surface p-5">
					<div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
						<Icon name="crown" className="size-4.5" />
					</div>
					<h4 className="mt-3 text-sm font-semibold text-ink">AI Credit Economy</h4>
					<p className="mt-1 text-xs leading-relaxed text-ink-3">
						Resume tailoring, STAR stories, and ATS scans burn user AI wallet credits. Admins can grant or reset credits
						in the Account tab.
					</p>
				</div>

				<div className="rounded-xl border border-line bg-surface p-5">
					<div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500">
						<Icon name="shield-check" className="size-4.5" />
					</div>
					<h4 className="mt-3 text-sm font-semibold text-ink">Enterprise Encryption</h4>
					<p className="mt-1 text-xs leading-relaxed text-ink-3">
						Provider tokens are stored using AES-256-GCM authenticated encryption tied to your server&apos;s unique
						ENCRYPTION_SECRET.
					</p>
				</div>
			</div>
		</div>
	);
}

function ServerAiForm({ config, onRefreshAll }: { config: ServerAiConfigData | undefined; onRefreshAll?: () => void }) {
	const queryClient = useQueryClient();

	const initialProvider = (config?.configured && config.provider ? config.provider : "deepseek") as AIProvider;
	const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initialProvider);
	const [model, setModel] = useState<string>(
		config?.configured && config.model ? config.model : PROVIDER_PRESETS[initialProvider]?.defaultModel || "",
	);
	const [apiKey, setApiKey] = useState<string>("");
	const [showApiKey, setShowApiKey] = useState<boolean>(false);
	const [baseUrl, setBaseUrl] = useState<string>(config?.baseUrl || "");
	const [enabled, setEnabled] = useState<boolean>(config?.configured ? config.enabled : true);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

	// Test feedback state
	const [testResult, setTestResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	// When provider dropdown changes, set defaults
	const handleProviderChange = (newProvider: AIProvider) => {
		setSelectedProvider(newProvider);
		const preset = PROVIDER_PRESETS[newProvider];
		if (preset) {
			setModel(preset.defaultModel);
			setBaseUrl(preset.defaultBaseUrl);
		}
		setTestResult(null);
	};

	// Test connection mutation
	const testMutation = useMutation(
		orpc.admin.testServerAi.mutationOptions({
			onSuccess: (data) => {
				setTestResult({
					success: data.success,
					message: data.message,
				});
				if (data.success) {
					toast.add({
						type: "success",
						title: "Connection Test Succeeded",
						description: data.message,
					});
				} else {
					toast.add({
						type: "error",
						title: "Connection Test Failed",
						description: data.message,
					});
				}
			},
			onError: (err) => {
				setTestResult({
					success: false,
					message: err.message,
				});
				toast.add({
					type: "error",
					title: "Handshake Failed",
					description: err.message,
				});
			},
		}),
	);

	// Save configuration mutation
	const saveMutation = useMutation(
		orpc.admin.saveServerAi.mutationOptions({
			onSuccess: (data) => {
				toast.add({
					type: "success",
					title: "Server AI Saved & Active",
					description: data.message,
				});
				setApiKey(""); // Clear raw key input after saving
				void queryClient.invalidateQueries({ queryKey: orpc.admin.getServerAi.key() });
				onRefreshAll?.();
			},
			onError: (err) => {
				toast.add({
					type: "error",
					title: "Failed to Save Configuration",
					description: err.message,
				});
			},
		}),
	);

	// Delete configuration mutation
	const deleteMutation = useMutation(
		orpc.admin.deleteServerAi.mutationOptions({
			onSuccess: () => {
				toast.add({
					type: "success",
					title: "Configuration Cleared",
					description: "Database Server AI configuration removed. Falling back to environment variables.",
				});
				setDeleteModalOpen(false);
				setApiKey("");
				void queryClient.invalidateQueries({ queryKey: orpc.admin.getServerAi.key() });
				onRefreshAll?.();
			},
			onError: (err) => {
				toast.add({
					type: "error",
					title: "Delete Failed",
					description: err.message,
				});
			},
		}),
	);

	const handleTest = () => {
		setTestResult(null);
		testMutation.mutate({
			provider: selectedProvider,
			model: model.trim(),
			apiKey: apiKey.trim() || undefined,
			baseUrl: baseUrl.trim() || undefined,
		});
	};

	const handleSave = () => {
		saveMutation.mutate({
			provider: selectedProvider,
			model: model.trim(),
			apiKey: apiKey.trim() || undefined,
			baseUrl: baseUrl.trim() || undefined,
			enabled,
		});
	};

	const currentPreset = PROVIDER_PRESETS[selectedProvider];

	return (
		<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
			<div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-anybody text-base font-bold text-ink">Configure Platform AI Provider</h3>
					<p className="mt-1 text-xs text-ink-3">
						Select the AI model provider, enter API credentials, test the live connection handshake, and activate.
					</p>
				</div>
				{config?.source === "database" && (
					<Button
						variant="secondary"
						size="sm"
						onClick={() => setDeleteModalOpen(true)}
						className="gap-1.5 text-xs text-rose-500 hover:text-rose-600"
					>
						<Icon name="trash" className="size-3.5" />
						<span>Remove DB Override</span>
					</Button>
				)}
			</div>

			<div className="mt-6 space-y-6">
				{/* Provider Selection */}
				<div className="space-y-2">
					<Label htmlFor="admin-ai-provider" className="text-xs font-semibold text-ink">
						AI Model Provider
					</Label>
					<NativeSelect
						id="admin-ai-provider"
						value={selectedProvider}
						onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
						className="text-sm font-medium"
					>
						<option value="deepseek">DeepSeek (Recommended · Top Reasoning &amp; Lowest Cost)</option>
						<option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
						<option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet, Haiku)</option>
						<option value="gemini">Google Gemini (Gemini 1.5 Flash, Pro)</option>
						<option value="groq">Groq (Ultra-fast Llama 3.3)</option>
						<option value="mistral">Mistral AI (Mistral Large, Codestral)</option>
						<option value="ollama">Ollama (Self-Hosted Local Models)</option>
						<option value="openrouter">OpenRouter (Aggregator)</option>
						<option value="openai-compatible">OpenAI-Compatible Custom Endpoint</option>
						<option value="cohere">Cohere</option>
						<option value="xai">xAI Grok</option>
						<option value="togetherai">Together AI</option>
						<option value="fireworks">Fireworks AI</option>
						<option value="cerebras">Cerebras</option>
						<option value="perplexity">Perplexity</option>
					</NativeSelect>
					<p className="text-[11px] text-ink-3">
						DeepSeek, OpenAI, Anthropic, or Groq are ideal for STAR interview story generation and ATS resume tailoring.
					</p>
				</div>

				{/* Model Input & Quick Presets */}
				<div className="space-y-2">
					<Label htmlFor="admin-ai-model" className="text-xs font-semibold text-ink">
						Model Identifier
					</Label>
					<Input
						id="admin-ai-model"
						value={model}
						onChange={(e) => {
							setModel(e.target.value);
							setTestResult(null);
						}}
						placeholder="e.g. deepseek-chat or gpt-4o-mini"
						className="font-mono text-sm"
					/>
					{currentPreset?.models && (
						<div className="flex flex-wrap items-center gap-1.5 pt-1">
							<span className="text-[11px] text-ink-3">Popular presets:</span>
							{currentPreset.models.map((m) => (
								<button
									key={m}
									type="button"
									onClick={() => {
										setModel(m);
										setTestResult(null);
									}}
									className={cn(
										"rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors",
										model === m
											? "border-accent bg-accent/15 font-bold text-accent-text"
											: "border-line bg-raised text-ink-2 hover:border-line-2",
									)}
								>
									{m}
								</button>
							))}
						</div>
					)}
				</div>

				{/* API Key Input */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="admin-ai-key" className="text-xs font-semibold text-ink">
							API Key
						</Label>
						{config?.apiKeyPreview && (
							<span className="text-[11px] text-ink-3">
								Currently stored: <code className="font-mono text-ink-2">{config.apiKeyPreview}</code>
							</span>
						)}
					</div>
					<div className="relative">
						<Input
							id="admin-ai-key"
							type={showApiKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => {
								setApiKey(e.target.value);
								setTestResult(null);
							}}
							placeholder={
								config?.apiKeyPreview
									? "Leave blank to keep current stored key, or enter new key..."
									: selectedProvider === "ollama"
										? "Optional for Ollama"
										: "Enter your provider API key (sk-...)"
							}
							className="pe-10 font-mono text-sm"
							autoComplete="off"
						/>
						<button
							type="button"
							onClick={() => setShowApiKey(!showApiKey)}
							className="absolute inset-e-2 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink"
							title={showApiKey ? "Hide API Key" : "Show API Key"}
						>
							<Icon name={showApiKey ? "eye-slash" : "eye"} className="size-4" />
						</button>
					</div>
					<p className="text-[11px] text-ink-3">
						Stored encrypted with AES-256-GCM. Decrypted only in-memory when servicing user AI operations.
					</p>
				</div>

				{/* Custom Base URL */}
				<div className="space-y-2">
					<Label htmlFor="admin-ai-base-url" className="text-xs font-semibold text-ink">
						API Base URL (Optional)
					</Label>
					<Input
						id="admin-ai-base-url"
						value={baseUrl}
						onChange={(e) => {
							setBaseUrl(e.target.value);
							setTestResult(null);
						}}
						placeholder={currentPreset?.defaultBaseUrl || "Leave empty for standard official endpoint"}
						className="font-mono text-sm"
					/>
					<p className="text-[11px] text-ink-3">
						Override endpoint for private relays, local Ollama instances, or regional reverse proxies.
					</p>
				</div>

				{/* Enabled Toggle */}
				<div className="flex items-center justify-between rounded-lg border border-line bg-raised/40 p-4">
					<div className="space-y-0.5">
						<Label htmlFor="admin-ai-enable" className="text-xs font-semibold text-ink">
							Enable for Platform Users
						</Label>
						<p className="text-[11px] text-ink-3">
							When active, all registered users will utilize this AI model for resume actions.
						</p>
					</div>
					<Switch id="admin-ai-enable" checked={enabled} onCheckedChange={setEnabled} />
				</div>

				{/* Test Feedback Alert Box */}
				{testResult && (
					<div
						className={cn(
							"rounded-lg border p-4 text-xs",
							testResult.success
								? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
								: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
						)}
					>
						<div className="flex items-start gap-2.5">
							<Icon name={testResult.success ? "check-circle" : "prohibit"} className="mt-0.5 size-4.5 shrink-0" />
							<div className="space-y-1">
								<strong className="block text-sm font-semibold">
									{testResult.success ? "Connection Test Successful" : "Connection Test Failed"}
								</strong>
								<p>{testResult.message}</p>
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
					<Button
						type="button"
						variant="secondary"
						onClick={handleTest}
						disabled={testMutation.isPending || saveMutation.isPending}
						className="gap-2 text-xs"
					>
						{testMutation.isPending ? (
							<>
								<Icon name="arrows-clockwise" className="size-3.5 animate-spin" />
								<span>Testing Handshake...</span>
							</>
						) : (
							<>
								<Icon name="lightning" className="size-3.5" />
								<span>Test Connection</span>
							</>
						)}
					</Button>

					<Button
						type="button"
						variant="primary"
						onClick={handleSave}
						disabled={testMutation.isPending || saveMutation.isPending}
						className="gap-2 text-xs"
					>
						{saveMutation.isPending ? (
							<>
								<Icon name="arrows-clockwise" className="size-3.5 animate-spin" />
								<span>Verifying &amp; Saving...</span>
							</>
						) : (
							<>
								<Icon name="check" className="size-3.5" />
								<span>Save &amp; Activate</span>
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-rose-500">
							<Icon name="trash" className="size-5" />
							<span>Remove Database Server AI Config?</span>
						</DialogTitle>
						<DialogDescription className="text-xs text-ink-3">
							This will remove the PostgreSQL override for the Server-Wide AI provider. If you have environment
							variables configured in <code className="font-mono">.env.local</code>, the server will fall back to them.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={() => deleteMutation.mutate({})}
							disabled={deleteMutation.isPending}
							className="gap-1.5"
						>
							{deleteMutation.isPending && <Icon name="arrows-clockwise" className="size-3.5 animate-spin" />}
							<span>Confirm Remove</span>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
