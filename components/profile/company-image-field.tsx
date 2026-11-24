"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/provider";
import { USE_STORAGE_EMULATOR, type CompanyImageKind } from "@/lib/storage-images";

export function CompanyImageField({
  kind,
  label,
  src,
  hasCompanyImage,
  uploading,
  disabled,
  accept,
  onFileChange,
  onRemove,
}: {
  kind: CompanyImageKind;
  label: string;
  src?: string;
  hasCompanyImage: boolean;
  uploading: boolean;
  disabled: boolean;
  accept: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = `profile-${kind}-label`;
  const isLogo = kind === "company-logo";

  return (
    <Card size="sm" className="min-w-0 gap-3 border border-border-subtle p-3 ring-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`relative grid h-14 shrink-0 place-items-center overflow-hidden border border-border-subtle bg-surface text-text-muted ${isLogo ? "w-14" : "w-24"}`}>
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes={isLogo ? "56px" : "96px"}
              unoptimized={USE_STORAGE_EMULATOR || isLogo}
              className={isLogo ? "object-contain" : "object-cover"}
              referrerPolicy="no-referrer"
            />
          ) : (
            <ImageIcon className="size-5" aria-hidden="true" />
          )}
        </div>
        <h4 id={labelId} className="min-w-0 text-sm font-semibold text-text-main">{label}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-busy={uploading}
          aria-describedby={`${labelId} profile-company-images-help`}
          onClick={() => inputRef.current?.click()}
        >
          {uploading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t(hasCompanyImage ? "settings.companyImageChange" : "settings.companyImageAdd")}
        </Button>
        {hasCompanyImage && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} aria-describedby={labelId} onClick={onRemove}>
            {t("settings.companyImageRemove")}
          </Button>
        )}
      </div>
      <Input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onFileChange} aria-labelledby={labelId} />
    </Card>
  );
}
