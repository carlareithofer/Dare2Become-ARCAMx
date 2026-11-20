import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-surface-card p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-lg font-semibold text-brand dark:text-white">{children}</h2>
      {action}
    </div>
  );
}
