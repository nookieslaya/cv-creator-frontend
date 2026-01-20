import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  children: ReactNode;
};

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-panel">
      {title ? <h3 className="mb-4 text-lg font-semibold text-ink">{title}</h3> : null}
      {children}
    </section>
  );
}
