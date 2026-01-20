import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import Field from "../components/Field";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { createLanguage, deleteLanguage, listLanguages, updateLanguage } from "../api/languages";
import type { Language } from "../types/api";

const emptyForm = {
  name: "",
  level: "",
};

export default function LanguagesPage() {
  const { getToken } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadLanguages = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listLanguages(token);
      setLanguages(data);
    } catch (err) {
      setLoadError("Unable to load languages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const payload = {
        name: form.name,
        level: form.level || null,
      };
      if (editingId) {
        await updateLanguage(token, editingId, payload);
      } else {
        await createLanguage(token, payload);
      }
      await loadLanguages();
      resetForm();
    } catch (err) {
      setActionError("Unable to save language.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (language: Language) => {
    setEditingId(language.id);
    setForm({
      name: language.name,
      level: language.level ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      await deleteLanguage(token, id);
      await loadLanguages();
    } catch (err) {
      setActionError("Unable to delete language.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading languages..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadLanguages} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Languages manager"
        description="Document language proficiency for global roles."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={editingId ? "Edit language" : "Add language"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Language" required>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="Level">
            <input
              value={form.level}
              onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="Fluent, B2, Native"
            />
          </Field>
          <div className="flex items-center gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update language" : "Add language"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate/40 px-4 py-2 text-sm font-semibold text-slate"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Panel>
      {languages.length === 0 ? (
        <EmptyState title="No languages yet" description="Add a language entry." />
      ) : (
        <Panel title="Current languages">
          <div className="space-y-3">
            {languages.map((language) => (
              <div
                key={language.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{language.name}</p>
                    <p className="text-xs text-slate">{language.level}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(language)}
                      className="rounded-lg border border-slate/40 px-3 py-1 text-xs font-semibold text-slate"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(language.id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
