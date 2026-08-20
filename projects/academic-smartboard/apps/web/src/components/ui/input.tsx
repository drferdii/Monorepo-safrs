import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn.ts";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-[var(--target-min)] w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-background-canvas)] px-[var(--space-3)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow,background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:[border:var(--border-width-strong)_solid_var(--color-status-critical)] aria-invalid:bg-[var(--color-surface-critical)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
