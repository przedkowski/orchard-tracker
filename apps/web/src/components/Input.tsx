import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  "data-testid"?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const testid = rest["data-testid"];
  const errorTestid = testid ? `${testid}-error` : undefined;

  const base =
    "block w-full rounded-lg border px-3 h-10 text-sm bg-slate-800 text-slate-100 " +
    "transition-colors duration-150 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-500";
  const state = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-slate-600 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`${base} ${state} ${className}`.trim()}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-400" data-testid={errorTestid}>
          {error}
        </p>
      )}
    </div>
  );
});
