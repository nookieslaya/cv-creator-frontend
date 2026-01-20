import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export default function Field({ label, hint, required, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate">
      <span className="text-xs uppercase tracking-[0.2em] text-slate">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
    </label>
  );
}
