import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  "data-testid"?: string;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  const base =
    "rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm shadow-slate-950/50";
  return (
    <div className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
