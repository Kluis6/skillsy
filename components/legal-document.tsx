import Link from "@/lib/i18n/navigation";
import { AlertTriangle, CheckCircle2, Info, RefreshCcw } from "lucide-react";
import type { LegalBlock, LegalDocumentContent } from "@/lib/legal/types";
import { getLocale, getT } from "@/lib/i18n/server";

type LegalDocumentProps = {
  content: LegalDocumentContent;
  /** The other legal page, linked at the end. */
  related: { href: string; label: string };
};

/** /termos and /privacidade: summary first, then an index and numbered
 * sections, so the points that matter are easy to find. */
export async function LegalDocument({ content, related }: LegalDocumentProps) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <div className="container mx-auto isolate -mt-8 mb-24 w-full px-4">
      <div className="space-y-6 border border-border-subtle bg-card p-4 shadow-sm md:p-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-text-main lg:text-3xl">{content.title}</h1>
          {locale !== "pt" ? (
            <p className="max-w-3xl border border-warning-border bg-warning-surface px-4 py-3 text-sm text-warning-foreground">
              {t("legal.translationNotice")}
            </p>
          ) : null}
          {content.intro.map((text) => (
            <p key={text} className="max-w-3xl text-base leading-relaxed text-text-muted">
              {text}
            </p>
          ))}
        </div>

        <section
          aria-labelledby="resumo"
          className="border-l-4 border-primary bg-primary/5 p-5 md:p-6">
          <h2 id="resumo" className="mb-4 text-lg font-bold text-text-main">
            {content.summary.title}
          </h2>
          <ul className="space-y-3">
            {content.summary.items.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed text-text-main">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-8">
        <nav aria-label={t("legal.index")} className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="border border-border-subtle bg-surface p-4 lg:sticky lg:top-24">
            <p className="mb-3 text-sm font-bold uppercase text-text-muted">{t("legal.index")}</p>
            <ol className="space-y-2 text-sm">
              {content.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-2 text-text-main hover:text-primary">
                    <span className="w-6 shrink-0 font-semibold text-primary">{index + 1}.</span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="col-span-12 space-y-10 lg:col-span-8 xl:col-span-9">
          {content.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <h2 className="flex gap-3 text-xl font-bold text-text-main lg:text-2xl">
                <span className="text-primary">{index + 1}.</span>
                <span>{section.title}</span>
              </h2>
              {section.blocks.map((block, blockIndex) => (
                <Block key={blockIndex} block={block} />
              ))}
            </section>
          ))}

          <footer className="flex flex-col gap-4 border-t border-border-subtle pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <RefreshCcw className="size-4 text-primary" />
              {t("legal.updated", { date: content.updatedAt })}
            </span>
            <Link href={related.href} className="font-semibold text-primary hover:underline">
              {related.label}
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-base leading-relaxed text-text-muted">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-text-muted">
              <span className="mt-2.5 size-1.5 shrink-0 bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const warning = block.tone === "warning";
      const Icon = warning ? AlertTriangle : Info;
      return (
        <div
          className={
            warning
              ? "border border-warning-border bg-warning-surface p-5"
              : "border border-primary/20 bg-primary/5 p-5"
          }>
          {block.title ? (
            <p className={`mb-3 flex gap-2 font-bold ${warning ? "text-warning-foreground" : "text-text-main"}`}>
              <Icon className={`mt-0.5 size-5 shrink-0 ${warning ? "text-warning" : "text-primary"}`} />
              {block.title}
            </p>
          ) : null}
          <ul className="space-y-2">
            {block.items.map((item) => (
              <li
                key={item}
                className={`flex gap-3 text-base leading-relaxed ${warning ? "text-warning-foreground" : "text-text-main"}`}>
                <span
                  className={`mt-2.5 size-1.5 shrink-0 ${warning ? "bg-warning" : "bg-primary"}`}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto border border-border-subtle">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface text-text-main">
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 align-top leading-relaxed ${cellIndex === 0 ? "font-medium text-text-main" : "text-text-muted"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
