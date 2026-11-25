import type { ReactNode } from "react";

type PublicProfileHeaderProps = {
  cover?: ReactNode;
  avatar: ReactNode;
  avatarBadge?: ReactNode;
  identity: ReactNode;
  coverAside?: ReactNode;
  recommendations?: ReactNode;
  desktopActions: ReactNode;
  mobileActions: ReactNode;
};

export function PublicProfileHeader({
  cover,
  avatar,
  avatarBadge,
  identity,
  coverAside,
  recommendations,
  desktopActions,
  mobileActions,
}: PublicProfileHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-card">
      <div className="relative h-26 bg-muted md:h-52">
        {cover ?? <div className="absolute inset-0 bg-linear-to-r from-primary/15 via-primary/5 to-surface" />}
      </div>
      <div className="container mx-auto flex flex-col px-4 pb-4">
        <div className="flex h-12 min-h-12 items-start justify-end gap-2 py-2 md:h-auto md:py-4">
          {avatarBadge && (
            <div className="ml-30 mr-auto flex min-w-0 sm:ml-34 md:ml-42">{avatarBadge}</div>
          )}
          <div className="hidden gap-2 md:flex">{desktopActions}</div>
          {coverAside && <div className="flex shrink-0 empty:hidden">{coverAside}</div>}
        </div>
        <div className="relative z-10 -mt-28 mb-4 size-28 sm:-mt-34 sm:size-32 md:-mt-38 md:size-40">
          {avatar}
        </div>
        <div className="flex items-start justify-between gap-3 md:gap-6">
          <div className="min-w-0 space-y-1 md:space-y-2">{identity}</div>
          {recommendations}
        </div>
        <div className="mt-4 w-full space-y-2 md:hidden">{mobileActions}</div>
      </div>
    </header>
  );
}
