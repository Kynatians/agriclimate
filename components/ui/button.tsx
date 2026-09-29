import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variantClasses = {
      default:
        "bg-[var(--primary)] text-[var(--primary-fg)] shadow hover:bg-[var(--primary-hover)] active:scale-[0.98]",
      destructive:
        "bg-[var(--status-danger)] text-white shadow-sm hover:opacity-90 active:scale-[0.98]",
      outline:
        "border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--fg-primary)] hover:bg-[var(--bg-surface-subtle)] active:scale-[0.98]",
      secondary:
        "bg-[var(--bg-surface-subtle)] text-[var(--fg-primary)] hover:bg-[var(--border-subtle)] active:scale-[0.98]",
      ghost:
        "hover:bg-[var(--bg-surface-subtle)] text-[var(--fg-primary)] active:scale-[0.98]",
      link: "text-[var(--primary)] underline-offset-4 hover:underline",
    }[variant];

    const sizeClasses = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10 p-2 flex items-center justify-center",
    }[size];

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantClasses,
          sizeClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
