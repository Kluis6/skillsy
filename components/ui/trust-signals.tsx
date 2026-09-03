import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type VerifiedMarkProps = {
  size?: number;
  className?: string;
};

/** The one verified-member signal: a compact icon meant to sit right after
 * a displayed name, everywhere a member's name is shown. Don't build a new
 * verification badge elsewhere — use this. */
export function VerifiedMark({ size = 14, className }: VerifiedMarkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex shrink-0 items-center text-primary",
              className,
            )}
          >
            <ShieldCheck size={size} aria-hidden="true" />
            <span className="sr-only">Membro verificado</span>
          </span>
        }
      />
      <TooltipContent>
        <p>Membro verificado</p>
      </TooltipContent>
    </Tooltip>
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
