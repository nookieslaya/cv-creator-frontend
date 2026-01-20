type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate/40 bg-white p-6 text-sm text-slate">
      <p className="font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2">{description}</p> : null}
    </div>
  );
}
