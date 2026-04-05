"use client";

import { useMemo, useState } from "react";
import {
  Upload,
  Loader2,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  Sparkles,
  Wand2,
  Flame,
  Download,
  FileJson,
  LayoutPanelTop,
} from "lucide-react";
import { extractVideoFrame, fileToBase64 } from "@/lib/utils";
import { AdPreviewCard } from "@/components/ad-preview-card";

const styles = [
  "Agressiva",
  "Emocional",
  "Premium",
  "Simples",
  "Direta para venda",
];

const objectives = ["Venda", "Lead", "WhatsApp", "Tráfego"];

type QuickResult = {
  headlines: string[];
  primary_texts: string[];
  descriptions: string[];
  ctas: string[];
  hooks: string[];
  angles: string[];
};

type MetaReadyPayload = {
  campaign_context: {
    objective: string;
    style: string;
    creative_type: "image" | "video";
    file_name: string;
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
};

export default function CopyRapidaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [style, setStyle] = useState("Direta para venda");
  const [objective, setObjective] = useState("Venda");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<QuickResult | null>(null);

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
      setError("Envie uma imagem ou vídeo válido.");
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

      let base64 = "";
      let mimeType = file.type;

      if (file.type.startsWith("video/")) {
        const frame = await extractVideoFrame(file);
        base64 = frame.base64;
        mimeType = frame.mimeType;
      } else {
        base64 = await fileToBase64(file);
      }

      const res = await fetch("/api/generate-quick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          copyStyle: style,
          objective,
          extraInstruction: extraInstruction || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao gerar copy.");
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
        objective,
        style,
        creative_type: file.type.startsWith("video/") ? "video" : "image",
        file_name: file.name,
      },
      ads,
      hooks: result.hooks,
      angles: result.angles,
    };
  }, [result, file, objective, style]);

  function handleExportJson() {
    if (!metaReadyPayload) return;

    const blob = new Blob([JSON.stringify(metaReadyPayload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meta-ready-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const previewAds = metaReadyPayload?.ads ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/60 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          Geração instantânea
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Copy rápida
        </h1>

        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Suba um criativo, escolha o estilo e gere variações curtas para
          anúncio em poucos segundos.
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

            <Select
              label="Estilo de copy"
              value={style}
              onChange={setStyle}
              options={styles}
            />

            <Select
              label="Objetivo"
              value={objective}
              onChange={setObjective}
              options={objectives}
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!file || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-5 py-3 font-semibold text-white transition hover:from-violet-800 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Gerando..." : "Gerar copy rápida"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSubmit("Gere novas variações, mais diferentes entre si.")
                }
                disabled={!file || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Wand2 className="h-4 w-4" />
                Mais variações
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSubmit(
                    "Gere versões mais fortes, mais chamativas e com foco maior em clique."
                  )
                }
                disabled={!file || loading}
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
                frame e usa esse frame para gerar a copy rápida.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4 overflow-x-hidden">
          {result ? (
            <>
              <ResultBlock title="Headlines" items={result.headlines} />
              <ResultBlock
                title="Textos principais"
                items={result.primary_texts}
              />
              <ResultBlock title="Descriptions" items={result.descriptions} />
              <ResultBlock title="CTAs" items={result.ctas} />
              <ResultBlock title="Hooks" items={result.hooks} />
              <ResultBlock title="Ângulos" items={result.angles} />

              {previewAds.length > 0 ? (
                <AdPreviewSection
                  ads={previewAds}
                  mediaUrl={preview}
                  mediaType={
                    file?.type.startsWith("video/") ? "video" : "image"
                  }
                />
              ) : null}

              {metaReadyPayload ? (
                <JsonPreview payload={metaReadyPayload} />
              ) : null}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
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

function ResultBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(items.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h3>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {item}
          </div>
        ))}
      </div>
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
          Escolha uma mídia, defina estilo e objetivo, e gere variações rápidas
          para anúncio.
        </p>
      </div>
    </div>
  );
}