import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
