import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  "data-testid"?: string;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  const base =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
  return (
    <div className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
