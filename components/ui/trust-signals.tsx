import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustBadgeProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: "verified" | "ready" | "rating";
  value?: string | number;
};

export function TrustBadge({
  children,
  className,
  variant = "verified",
  value,
}: TrustBadgeProps) {
  const Icon =
    variant === "rating" ? Star : variant === "ready" ? CheckCircle2 : ShieldCheck;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        variant === "rating"
          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
          : "border-primary/10 bg-primary/10 text-primary",
        className,
      )}
    >
      <Icon
        className="size-3.5"
        fill={variant === "rating" ? "currentColor" : "none"}
      />
      {value ?? children ?? "Membro verificado"}
    </span>
  );
}

type PublicFieldHintProps = {
  children: React.ReactNode;
  className?: string;
};

export function PublicFieldHint({ children, className }: PublicFieldHintProps) {
  return (
    <p
      className={cn(
        "rounded-md bg-surface px-3 py-2 text-xs leading-relaxed text-text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
