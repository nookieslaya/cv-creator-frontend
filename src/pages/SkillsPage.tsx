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
import { createSkill, deleteSkill, listSkills, updateSkill } from "../api/skills";
import type { Skill } from "../types/api";

const emptyForm = {
  name: "",
  level: "",
  tags: [] as string[],
  priority: 0,
};

export default function SkillsPage() {
  const { getToken } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSkills = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listSkills(token);
      setSkills(data);
    } catch (err) {
      setLoadError("Unable to load skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
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
      if (editingId) {
        await updateSkill(token, editingId, {
          name: form.name,
          level: form.level || null,
          tags: form.tags,
          priority: form.priority,
        });
      } else {
        await createSkill(token, {
          name: form.name,
          level: form.level || null,
          tags: form.tags,
          priority: form.priority,
        });
      }
      await loadSkills();
      resetForm();
    } catch (err) {
      setActionError("Unable to save skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      level: skill.level ?? "",
      tags: skill.tags ?? [],
      priority: skill.priority ?? 0,
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
      await deleteSkill(token, id);
      await loadSkills();
    } catch (err) {
      setActionError("Unable to delete skill.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading skills..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadSkills} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills manager"
        description="Track your skills with tags and priority for smarter CV matching."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={editingId ? "Edit skill" : "Add skill"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Skill name" required>
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
              placeholder="Senior, Advanced, etc."
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
          <Field label="Priority">
            <input
              type="number"
              value={form.priority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
            />
          </Field>
          <div className="flex items-center gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update skill" : "Add skill"}
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
      {skills.length === 0 ? (
        <EmptyState title="No skills yet" description="Add your first skill to get started." />
      ) : (
        <Panel title="Current skills">
          <div className="space-y-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {skill.name}{" "}
                      {skill.level ? <span className="text-slate">({skill.level})</span> : null}
                    </p>
                    <p className="text-xs text-slate">
                      Priority: {skill.priority}{" "}
                      {skill.tags.length ? `| Tags: ${skill.tags.join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(skill)}
                      className="rounded-lg border border-slate/40 px-3 py-1 text-xs font-semibold text-slate"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(skill.id)}
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
