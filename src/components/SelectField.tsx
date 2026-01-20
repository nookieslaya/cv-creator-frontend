import { useEffect, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function SelectField({
  value,
  options,
  onChange,
  disabled = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [value]);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && ref.current.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected?.label ?? "Select"}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          aria-hidden="true"
          className="text-slate"
        >
          <path
            d="M1 1l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          className="absolute z-30 mt-2 w-full rounded-xl border border-slate/20 bg-white p-1 shadow-panel"
          onClick={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest("[data-select-option]")) {
              setOpen(false);
            }
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-select-option="true"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                option.value === value
                  ? "bg-accent-light text-accent"
                  : "text-slate hover:bg-surface"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
