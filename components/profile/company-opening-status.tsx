"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isCompanyOpen } from "@/lib/company-hours";
import { cn } from "@/lib/utils";

function subscribe(update: () => void) {
  const interval = window.setInterval(update, 15_000);
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", update);
  };
}

export function CompanyOpeningStatus({
  hours,
  days,
  timeZone,
  labels,
}: {
  hours: { opens: number; closes: number } | null;
  days: readonly string[];
  timeZone: string;
  labels: { open: string; closed: string; unavailable: string };
}) {
  const clock = useMemo(() => new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }), [timeZone]);
  const isOpen = useSyncExternalStore(
    subscribe,
    () => hours && days.length ? isCompanyOpen(hours, days, clock, new Date()) : null,
    () => null,
  );

  if (isOpen === null && hours && days.length) return <Skeleton className="h-5 w-16 rounded-full" />;

  return (
    <Badge
      variant="secondary"
      className={cn("min-w-0 shrink rounded-full", isOpen && "bg-success text-success-foreground")}
    >
      <span className="truncate">{isOpen === null ? labels.unavailable : isOpen ? labels.open : labels.closed}</span>
    </Badge>
  );
}
