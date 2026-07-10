import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border-subtle bg-card p-5 md:flex-row md:items-center md:justify-between md:p-6",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold leading-tight text-text-main md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

type SurfacePanelProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
};

export function SurfacePanel({
  children,
  className,
  as = "section",
}: SurfacePanelProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        "rounded-xl border border-border-subtle bg-card p-5 md:p-6",
        className,
      )}
    >
      {children}
    </Component>
  );
}

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-surface text-primary">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-main">{title}</h2>
        {description ? (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
