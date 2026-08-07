import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success-soft text-success-fg",
        warning: "border-transparent bg-warning-soft text-warning-fg",
        info: "border-transparent bg-info-soft text-info-fg",
        danger: "border-transparent bg-destructive-soft text-destructive-soft-fg",
        muted: "border-transparent bg-muted text-muted-foreground",
        pink: "border-transparent bg-chip-pink-soft text-chip-pink-fg",
        purple: "border-transparent bg-chip-purple-soft text-chip-purple-fg",
        cyan: "border-transparent bg-chip-cyan-soft text-chip-cyan-fg",
        teal: "border-transparent bg-chip-teal-soft text-chip-teal-fg",
        indigo: "border-transparent bg-chip-indigo-soft text-chip-indigo-fg",
        orange: "border-transparent bg-chip-orange-soft text-chip-orange-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
