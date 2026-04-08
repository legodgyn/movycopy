"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Lightbulb,
  Megaphone,
  Target,
  TrendingUp,
  PlaySquare,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import type { GeneratedCopy } from "@/lib/schemas";

type TabKey = "copies" | "analysis" | "strategy" | "video";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-violet-600 text-white shadow-lg"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const fullText = useMemo(() => items.join("\n"), [items]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        <CopyButton text={fullText} />
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

export function ResultCard({ data }: { data: GeneratedCopy }) {
  const hasVideoAnalysis = !!data.video_analysis;
  const [tab, setTab] = useState<TabKey>(hasVideoAnalysis ? "video" : "copies");

  const allCopiesText = useMemo(() => {
    return [
      "HEADLINES",
      ...data.headlines,
      "",
      "PRIMARY TEXTS",
      ...data.primary_texts,
      "",
      "DESCRIPTIONS",
      ...data.descriptions,
      "",
      "CTAS",
      ...data.ctas,
      "",
      "HOOKS",
      ...data.hooks,
      "",
      "ÂNGULOS",
      ...data.angles,
    ].join("\n");
  }, [data]);

  const diagnosisText = (data.diagnosis || []).join("\n");
  const improvementsText = (data.improvements || []).join("\n");

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Resultado da análise
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Organizado para leitura rápida, ajustes e teste de campanha.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasVideoAnalysis ? (
              <TabButton
                active={tab === "video"}
                onClick={() => setTab("video")}
                icon={<PlaySquare className="h-4 w-4" />}
                label="Vídeo"
              />
            ) : null}

            <TabButton
              active={tab === "copies"}
              onClick={() => setTab("copies")}
              icon={<Megaphone className="h-4 w-4" />}
              label="Copies"
            />
            <TabButton
              active={tab === "analysis"}
              onClick={() => setTab("analysis")}
              icon={<Lightbulb className="h-4 w-4" />}
              label="Análise"
            />
            <TabButton
              active={tab === "strategy"}
              onClick={() => setTab("strategy")}
              icon={<Target className="h-4 w-4" />}
              label="Estratégia"
            />
          </div>
        </div>
      </div>

      {tab === "video" && hasVideoAnalysis ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ScoreCard label="Hook" value={data.video_analysis!.hook_strength} />
            <ScoreCard label="Retenção" value={data.video_analysis!.retention_quality} />
            <ScoreCard label="Clareza" value={data.video_analysis!.clarity_score} />
            <ScoreCard label="CTA" value={data.video_analysis!.cta_strength} />
            <ScoreCard label="Geral" value={data.video_analysis!.overall_score} highlight />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Diagnóstico
                  </h3>
                </div>
                <CopyButton text={diagnosisText} />
              </div>

              <ul className="space-y-2">
                {(data.diagnosis || []).map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Melhorias práticas
                  </h3>
                </div>
                <CopyButton text={improvementsText} />
              </div>

              <ul className="space-y-2">
                {(data.improvements || []).map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "copies" ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pacote completo de copy
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tudo pronto para copiar e testar.
                </p>
              </div>
              <CopyButton text={allCopiesText} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ListBlock title="Headlines" items={data.headlines} />
            <ListBlock title="Primary Texts" items={data.primary_texts} />
            <ListBlock title="Descriptions" items={data.descriptions} />
            <ListBlock title="CTAs" items={data.ctas} />
            <ListBlock title="Hooks" items={data.hooks} />
            <ListBlock title="Ângulos" items={data.angles} />
          </div>
        </div>
      ) : null}

      {tab === "analysis" ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Análise do criativo
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leitura visual e pontos de melhoria.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Resumo
                </p>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {data.creative_analysis.summary}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Produto percebido
                </p>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {data.creative_analysis.perceived_product}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Pontos fortes
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {data.creative_analysis.visual_strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Pontos fracos
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {data.creative_analysis.visual_weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950/30">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Sugestões de melhoria
                </p>
                <CopyButton
                  text={data.creative_analysis.improvement_suggestions.join("\n")}
                />
              </div>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                {data.creative_analysis.improvement_suggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "strategy" ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Estratégia sugerida
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Interpretação tática para campanha.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nível de consciência
                </p>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {data.campaign_strategy.awareness_level}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fit com o objetivo
                </p>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {data.campaign_strategy.objective_fit}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Plano de teste
                </p>
                <CopyButton
                  text={data.campaign_strategy.suggested_test_plan.join("\n")}
                />
              </div>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800 dark:text-slate-200">
                {data.campaign_strategy.suggested_test_plan.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ScoreCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-xl ${
        highlight
          ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f172a]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}/10
      </p>
    </div>
  );
}
