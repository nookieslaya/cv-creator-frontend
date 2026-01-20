import type { CvManualOverride } from "../types/api";

type ManualSection<T extends { id: string }> = {
  key: keyof CvManualOverride;
  title: string;
  items: T[];
  overrides: Record<string, boolean>;
  getLabel: (item: T) => string;
  getMeta?: (item: T) => string | null;
  emptyLabel: string;
};

type ManualContentPanelProps = {
  open: boolean;
  onToggle: () => void;
  onReset: () => void;
  disabled: boolean;
  loading: boolean;
  error?: string | null;
  canCustomize: boolean;
  sections: Array<ManualSection<{ id: string }>>;
  onToggleItem: (
    section: keyof CvManualOverride,
    id: string,
    checked: boolean,
  ) => void;
};

export default function ManualContentPanel({
  open,
  onToggle,
  onReset,
  disabled,
  loading,
  error,
  canCustomize,
  sections,
  onToggleItem,
}: ManualContentPanelProps) {
  const toggleClasses = open
    ? "border-accent/40 bg-accent/10 text-accent"
    : "border-slate/40 bg-surface text-slate hover:border-accent/40 hover:text-accent";

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-md border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${toggleClasses}`}
        >
          {open ? "Hide" : "Show"} Customize CV Content (Advanced)
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate/40 px-3 py-2 text-xs font-semibold text-slate"
          disabled={disabled || !canCustomize}
        >
          Reset to automatic selection
        </button>
      </div>

      {open ? (
        <div className="relative rounded-2xl border border-slate/20 bg-white p-4">
          {loading ? (
            <p className="text-sm text-slate">Loading CV content...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !canCustomize ? (
            <p className="text-sm text-slate">
              Generate a preview to customize CV content.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {sections.map((section) => {
                const selectedCount = section.items.filter(
                  (item) => section.overrides[item.id],
                ).length;

                return (
                  <div key={section.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-ink">
                        {section.title}
                      </h4>
                      <span className="text-xs text-slate">
                        {selectedCount}/{section.items.length} selected
                      </span>
                    </div>
                    {section.items.length === 0 ? (
                      <p className="text-xs text-slate">{section.emptyLabel}</p>
                    ) : (
                      <div className="space-y-2">
                        {section.items.map((item) => {
                          const meta = section.getMeta?.(item) ?? null;
                          return (
                            <label
                              key={item.id}
                              className="flex items-start gap-2 rounded-lg border border-slate/10 bg-white/70 p-2 text-sm text-ink"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(section.overrides[item.id])}
                                onChange={(event) =>
                                  onToggleItem(
                                    section.key,
                                    item.id,
                                    event.target.checked,
                                  )
                                }
                                disabled={disabled}
                              />
                              <span className="space-y-1">
                                <span className="block text-sm font-medium text-ink">
                                  {section.getLabel(item)}
                                </span>
                                {meta ? (
                                  <span className="block text-xs text-slate">
                                    {meta}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {disabled ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
              <div className="rounded-xl border border-slate/20 bg-white px-6 py-4 text-center shadow-panel">
                <p className="text-sm font-semibold text-ink">
                  Manual content selection is a Premium feature
                </p>
                <p className="mt-1 text-xs text-slate">
                  Upgrade to unlock advanced selection controls.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
