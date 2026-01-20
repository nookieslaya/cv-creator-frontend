import { useEffect, useState } from "react";
import type { CvTheme } from "../types/theme";
import SelectField from "./SelectField";

type ThemeEditorProps = {
  theme: CvTheme;
  defaults: CvTheme;
  onChange: (next: Partial<CvTheme>) => void;
  onReset: () => void;
  template: string;
  disabled?: boolean;
  disabledTitle?: string;
  disabledDescription?: string;
};

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText: string;
};

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

function ColorField({ label, value, onChange, helpText }: ColorFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = (next: string) => {
    if (HEX_COLOR.test(next)) {
      onChange(next);
    } else {
      setDraft(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs uppercase tracking-[0.2em] text-slate"
        title={helpText}
      >
        {label}
      </span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setDraft(event.target.value);
          }}
          className="h-10 w-12 rounded-md border border-slate/30 bg-white"
        />
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          className="flex-1 rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
          placeholder="#0f172a"
        />
      </div>
    </div>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  helpText: string;
  disabled?: boolean;
};

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  helpText,
  disabled = false,
}: RangeFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate">
      <span
        className="text-xs uppercase tracking-[0.2em] text-slate"
        title={helpText}
      >
        {label}
      </span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="flex-1"
          disabled={disabled}
        />
        <span className="w-10 text-right text-xs text-ink">{value}px</span>
      </div>
    </label>
  );
}

export default function ThemeEditor({
  theme,
  defaults,
  onChange,
  onReset,
  template,
  disabled = false,
  disabledTitle,
  disabledDescription,
}: ThemeEditorProps) {
  const showSidebar = template === "premium-executive";
  const showColumnGap = template === "premium-modern";

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">Theme editor</h3>
          <p className="mt-1 text-sm text-slate">
            Adjust safe design tokens only. Layout stays ATS-friendly and
            stable.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate/40 px-3 py-2 text-xs font-semibold text-slate"
          disabled={disabled}
        >
          Reset defaults
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <h4 className="text-sm font-semibold text-ink">Colors</h4>
          <ColorField
            label="Primary"
            value={theme.primaryColor}
            onChange={(value) => onChange({ primaryColor: value })}
            helpText="Used for name and key headings."
          />
          <ColorField
            label="Accent"
            value={theme.accentColor}
            onChange={(value) => onChange({ accentColor: value })}
            helpText="Used for section titles and accents."
          />
          <ColorField
            label="Secondary"
            value={theme.secondaryColor}
            onChange={(value) => onChange({ secondaryColor: value })}
            helpText="Used for body text."
          />
        </div>

        <div className="space-y-5">
          <h4 className="text-sm font-semibold text-ink">Typography</h4>
          <RangeField
            label="Name size"
            value={theme.fontScale.name}
            min={18}
            max={32}
            onChange={(value) => onChange({ fontScale: { name: value } })}
            helpText="Controls the main name size."
          />
          <RangeField
            label="Section title size"
            value={theme.fontScale.section}
            min={9}
            max={14}
            onChange={(value) => onChange({ fontScale: { section: value } })}
            helpText="Section headings (e.g. Experience, Projects)."
          />
          <RangeField
            label="Body size"
            value={theme.fontScale.body}
            min={10}
            max={14}
            onChange={(value) => onChange({ fontScale: { body: value } })}
            helpText="Main body text size."
          />
          <RangeField
            label="Meta size"
            value={theme.fontScale.meta}
            min={9}
            max={12}
            onChange={(value) => onChange({ fontScale: { meta: value } })}
            helpText="Secondary info like dates and labels."
          />
        </div>

        <div className="space-y-5">
          <h4 className="text-sm font-semibold text-ink">Skills layout</h4>
          <div className="flex flex-col gap-2 text-sm text-slate">
            <span
              className="text-xs uppercase tracking-[0.2em] text-slate"
              title="Choose how skills are displayed."
            >
              Layout
            </span>
            <SelectField
              value={theme.skills.layout}
              onChange={(value) =>
                onChange({
                  skills: {
                    layout: value as CvTheme["skills"]["layout"],
                  },
                })
              }
              options={[
                { value: "list", label: "List (bullets)" },
                { value: "inline", label: "Inline cloud" },
                { value: "grouped", label: "Grouped by level" },
              ]}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-sm font-semibold text-ink">Spacing</h4>
          <RangeField
            label="Section spacing"
            value={theme.spacing.section}
            min={0}
            max={24}
            onChange={(value) => onChange({ spacing: { section: value } })}
            helpText="Vertical distance between sections."
          />
          <RangeField
            label="Item spacing"
            value={theme.spacing.item}
            min={0}
            max={20}
            onChange={(value) => onChange({ spacing: { item: value } })}
            helpText="Distance between list items or entries."
          />
        </div>

        <div className="space-y-5">
          <h4 className="text-sm font-semibold text-ink">Layout</h4>
          <RangeField
            label="Column gap"
            value={theme.layout.columnGap ?? defaults.layout.columnGap ?? 20}
            min={16}
            max={32}
            onChange={(value) => onChange({ layout: { columnGap: value } })}
            helpText="Space between columns (premium modern)."
            disabled={!showColumnGap || disabled}
          />
          <RangeField
            label="Sidebar width"
            value={
              theme.layout.sidebarWidth ?? defaults.layout.sidebarWidth ?? 220
            }
            min={180}
            max={260}
            onChange={(value) => onChange({ layout: { sidebarWidth: value } })}
            helpText="Sidebar width (premium executive)."
            disabled={!showSidebar || disabled}
          />
          {!showColumnGap ? (
            <p className="text-xs text-slate">
              Column gap applies to Premium Modern.
            </p>
          ) : null}
          {!showSidebar ? (
            <p className="text-xs text-slate">
              Sidebar width applies to Premium Executive.
            </p>
          ) : null}
        </div>
      </div>

      {disabled ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
          <div className="rounded-xl border border-slate/20 bg-white px-6 py-4 text-center shadow-panel">
            <p className="text-sm font-semibold text-ink">
              {disabledTitle ?? "Theme customization is a Premium feature"}
            </p>
            <p className="mt-1 text-xs text-slate">
              {disabledDescription ??
                "Upgrade to unlock advanced styling controls."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
