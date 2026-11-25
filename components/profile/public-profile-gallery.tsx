"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/page-layout";
import { useAuth } from "@/hooks/use-auth";
import Link from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";
import { USE_STORAGE_EMULATOR } from "@/lib/storage-images";
import { PROFILE_LIMITS } from "@/lib/validations";
import type { GalleryItem } from "@/models/types";

export function PublicProfileGallery({
  ownerId,
  photos = [],
}: {
  ownerId: string;
  photos?: readonly (GalleryItem | string)[];
}) {
  const { user } = useAuth();
  const t = useT();
  const isOwner = user?.uid === ownerId;
  if (!isOwner && photos.length === 0) return null;

  return (
    <section aria-labelledby="public-photo-gallery" className="border-y border-border-subtle bg-card">
      <div className="container mx-auto space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="public-photo-gallery" className="text-base font-semibold text-text-main md:text-xl">
            {t("profile.gallery")}
          </h2>
          {isOwner && photos.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">
                {t("profile.galleryCount", { count: photos.length, max: PROFILE_LIMITS.galleryMaxItems })}
              </span>
              <Button size="sm" render={<Link href="/profile#perfil-de-servico" />} nativeButton={false}>
                {t("profile.manageGallery")}
              </Button>
            </div>
          )}
        </div>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((photo, index) => {
              const url = typeof photo === "string" ? photo : photo.url;
              const description = typeof photo === "string" ? undefined : photo.description?.trim();
              const alt = description || t("profile.galleryAlt", { n: index + 1 });
              return (
                <Dialog key={`${url}-${index}`}>
                  <DialogTrigger
                    render={<Button variant="outline" className="relative aspect-square h-auto w-full overflow-hidden bg-surface p-0 dark:bg-surface" />}
                  >
                    <Image
                      src={url}
                      alt={alt}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      unoptimized={USE_STORAGE_EMULATOR}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto bg-card p-0 sm:max-w-3xl">
                    <DialogTitle className="px-4 py-3 pr-12 text-base font-semibold">{t("profile.photoView")}</DialogTitle>
                    <div className="relative h-[65svh] bg-surface">
                      <Image
                        src={url}
                        alt={alt}
                        fill
                        sizes="(min-width: 800px) 768px, 100vw"
                        unoptimized={USE_STORAGE_EMULATOR}
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {description && <DialogDescription className="wrap-anywhere p-4">{description}</DialogDescription>}
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Camera aria-hidden="true" />}
            title={t("profile.galleryEmpty")}
            action={
              <Button size="sm" render={<Link href="/profile#perfil-de-servico" />} nativeButton={false}>
                {t("profile.addPhotos")}
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
