import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  "data-testid"?: string;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 " +
  "active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus:ring-emerald-500",
  secondary:
    "bg-slate-800 text-slate-200 border border-slate-600 shadow-sm hover:bg-slate-700 focus:ring-slate-500",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-500 focus:ring-red-500",
  ghost:
    "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:ring-slate-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes =
    `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
