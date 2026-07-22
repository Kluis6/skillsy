import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  UserRoundCheck,
} from "lucide-react";
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

type TrustPathProps = {
  className?: string;
  compact?: boolean;
};

const trustPathItems = [
  {
    label: "Perfil",
    description: "quem e o membro",
    icon: UserRoundCheck,
  },
  {
    label: "Contexto",
    description: "onde atua e como atende",
    icon: MapPin,
  },
  {
    label: "Contato",
    description: "proximo passo claro",
    icon: MessageCircle,
  },
];

export function TrustPath({ className, compact = false }: TrustPathProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-card p-3",
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-2">
        {trustPathItems.map((item, index) => (
          <div key={item.label} className="relative min-w-0">
            {index > 0 ? (
              <span className="absolute right-full top-5 hidden h-px w-2 bg-border-subtle sm:block" />
            ) : null}
            <div className="flex h-full flex-col gap-2 rounded-md bg-surface px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <item.icon className="size-3.5" />
                </span>
                <span className="truncate text-sm font-bold text-text-main">
                  {item.label}
                </span>
              </div>
              {!compact ? (
                <p className="text-xs leading-relaxed text-text-muted">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
