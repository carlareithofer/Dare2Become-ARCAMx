import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors select-none " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Text bleumarin pe portocaliu – contrast bun și în soare.
  primary: "bg-accent text-brand hover:bg-accent-pressed active:bg-accent-pressed",
  secondary:
    "border-2 border-brand bg-surface-card text-brand hover:bg-slate-50 dark:border-slate-300 dark:bg-transparent dark:text-white dark:hover:bg-white/10",
  ghost: "text-brand hover:bg-brand/5 dark:text-slate-100 dark:hover:bg-white/10",
  danger: "bg-status-problem text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-4 text-base", // 48 px
  lg: "min-h-14 px-6 text-lg", // 56 px – butonul principal din aplicația șoferului
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function buttonClass({ variant = "primary", size = "md", fullWidth }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean;
}

export function Button({ variant, size, fullWidth, icon, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonClass({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

/** Link cu aspect de buton. */
export function ButtonLink({ variant, size, fullWidth, icon, className, children, ...rest }: ComponentProps<typeof Link> & StyleProps) {
  return (
    <Link className={cn(buttonClass({ variant, size, fullWidth }), className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
