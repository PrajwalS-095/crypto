import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-canvas hover:bg-accent-strong disabled:bg-line-strong disabled:text-surface",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken disabled:text-muted disabled:hover:bg-surface",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink disabled:text-muted disabled:hover:bg-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex shrink-0 items-center justify-center rounded font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
});
