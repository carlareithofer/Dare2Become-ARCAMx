import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field, fieldControlClass } from "./Field";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
        className={cn(fieldControlClass, className)}
        {...rest}
      />
    </Field>
  );
}
