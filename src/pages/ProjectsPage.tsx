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
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../api/projects";
import type { Project } from "../types/api";

const emptyForm = {
  name: "",
  description: "",
  role: "",
  tech: [] as string[],
  tags: [] as string[],
  url: "",
};

export default function ProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listProjects(token);
      setProjects(data);
    } catch (err) {
      setLoadError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
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
        description: form.description,
        role: form.role || null,
        tech: form.tech,
        tags: form.tags,
        url: form.url || null,
      };
      if (editingId) {
        await updateProject(token, editingId, payload);
      } else {
        await createProject(token, payload);
      }
      await loadProjects();
      resetForm();
    } catch (err) {
      setActionError("Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      role: project.role ?? "",
      tech: project.tech ?? [],
      tags: project.tags ?? [],
      url: project.url ?? "",
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
      await deleteProject(token, id);
      await loadProjects();
    } catch (err) {
      setActionError("Unable to delete project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading projects..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadProjects} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects manager"
        description="Keep key projects ready for tailored CV variants."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={editingId ? "Edit project" : "Add project"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Project name" required>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              required
            />
          </Field>
          <Field label="Role">
            <input
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
            />
          </Field>
          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="min-h-[96px] rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink md:col-span-2"
              required
            />
          </Field>
          <div className="md:col-span-2">
            <TagInput
              label="Tech stack"
              value={form.tech}
              onChange={(tech) => setForm((prev) => ({ ...prev, tech }))}
              placeholder="React, Node, PostgreSQL"
            />
          </div>
          <div className="md:col-span-2">
            <TagInput
              label="Tags"
              value={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              placeholder="Add a tag and press Enter"
            />
          </div>
          <Field label="Project URL">
            <input
              value={form.url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, url: event.target.value }))
              }
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="https://project-demo.com"
            />
          </Field>
          <div className="flex items-center gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update project"
                  : "Add project"}
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
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project."
        />
      ) : (
        <Panel title="Current projects">
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-col flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      {project.description}
                    </p>
                    <p className="mt-2 text-xs text-slate">
                      {project.role ? `Role: ${project.role}` : ""}
                      {project.tech.length
                        ? ` | Tech: ${project.tech.join(", ")}`
                        : ""}
                      {project.tags.length
                        ? ` | Tags: ${project.tags.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
                      className="rounded-lg border border-slate/40 px-3 py-1 text-xs font-semibold text-slate"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
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
