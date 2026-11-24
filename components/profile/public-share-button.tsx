"use client";

import { useSyncExternalStore } from "react";
import { Copy } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { PiShareFat } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHref, useT } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";

const subscribeToShareSupport = () => () => {};

const shareLabels = {
  profile: {
    title: "profile.shareProfile",
    description: "profile.shareProfileText",
    text: "profile.shareText",
    copied: "profile.linkCopiedText",
    whatsapp: "profile.shareWhatsappText",
    telegram: "profile.shareTelegramText",
  },
  company: {
    title: "products.companyShare",
    description: "products.companyShareDescription",
    text: "products.companyShareText",
    copied: "products.companyLinkCopied",
    whatsapp: "products.companyShareWhatsapp",
    telegram: "products.companyShareTelegram",
  },
  product: {
    title: "products.itemShare",
    description: "products.itemShareDescription",
    text: "products.itemShareText",
    copied: "products.itemLinkCopied",
    whatsapp: "products.itemShareWhatsapp",
    telegram: "products.itemShareTelegram",
  },
} as const;

export function PublicShareButton({
  name,
  href,
  kind = "profile",
}: {
  name: string;
  href: string;
  kind?: keyof typeof shareLabels;
}) {
  const t = useT();
  const localize = useHref();
  const canUseNativeShare = useSyncExternalStore(
    subscribeToShareSupport,
    () => typeof navigator.share === "function",
    () => false,
  );
  const labels = shareLabels[kind];
  const label = t("profile.share");
  const text = t(labels.text, { name });
  const getUrl = () => new URL(localize(href), window.location.origin).href;
  const getMessage = (url: string) =>
    kind === "profile" ? t("profile.shareMessage", { name, url }) : `${text}\n${url}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      toast.success(t("profile.linkCopied"), {
        description: t(labels.copied),
      });
    } catch {
      toast.error(t("profile.copyError"));
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: name, text, url: getUrl() });
    } catch {
      // The user dismissed native sharing or the browser blocked it.
    }
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getMessage(getUrl()))}`, "_blank", "noopener,noreferrer");
  };

  const handleTelegramShare = () => {
    const url = getUrl();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(getMessage(url))}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const trigger = (
    <TooltipTrigger
      render={
        <Button
          type="button"
          variant="secondary"
          size="icon-lg"
          aria-label={label}
          {...(canUseNativeShare ? { onClick: handleNativeShare } : {})}
        />
      }
    >
      <PiShareFat aria-hidden="true" />
    </TooltipTrigger>
  );

  if (canUseNativeShare) {
    return (
      <Tooltip>
        {trigger}
        <TooltipContent><p>{label}</p></TooltipContent>
      </Tooltip>
    );
  }

  const actions = [
    {
      label: t("profile.shareWhatsapp"),
      description: t(labels.whatsapp),
      icon: BsWhatsapp,
      onClick: handleWhatsAppShare,
      className: "text-success",
    },
    {
      label: t("profile.shareTelegram"),
      description: t(labels.telegram),
      icon: FaTelegramPlane,
      onClick: handleTelegramShare,
      className: "text-sky-500",
    },
    {
      label: t("profile.copyLink"),
      description: t("profile.copyLinkText"),
      icon: Copy,
      onClick: handleCopyLink,
      className: "text-sky-600",
    },
  ];

  return (
    <Sheet>
      <Tooltip>
        <SheetTrigger render={trigger} />
        <TooltipContent><p>{label}</p></TooltipContent>
      </Tooltip>
      <SheetContent side="bottom">
        <SheetHeader className="text-left">
          <SheetTitle>{t(labels.title)}</SheetTitle>
          <SheetDescription>
            {rich(t(labels.description), {
              name: <strong>{name}</strong>,
            })}
          </SheetDescription>
        </SheetHeader>
        <div className="flex w-full flex-col gap-2 p-4 md:flex-row">
          {actions.map(({ label, description, icon: Icon, onClick, className }) => (
            <SheetClose
              key={label}
              render={
                <Button type="button" variant="outline" className="h-auto w-full justify-start gap-3 p-4 text-left md:w-1/3" onClick={onClick} />
              }
            >
              <span className={className}><Icon className="size-5" aria-hidden="true" /></span>
              <span className="flex min-w-0 flex-col items-start">
                <span className="font-semibold text-text-main">{label}</span>
                <span className="whitespace-normal text-xs text-muted-foreground">{description}</span>
              </span>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
