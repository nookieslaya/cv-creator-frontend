import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import Field from "../components/Field";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import {
  createEducation,
  deleteEducation,
  listEducation,
  updateEducation,
} from "../api/education";
import type { Education } from "../types/api";

const emptyForm = {
  school: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
};

export default function EducationPage() {
  const { getToken } = useAuth();
  const [education, setEducation] = useState<Education[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEducation = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listEducation(token);
      setEducation(data);
    } catch (err) {
      setLoadError("Unable to load education.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEducation();
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
        school: form.school,
        degree: form.degree || null,
        field: form.field || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editingId) {
        await updateEducation(token, editingId, payload);
      } else {
        await createEducation(token, payload);
      }
      await loadEducation();
      resetForm();
    } catch (err) {
      setActionError("Unable to save education.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Education) => {
    setEditingId(item.id);
    setForm({
      school: item.school,
      degree: item.degree ?? "",
      field: item.field ?? "",
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
      await deleteEducation(token, id);
      await loadEducation();
    } catch (err) {
      setActionError("Unable to delete education.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading education..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadEducation} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education manager"
        description="Capture your academic history for every CV."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={editingId ? "Edit education" : "Add education"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="School" required>
            <input
              value={form.school}
              onChange={(event) => setForm((prev) => ({ ...prev, school: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="Degree">
            <input
              value={form.degree}
              onChange={(event) => setForm((prev) => ({ ...prev, degree: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
            />
          </Field>
          <Field label="Field">
            <input
              value={form.field}
              onChange={(event) => setForm((prev) => ({ ...prev, field: event.target.value }))}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
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
              {saving ? "Saving..." : editingId ? "Update education" : "Add education"}
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
      {education.length === 0 ? (
        <EmptyState title="No education yet" description="Add your first entry." />
      ) : (
        <Panel title="Current education">
          <div className="space-y-3">
            {education.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.school}</p>
                    <p className="mt-1 text-xs text-slate">
                      {[item.degree, item.field].filter(Boolean).join(" | ")}
                    </p>
                    <p className="mt-2 text-xs text-slate">
                      {item.startDate ? item.startDate.slice(0, 10) : ""}
                      {item.endDate ? ` - ${item.endDate.slice(0, 10)}` : ""}
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
