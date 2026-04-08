"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  Wand2,
  Flame,
  Download,
  FileJson,
  LayoutPanelTop,
} from "lucide-react";
import { extractVideoFrame, fileToBase64 } from "@/lib/utils";
import type { GeneratedCopy } from "@/lib/schemas";
import { ResultCard } from "./result-card";
import { AdPreviewCard } from "@/components/ad-preview-card";

const styles = [
  "Agressiva",
  "Emocional",
  "Premium",
  "Simples",
  "Direta para venda",
];

const objectives = ["Conversão", "Lead", "Tráfego", "WhatsApp"];
const platforms = ["Meta Ads", "Google Ads", "TikTok Ads"];

type FormState = {
  niche: string;
  objective: string;
  audience: string;
  offer: string;
  platform: string;
  tone: string;
  copyStyle: string;
  extraContext: string;
};

const initialForm: FormState = {
  niche: "",
  objective: "Conversão",
  audience: "",
  offer: "",
  platform: "Meta Ads",
  tone: "Persuasivo",
  copyStyle: "Direta para venda",
  extraContext: "",
};

type MetaReadyPayload = {
  campaign_context: {
    objective: string;
    style: string;
    platform: string;
    creative_type: "image" | "video";
    file_name: string;
    niche: string;
    audience: string;
    offer: string;
  };
  ads: Array<{
    name: string;
    primary_text: string;
    headline: string;
    description: string;
    call_to_action: string;
  }>;
  hooks: string[];
  angles: string[];
  strategy: {
    awareness_level: string;
    objective_fit: string;
    suggested_test_plan: string[];
  };
};

