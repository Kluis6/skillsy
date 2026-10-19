import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: ReactNode;
  /** Heading level that fits the page outline; defaults to h3. */
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
};

/**
 * Icon + title + description card, modeled on the "Uma rede feita por
 * pessoas" cards on the home page: a tinted icon column on the left and the
 * text on the right. Use it for every informational card of this kind.
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  titleAs: Title = "h3",
  className,
}: FeatureCardProps) {
  return (
    <div
      data-slot="feature-card"
      className={cn(
        "flex h-full border border-border-subtle bg-card shadow-md",
        className,
      )}
    >
      <div className="flex w-1/3 max-w-32 shrink-0 items-center justify-center bg-primary/10">
        <Icon className="size-7 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 space-y-2 p-4 md:p-6">
        <Title className="font-heading text-lg font-bold text-text-main md:text-xl">
          {title}
        </Title>
        <p className="text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
