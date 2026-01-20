import { useState } from "react";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-slate">{label}</span>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent"
          >
            {tag} x
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
}
