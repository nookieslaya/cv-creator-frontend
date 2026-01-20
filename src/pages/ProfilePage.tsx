import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import Field from "../components/Field";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { ApiError } from "../api/client";
import { createProfile, getProfile, updateProfile } from "../api/profile";
import type { Profile } from "../types/api";

const emptyForm = {
  fullName: "",
  title: "",
  summary: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
};

export default function ProfilePage() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await getProfile(token);
      setProfile(data);
      setForm({
        fullName: data.fullName ?? "",
        title: data.title ?? "",
        summary: data.summary ?? "",
        location: data.location ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        website: data.website ?? "",
        github: data.github ?? "",
        linkedin: data.linkedin ?? "",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null);
        setForm(emptyForm);
      } else {
        setLoadError("Unable to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const payload = {
        ...form,
        title: form.title || null,
        summary: form.summary || null,
        location: form.location || null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        github: form.github || null,
        linkedin: form.linkedin || null,
      };
      const data = profile
        ? await updateProfile(token, payload)
        : await createProfile(token, {
            fullName: payload.fullName,
            title: payload.title,
            summary: payload.summary,
            location: payload.location,
            email: payload.email,
            phone: payload.phone,
            website: payload.website,
            github: payload.github,
            linkedin: payload.linkedin,
          });
      setProfile(data);
      setStatus("Profile saved.");
    } catch (err) {
      setActionError("Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadProfile} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile editor"
        description="Keep your core details up to date for every CV variant."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Panel title={profile ? "Update profile" : "Create profile"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Full name" required>
            <input
              value={form.fullName}
              onChange={(event) => handleChange("fullName")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="Jane Doe"
              required
            />
          </Field>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(event) => handleChange("title")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="Senior Frontend Engineer"
            />
          </Field>
          <Field label="Summary" hint="Short, targeted professional summary.">
            <textarea
              value={form.summary}
              onChange={(event) => handleChange("summary")(event.target.value)}
              className="min-h-[96px] rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink md:col-span-2"
              placeholder="Focused on scalable frontend systems..."
            />
          </Field>
          <Field label="Location">
            <input
              value={form.location}
              onChange={(event) => handleChange("location")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="Berlin, DE"
            />
          </Field>
          <Field label="Email">
            <input
              value={form.email}
              onChange={(event) => handleChange("email")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(event) => handleChange("phone")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="+48 600 000 000"
            />
          </Field>
          <Field label="Website">
            <input
              value={form.website}
              onChange={(event) => handleChange("website")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="https://your-site.com"
            />
          </Field>
          <Field label="GitHub">
            <input
              value={form.github}
              onChange={(event) => handleChange("github")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="https://github.com/you"
            />
          </Field>
          <Field label="LinkedIn">
            <input
              value={form.linkedin}
              onChange={(event) => handleChange("linkedin")(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="https://linkedin.com/in/you"
            />
          </Field>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
            {status ? <span className="ml-3 text-sm text-accent">{status}</span> : null}
          </div>
        </form>
      </Panel>
    </div>
  );
}
