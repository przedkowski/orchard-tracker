import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  "data-testid"?: string;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  const base = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
  return (
    <div className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
