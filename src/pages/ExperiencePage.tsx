import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import Field from "../components/Field";
import TagInput from "../components/TagInput";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import {
  createExperience,
  deleteExperience,
  listExperience,
  updateExperience,
} from "../api/experience";
import type { Experience } from "../types/api";

const emptyForm = {
  company: "",
  position: "",
  description: "",
  tags: [] as string[],
  startDate: "",
  endDate: "",
};

export default function ExperiencePage() {
  const { getToken } = useAuth();
  const [experience, setExperience] = useState<Experience[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadExperience = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listExperience(token);
      setExperience(data);
    } catch (err) {
      setLoadError("Unable to load experience.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperience();
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
        company: form.company,
        position: form.position,
        description: form.description,
        tags: form.tags,
        startDate: form.startDate,
        endDate: form.endDate || null,
      };
      if (editingId) {
        await updateExperience(token, editingId, payload);
      } else {
        await createExperience(token, payload);
      }
      await loadExperience();
      resetForm();
    } catch (err) {
      setActionError("Unable to save experience.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Experience) => {
    setEditingId(item.id);
    setForm({
      company: item.company,
      position: item.position,
      description: item.description,
      tags: item.tags ?? [],
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
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
      await deleteExperience(token, id);
      await loadExperience();
    } catch (err) {
      setActionError("Unable to delete experience.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading experience..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadExperience} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experience manager"
        description="Track roles and responsibilities, tagged for CV matching."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={editingId ? "Edit experience" : "Add experience"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Company" required>
            <input
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="Position" required>
            <input
              value={form.position}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, position: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="min-h-[96px] rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink md:col-span-2"
              required
            />
          </Field>
          <div className="md:col-span-2">
            <TagInput
              label="Tags"
              value={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              placeholder="Add a tag and press Enter"
            />
          </div>
          <Field label="Start date" required>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
            />
          </Field>
          <div className="flex items-center gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update experience" : "Add experience"}
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
      {experience.length === 0 ? (
        <EmptyState title="No experience yet" description="Add your first role." />
      ) : (
        <Panel title="Current experience">
          <div className="space-y-3">
            {experience.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {item.company} - {item.position}
                    </p>
                    <p className="mt-1 text-xs text-slate">{item.description}</p>
                    <p className="mt-2 text-xs text-slate">
                      {item.startDate ? item.startDate.slice(0, 10) : ""}
                      {item.endDate ? ` - ${item.endDate.slice(0, 10)}` : ""}
                      {item.tags.length ? ` | Tags: ${item.tags.join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-lg border border-slate/40 px-3 py-1 text-xs font-semibold text-slate"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
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
