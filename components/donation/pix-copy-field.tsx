"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";

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
      <span className="mb-3 flex items-center justify-between gap-3">
        <span>
          <span className="block text-xs font-bold text-text-muted">
            Pix copia e cola
          </span>
          <span className="mt-1 block text-sm font-semibold text-text-main">
            Copiar código completo
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary text-white">
          <Copy className="size-4" />
        </span>
      </span>
      <code className="block max-h-28 overflow-hidden break-all rounded-md border border-border-subtle bg-card px-3 py-3 text-xs leading-relaxed text-text-muted">
        {pixKey}
      </code>
      <span className="mt-3 block text-xs font-medium text-primary">
        Toque ou clique para copiar e colar no app do banco.
      </span>
    </button>
  );
}
