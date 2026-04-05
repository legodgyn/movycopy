"use client";

type AdPreviewCardProps = {
  mediaUrl?: string;
  mediaType?: "image" | "video";
  primaryText: string;
  headline: string;
  description?: string;
  cta: string;
  pageName?: string;
};

export function AdPreviewCard({
  mediaUrl,
  mediaType = "image",
  primaryText,
  headline,
  description,
  cta,
  pageName = "Sua Marca",
}: AdPreviewCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-purple-700 text-sm font-bold text-white">
            {pageName.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {pageName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patrocinado
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
          {primaryText}
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900">
        {mediaUrl ? (
          mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              className="h-56 w-full object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview do anúncio"
              className="h-56 w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            Preview do criativo
          </div>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            www.seusite.com
          </p>
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {headline}
          </h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-700 to-purple-700 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-900/20"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}