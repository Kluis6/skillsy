"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

type PixCopyFieldProps = {
  pixKey: string;
};

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export function PixCopyField({ pixKey }: PixCopyFieldProps) {
  const t = useT();
  const handleCopy = async () => {
    try {
      await copyText(pixKey);
      toast.success(t("donation.pixCopied"), {
        description: t("donation.pixCopiedText"),
      });
    } catch {
      toast.error(t("donation.pixCopyError"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="block w-full border border-border-subtle bg-surface p-4 text-left transition-colors hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-xs"
      aria-label={t("donation.copyPixAria")}
    >
      <span className="mb-3 flex items-center justify-between gap-3">
        <span>
          <span className="block text-xs font-bold text-text-muted">
            {t("donation.pixCopyPaste")}
          </span>
          <span className="mt-1 block text-sm font-semibold text-text-main">
            {t("donation.copyFullCode")}
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center bg-primary text-primary-foreground">
          <Copy className="size-4" />
        </span>
      </span>
      {/* The code embeds the recipient's name and CPF, so it is copied but
          not printed on the page. */}
      <span className="block border border-border-subtle bg-card px-3 py-3 text-sm leading-relaxed text-text-muted">
        {t("donation.pixReady")}
      </span>
      <span className="mt-3 block text-xs font-medium text-primary">
        {t("donation.tapToCopy")}
      </span>
    </button>
  );
}
