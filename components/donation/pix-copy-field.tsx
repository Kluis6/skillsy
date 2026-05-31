"use client";

import { toast } from "sonner";

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
  const handleCopy = async () => {
    try {
      await copyText(pixKey);
      toast.success("Chave Pix copiada!", {
        description: "Cole no app do seu banco para continuar a doação.",
      });
    } catch {
      toast.error("Não foi possível copiar a chave Pix.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="block w-full rounded-xl border border-border-subtle bg-surface p-4 text-left transition-colors hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      aria-label="Copiar chave Pix"
    >
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
        Chave Pix
      </span>
      <code className="block break-all rounded-xl bg-card px-3 py-3 text-sm text-text-main">
        {pixKey}
      </code>
      <span className="mt-2 block text-xs font-medium text-primary">
        Toque ou clique para copiar
      </span>
    </button>
  );
}