export function CampaignForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedCopy | null>(null);

  const isReady = useMemo(() => {
    return !!file && !!form.niche && !!form.audience && !!form.offer;
  }, [file, form]);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(selectedFile: File | null) {
    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }

    if (
      !selectedFile.type.startsWith("image/") &&
      !selectedFile.type.startsWith("video/")
    ) {
      setError("Na copy completa, envie uma imagem ou vídeo válido.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function handleSubmit(extraInstruction?: string) {
    try {
      setError("");
      setLoading(true);
      setResult(null);

      if (!file) {
        throw new Error("Selecione uma imagem ou vídeo.");
      }

      let imageBase64 = "";
      let mimeType = file.type;

      if (file.type.startsWith("video/")) {
        const frame = await extractVideoFrame(file);
        imageBase64 = frame.base64;
        mimeType = frame.mimeType;
      } else {
        imageBase64 = await fileToBase64(file);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          ...form,
          extraContext: extraInstruction
            ? `${form.extraContext}\n\nInstrução extra: ${extraInstruction}`.trim()
            : form.extraContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao gerar análise completa.");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const metaReadyPayload = useMemo<MetaReadyPayload | null>(() => {
    if (!result || !file) return null;

    const maxAds = Math.max(
      result.headlines.length,
      result.primary_texts.length,
      result.descriptions.length,
      result.ctas.length
    );

    const ads = Array.from({ length: maxAds }).map((_, index) => ({
      name: `Ad ${index + 1}`,
      primary_text: result.primary_texts[index] || result.primary_texts[0] || "",
      headline: result.headlines[index] || result.headlines[0] || "",
      description: result.descriptions[index] || result.descriptions[0] || "",
      call_to_action: result.ctas[index] || result.ctas[0] || "",
    }));

    return {
      campaign_context: {
        objective: form.objective,
        style: form.copyStyle,
        platform: form.platform,
        creative_type: file.type.startsWith("video/") ? "video" : "image",
        file_name: file.name,
        niche: form.niche,
        audience: form.audience,
        offer: form.offer,
      },
      ads,
      hooks: result.hooks,
      angles: result.angles,
      strategy: {
        awareness_level: result.campaign_strategy.awareness_level,
        objective_fit: result.campaign_strategy.objective_fit,
        suggested_test_plan: result.campaign_strategy.suggested_test_plan,
      },
    };
  }, [result, file, form]);

  function handleExportJson() {
    if (!metaReadyPayload) return;

    const blob = new Blob([JSON.stringify(metaReadyPayload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copy-completa-meta-ready-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const previewAds = metaReadyPayload?.ads ?? [];
  const previewMediaType = file?.type.startsWith("video/") ? "video" : "image";

  return (
    <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/60 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          Análise estratégica
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Copy completa
        </h1>

        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Faça uma leitura profunda do criativo e gere copy, ganchos, ângulos e
          estratégia em nível profissional.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[430px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Criativo
              </p>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-violet-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                <Upload className="mb-2 h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Clique ou arraste sua mídia
                </span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Imagem ou vídeo
                </span>

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {preview ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {file?.type.startsWith("video/") ? (
                    <video
                      src={preview}
                      controls
                      className="h-60 w-full object-cover"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview do criativo"
                      className="h-60 w-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-4 flex h-60 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">Preview da mídia</p>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Nicho"
              value={form.niche}
              onChange={(v) => updateField("niche", v)}
              placeholder="Ex: Moda feminina"
            />

            <Input
              label="Público"
              value={form.audience}
              onChange={(v) => updateField("audience", v)}
              placeholder="Ex: Mulheres de 25 a 40 anos"
            />

            <Input
              label="Oferta"
              value={form.offer}
              onChange={(v) => updateField("offer", v)}
              placeholder="Ex: 30% off + frete grátis"
            />

            <Select
              label="Objetivo"
              value={form.objective}
              onChange={(v) => updateField("objective", v)}
              options={objectives}
            />

            <Select
              label="Plataforma"
              value={form.platform}
              onChange={(v) => updateField("platform", v)}
              options={platforms}
            />

            <Input
              label="Tom"
              value={form.tone}
              onChange={(v) => updateField("tone", v)}
              placeholder="Ex: Persuasivo, premium, direto"
            />

            <Select
              label="Estilo de copy"
              value={form.copyStyle}
              onChange={(v) => updateField("copyStyle", v)}
              options={styles}
            />

            <TextArea
              label="Contexto extra"
              value={form.extraContext}
              onChange={(v) => updateField("extraContext", v)}
              placeholder="Ex: campanha de remarketing, público já conhece o problema, produto com ticket médio alto..."
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!isReady || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-5 py-3 font-semibold text-white transition hover:from-violet-800 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Gerando..." : "Gerar análise completa"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSubmit("Gere novas variações, mais diferentes entre si.")
                }
                disabled={!isReady || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Wand2 className="h-4 w-4" />
                Mais variações
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSubmit(
                    "Gere versões mais fortes, mais chamativas e com foco maior em clique e conversão."
                  )
                }
                disabled={!isReady || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Flame className="h-4 w-4" />
                Mais forte
              </button>
            </div>

            {metaReadyPayload ? (
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Exportar JSON Meta-ready
              </button>
            ) : null}

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <div className="mb-1 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Processamento de vídeo
              </div>
              <p>
                Quando você envia um vídeo, o sistema extrai automaticamente um
                frame e usa esse frame para gerar a análise completa.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4 overflow-x-hidden">
          {result ? (
            <>
              <ResultCard data={result} />

              {previewAds.length > 0 ? (
                <AdPreviewSection
                  ads={previewAds}
                  mediaUrl={preview}
                  mediaType={previewMediaType}
                />
              ) : null}

              {metaReadyPayload ? <JsonPreview payload={metaReadyPayload} /> : null}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>
  );
}

function AdPreviewSection({
  ads,
  mediaUrl,
  mediaType,
}: {
  ads: MetaReadyPayload["ads"];
  mediaUrl?: string;
  mediaType: "image" | "video";
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-4 flex items-center gap-2">
        <LayoutPanelTop className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Preview estilo anúncio
        </h3>
      </div>

      <div className="grid min-w-0 gap-4 grid-cols-1 2xl:grid-cols-2">
        {ads.slice(0, 4).map((ad, index) => (
          <div key={ad.name + index} className="min-w-0">
            <AdPreviewCard
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              primaryText={ad.primary_text}
              headline={ad.headline}
              description={ad.description}
              cta={ad.call_to_action}
              pageName="Copy AI"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonPreview({ payload }: { payload: MetaReadyPayload }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Preview do JSON Meta-ready
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyJson}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? "Copiado" : "Copiar JSON"}
        </button>
      </div>

      <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-violet-300">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[540px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Sparkles className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          O resultado vai aparecer aqui
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Envie uma imagem ou vídeo, defina o contexto da campanha e gere análise
          completa, copy e estratégia.
        </p>
      </div>
    </div>
  );
}
