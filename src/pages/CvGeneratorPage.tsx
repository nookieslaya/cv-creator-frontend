import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import Field from "../components/Field";
import TagInput from "../components/TagInput";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import SelectField from "../components/SelectField";
import ThemeEditor from "../components/ThemeEditor";
import ManualContentPanel from "../components/ManualContentPanel";
import { useCvTheme } from "../hooks/useCvTheme";
import { getProfile } from "../api/profile";
import { listSkills } from "../api/skills";
import { listProjects } from "../api/projects";
import { listExperience } from "../api/experience";
import { listEducation } from "../api/education";
import { listLanguages } from "../api/languages";
import {
  createCvVariant,
  deleteCvVariant,
  exportCvPdf,
  listCvVariants,
  previewCv,
  previewCvPdf,
  updateCvVariant,
} from "../api/cv";
import type {
  CvManualOverride,
  CvVariant,
  Education,
  Experience,
  Language,
  Profile,
  Project,
  Skill,
} from "../types/api";

type CvContent = {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  languages: Language[];
};

type CvPreviewPayload = {
  profile: {
    fullName: string;
    title?: string | null;
    summary?: string | null;
    location?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    github?: string | null;
    linkedin?: string | null;
  };
  skills: Array<{
    name: string;
    level?: string | null;
    tags: string[];
    priority: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    role?: string | null;
    tech: string[];
    tags: string[];
    url?: string | null;
  }>;
  experience: Array<{
    company: string;
    position: string;
    description: string;
    tags: string[];
    startDate: string;
    endDate?: string | null;
  }>;
  education: Array<{
    school: string;
    degree?: string | null;
    field?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  languages: Array<{
    name: string;
    level?: string | null;
  }>;
};

const normalizeText = (value?: string | null) => (value ?? "").trim().toLowerCase();

const normalizeList = (values: string[] = []) =>
  [...values].map(normalizeText).filter(Boolean).sort().join("|");

const skillKey = (skill: {
  name: string;
  level?: string | null;
  tags: string[];
  priority: number;
}) =>
  [
    normalizeText(skill.name),
    normalizeText(skill.level),
    normalizeList(skill.tags),
    String(skill.priority),
  ].join("|");

const projectKey = (project: {
  name: string;
  description: string;
  role?: string | null;
  tech: string[];
  tags: string[];
  url?: string | null;
}) =>
  [
    normalizeText(project.name),
    normalizeText(project.description),
    normalizeText(project.role),
    normalizeList(project.tech),
    normalizeList(project.tags),
    normalizeText(project.url),
  ].join("|");

const experienceKey = (item: {
  company: string;
  position: string;
  description: string;
  tags: string[];
  startDate: string;
  endDate?: string | null;
}) =>
  [
    normalizeText(item.company),
    normalizeText(item.position),
    normalizeText(item.description),
    normalizeList(item.tags),
    normalizeText(item.startDate),
    normalizeText(item.endDate),
  ].join("|");

const educationKey = (item: {
  school: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) =>
  [
    normalizeText(item.school),
    normalizeText(item.degree),
    normalizeText(item.field),
    normalizeText(item.startDate),
    normalizeText(item.endDate),
  ].join("|");

const languageKey = (item: { name: string; level?: string | null }) =>
  [normalizeText(item.name), normalizeText(item.level)].join("|");

const formatDate = (value?: string | null) => (value ? value.slice(0, 10) : "");

function buildIdIndex<T extends { id: string }>(items: T[], keyFn: (item: T) => string) {
  const index = new Map<string, string[]>();
  items.forEach((item) => {
    const key = keyFn(item);
    const list = index.get(key) ?? [];
    list.push(item.id);
    index.set(key, list);
  });
  return index;
}

function resolveAutoMatch<T>(
  autoItems: T[],
  allItems: Array<T & { id: string }>,
  keyFn: (item: T) => string,
) {
  const index = buildIdIndex(allItems, keyFn as (item: T & { id: string }) => string);
  const order: string[] = [];
  const selected = new Set<string>();

  autoItems.forEach((item) => {
    const key = keyFn(item);
    const list = index.get(key);
    if (!list || list.length === 0) {
      return;
    }
    const id = list.shift();
    if (!id) {
      return;
    }
    order.push(id);
    selected.add(id);
  });

  return { order, selected };
}

function buildDefaultOverrides(
  autoPreview: CvPreviewPayload,
  content: CvContent,
): CvManualOverride {
  const skillMatch = resolveAutoMatch(autoPreview.skills, content.skills, skillKey);
  const projectMatch = resolveAutoMatch(
    autoPreview.projects,
    content.projects,
    projectKey,
  );
  const experienceMatch = resolveAutoMatch(
    autoPreview.experience,
    content.experience,
    experienceKey,
  );
  const educationMatch = resolveAutoMatch(
    autoPreview.education,
    content.education,
    educationKey,
  );
  const languageMatch = resolveAutoMatch(
    autoPreview.languages,
    content.languages,
    languageKey,
  );

  return {
    skills: Object.fromEntries(
      content.skills.map((item) => [item.id, skillMatch.selected.has(item.id)]),
    ),
    projects: Object.fromEntries(
      content.projects.map((item) => [item.id, projectMatch.selected.has(item.id)]),
    ),
    experience: Object.fromEntries(
      content.experience.map((item) => [
        item.id,
        experienceMatch.selected.has(item.id),
      ]),
    ),
    education: Object.fromEntries(
      content.education.map((item) => [
        item.id,
        educationMatch.selected.has(item.id),
      ]),
    ),
    languages: Object.fromEntries(
      content.languages.map((item) => [
        item.id,
        languageMatch.selected.has(item.id),
      ]),
    ),
  };
}

function mergeOverrides(
  defaults: CvManualOverride,
  stored?: CvManualOverride | null,
) {
  if (!stored) {
    return defaults;
  }

  return {
    skills: { ...defaults.skills, ...stored.skills },
    projects: { ...defaults.projects, ...stored.projects },
    experience: { ...defaults.experience, ...stored.experience },
    education: { ...defaults.education, ...stored.education },
    languages: { ...defaults.languages, ...stored.languages },
  };
}

function buildManualPreview(
  autoPreview: CvPreviewPayload,
  content: CvContent,
  overrides: CvManualOverride,
): CvPreviewPayload {
  const skillMatch = resolveAutoMatch(autoPreview.skills, content.skills, skillKey);
  const projectMatch = resolveAutoMatch(
    autoPreview.projects,
    content.projects,
    projectKey,
  );
  const experienceMatch = resolveAutoMatch(
    autoPreview.experience,
    content.experience,
    experienceKey,
  );
  const educationMatch = resolveAutoMatch(
    autoPreview.education,
    content.education,
    educationKey,
  );
  const languageMatch = resolveAutoMatch(
    autoPreview.languages,
    content.languages,
    languageKey,
  );

  const resolveSection = <T extends { id: string }>(
    allItems: T[],
    match: { order: string[]; selected: Set<string> },
    sectionOverrides: Record<string, boolean>,
  ) => {
    const byId = new Map(allItems.map((item) => [item.id, item]));
    const autoItems = match.order
      .filter((id) => sectionOverrides[id] !== false)
      .map((id) => byId.get(id))
      .filter((item): item is T => Boolean(item));
    const extraItems = allItems.filter(
      (item) => sectionOverrides[item.id] && !match.selected.has(item.id),
    );

    return [...autoItems, ...extraItems];
  };

  const profile = content.profile;

  return {
    profile: {
      fullName: profile.fullName,
      title: profile.title ?? null,
      summary: profile.summary ?? null,
      location: profile.location ?? null,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      website: profile.website ?? null,
      github: profile.github ?? null,
      linkedin: profile.linkedin ?? null,
    },
    skills: resolveSection(content.skills, skillMatch, overrides.skills).map((item) => ({
      name: item.name,
      level: item.level ?? null,
      tags: item.tags,
      priority: item.priority,
    })),
    projects: resolveSection(content.projects, projectMatch, overrides.projects).map(
      (item) => ({
        name: item.name,
        description: item.description,
        role: item.role ?? null,
        tech: item.tech,
        tags: item.tags,
        url: item.url ?? null,
      }),
    ),
    experience: resolveSection(
      content.experience,
      experienceMatch,
      overrides.experience,
    ).map((item) => ({
      company: item.company,
      position: item.position,
      description: item.description,
      tags: item.tags,
      startDate: item.startDate,
      endDate: item.endDate ?? null,
    })),
    education: resolveSection(
      content.education,
      educationMatch,
      overrides.education,
    ).map((item) => ({
      school: item.school,
      degree: item.degree ?? null,
      field: item.field ?? null,
      startDate: item.startDate ?? null,
      endDate: item.endDate ?? null,
    })),
    languages: resolveSection(content.languages, languageMatch, overrides.languages).map(
      (item) => ({
        name: item.name,
        level: item.level ?? null,
      }),
    ),
  };
}

export default function CvGeneratorPage() {
  const { getToken } = useAuth();
  const [jobTags, setJobTags] = useState<string[]>([]);
  const [template, setTemplate] = useState("ats");
  const [atsPreview, setAtsPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<"json" | "pdf">("json");
  const [variantName, setVariantName] = useState("");
  const [variants, setVariants] = useState<CvVariant[]>([]);
  const [preview, setPreview] = useState<CvPreviewPayload | null>(null);
  const [autoPreview, setAutoPreview] = useState<CvPreviewPayload | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTemplate, setEditTemplate] = useState("ats");
  const [previewLabel, setPreviewLabel] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<"live" | "variant">("live");
  const [confirmVariant, setConfirmVariant] = useState<CvVariant | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPdfLoading, setPreviewPdfLoading] = useState(false);
  const [variantPreviewingId, setVariantPreviewingId] = useState<string | null>(null);
  const [variantPreviewPdfId, setVariantPreviewPdfId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const previewRequestId = useRef(0);
  const previewPdfRequestId = useRef(0);
  const [cvContent, setCvContent] = useState<CvContent | null>(null);
  const [manualOverrides, setManualOverrides] = useState<CvManualOverride | null>(null);
  const [manualPanelOpen, setManualPanelOpen] = useState(false);

  const isPremium = true;
  const { theme, defaults, updateTheme, resetTheme, isTemplateSupported } = useCvTheme(
    template,
  );
  const previewTemplate = atsPreview ? "ats" : template;
  const isPreviewThemeSupported =
    previewTemplate === "premium-modern" || previewTemplate === "premium-executive";
  const previewTheme = isPreviewThemeSupported ? theme : undefined;
  const livePreviewLabel = `Live ${previewMode.toUpperCase()} preview - ${previewTemplate}`;
  const activePreviewLabel = previewLabel ?? livePreviewLabel;
  const themeEditorDisabled = !isPremium || !isTemplateSupported;
  const themeDisabledTitle = !isPremium
    ? "Theme customization is a Premium feature"
    : "Select a premium template";
  const themeDisabledDescription = !isPremium
    ? "Upgrade to unlock advanced styling controls."
    : "Premium Modern and Premium Executive support theme editing.";
  const manualPanelDisabled = !isPremium;

  const manualSections = useMemo(() => {
    if (!cvContent || !manualOverrides) {
      return [];
    }

    return [
      {
        key: "skills" as const,
        title: "Skills",
        items: cvContent.skills,
        overrides: manualOverrides.skills,
        getLabel: (item: Skill) => item.name,
        getMeta: (item: Skill) => {
          const parts = [
            item.level ? `Level: ${item.level}` : null,
            item.tags.length ? `Tags: ${item.tags.join(", ")}` : null,
          ].filter(Boolean);
          return parts.length ? parts.join(" | ") : null;
        },
        emptyLabel: "No skills yet.",
      },
      {
        key: "projects" as const,
        title: "Projects",
        items: cvContent.projects,
        overrides: manualOverrides.projects,
        getLabel: (item: Project) => item.name,
        getMeta: (item: Project) => {
          const parts = [
            item.tech.length ? `Tech: ${item.tech.join(", ")}` : null,
            item.tags.length ? `Tags: ${item.tags.join(", ")}` : null,
          ].filter(Boolean);
          return parts.length ? parts.join(" | ") : null;
        },
        emptyLabel: "No projects yet.",
      },
      {
        key: "experience" as const,
        title: "Experience",
        items: cvContent.experience,
        overrides: manualOverrides.experience,
        getLabel: (item: Experience) => `${item.position} - ${item.company}`,
        getMeta: (item: Experience) => {
          const range = [formatDate(item.startDate), formatDate(item.endDate)]
            .filter(Boolean)
            .join(" - ");
          const parts = [
            range ? `Dates: ${range}` : null,
            item.tags.length ? `Tags: ${item.tags.join(", ")}` : null,
          ].filter(Boolean);
          return parts.length ? parts.join(" | ") : null;
        },
        emptyLabel: "No experience entries yet.",
      },
      {
        key: "education" as const,
        title: "Education",
        items: cvContent.education,
        overrides: manualOverrides.education,
        getLabel: (item: Education) => item.school,
        getMeta: (item: Education) => {
          const detail = [item.degree, item.field].filter(Boolean).join(" ");
          const range = [formatDate(item.startDate), formatDate(item.endDate)]
            .filter(Boolean)
            .join(" - ");
          const parts = [
            detail ? `Program: ${detail}` : null,
            range ? `Dates: ${range}` : null,
          ].filter(Boolean);
          return parts.length ? parts.join(" | ") : null;
        },
        emptyLabel: "No education entries yet.",
      },
      {
        key: "languages" as const,
        title: "Languages",
        items: cvContent.languages,
        overrides: manualOverrides.languages,
        getLabel: (item: Language) => item.name,
        getMeta: (item: Language) => (item.level ? `Level: ${item.level}` : null),
        emptyLabel: "No languages yet.",
      },
    ];
  }, [cvContent, manualOverrides]);

  const openPdfBlob = (blob: Blob, filename: string, mode: "preview" | "download") => {
    const url = URL.createObjectURL(blob);
    if (mode === "download") {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleResetOverrides = () => {
    if (manualPanelDisabled) {
      return;
    }
    if (!autoPreview || !cvContent) {
      return;
    }
    setManualOverrides(buildDefaultOverrides(autoPreview, cvContent));
    setPreviewSource("live");
  };

  const toggleOverride = (
    section: keyof CvManualOverride,
    id: string,
    checked: boolean,
  ) => {
    if (manualPanelDisabled) {
      return;
    }
    setManualOverrides((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [id]: checked,
        },
      };
    });
    setPreviewSource("live");
  };

  const loadVariants = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await listCvVariants(token);
      setVariants(data);
    } catch (err) {
      setLoadError("Unable to load CV variants.");
    } finally {
      setLoading(false);
    }
  };

  const loadCvContent = async () => {
    setContentLoading(true);
    setContentError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const [profile, skills, projects, experience, education, languages] =
        await Promise.all([
          getProfile(token),
          listSkills(token),
          listProjects(token),
          listExperience(token),
          listEducation(token),
          listLanguages(token),
        ]);
      setCvContent({ profile, skills, projects, experience, education, languages });
    } catch (err) {
      setContentError("Unable to load CV content.");
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    loadVariants();
    loadCvContent();
  }, []);

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  useEffect(() => {
    if (!autoPreview || !cvContent) {
      return;
    }
    const defaults = buildDefaultOverrides(autoPreview, cvContent);
    setManualOverrides(defaults);
  }, [autoPreview, cvContent]);

  useEffect(() => {
    if (previewSource !== "live") {
      return;
    }
    if (!autoPreview) {
      setPreview(null);
      return;
    }
    if (!cvContent || !manualOverrides || manualPanelDisabled) {
      setPreview(autoPreview);
      return;
    }
    setPreview(buildManualPreview(autoPreview, cvContent, manualOverrides));
  }, [autoPreview, cvContent, manualOverrides, previewSource]);

  useEffect(() => {
    if (previewSource !== "live") {
      return;
    }

    const currentId = ++previewRequestId.current;
    const timer = window.setTimeout(async () => {
      setPreviewError(null);
      if (previewMode === "json") {
        setPreviewLoading(true);
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Missing auth token");
        }

        const data = await previewCv(token, {
          jobTags,
          template: previewTemplate,
        });
        if (currentId !== previewRequestId.current) {
          return;
        }
        setAutoPreview(data as CvPreviewPayload);
        setPreviewLabel(null);
      } catch (err) {
        if (currentId === previewRequestId.current) {
          setPreviewError("Unable to generate preview.");
        }
      } finally {
        if (currentId === previewRequestId.current && previewMode === "json") {
          setPreviewLoading(false);
        }
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [previewSource, previewTemplate, jobTags, getToken]);

  useEffect(() => {
    if (previewSource !== "live" || previewMode !== "pdf") {
      return;
    }

    const currentId = ++previewPdfRequestId.current;
    const timer = window.setTimeout(async () => {
      setPreviewError(null);
      setPreviewPdfLoading(true);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Missing auth token");
        }

        const blob = await previewCvPdf(token, {
          jobTags,
          template: previewTemplate,
          theme: previewTheme,
          manualOverrides: manualPanelDisabled ? undefined : manualOverrides ?? undefined,
        });
        if (currentId !== previewPdfRequestId.current) {
          return;
        }
        const url = URL.createObjectURL(blob);
        setPreviewPdfUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return url;
        });
        setPreviewLabel(null);
      } catch (err) {
        if (currentId === previewPdfRequestId.current) {
          setPreviewError("Unable to generate preview.");
        }
      } finally {
        if (currentId === previewPdfRequestId.current) {
          setPreviewPdfLoading(false);
        }
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    previewMode,
    previewSource,
    previewTemplate,
    previewTheme,
    jobTags,
    manualOverrides,
    getToken,
  ]);

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      if (target.closest(`[data-cv-menu-id="${openMenuId}"]`)) {
        return;
      }
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const handleVariantPreview = async (variant: CvVariant) => {
    setVariantPreviewingId(variant.id);
    setPreviewError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const data = await previewCv(token, {
        jobTags: variant.jobTags,
        template: variant.template,
      });
      const autoData = data as CvPreviewPayload;
      if (cvContent) {
        const defaults = buildDefaultOverrides(autoData, cvContent);
        const merged = manualPanelDisabled
          ? defaults
          : mergeOverrides(defaults, variant.manualOverrides);
        setPreview(buildManualPreview(autoData, cvContent, merged));
      } else {
        setPreview(autoData);
      }
      setPreviewMode("json");
      setPreviewSource("variant");
      setPreviewLabel(`Variant: ${variant.name}`);
    } catch (err) {
      setPreviewError("Unable to generate preview.");
    } finally {
      setVariantPreviewingId(null);
    }
  };

  const handleVariantPreviewPdf = async (variant: CvVariant) => {
    setVariantPreviewPdfId(variant.id);
    setPreviewError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const blob = await exportCvPdf(
        token,
        variant.id,
        variant.template === template && isTemplateSupported ? theme : undefined,
        manualPanelDisabled ? undefined : variant.manualOverrides ?? undefined,
      );
      openPdfBlob(blob, `${variant.name}.pdf`, "preview");
    } catch (err) {
      setPreviewError("Unable to generate PDF preview.");
    } finally {
      setVariantPreviewPdfId(null);
    }
  };

  const handleCreateVariant = async () => {
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      await createCvVariant(token, {
        name: variantName,
        jobTags,
        template,
        manualOverrides: manualPanelDisabled ? undefined : manualOverrides ?? undefined,
      });
      setVariantName("");
      await loadVariants();
    } catch (err) {
      setActionError("Unable to create CV variant.");
    }
  };

  const handleEditStart = (variant: CvVariant) => {
    setEditingId(variant.id);
    setEditTags(variant.jobTags);
    setEditTemplate(variant.template);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTags([]);
    setEditTemplate("ats");
  };

  const handleEditSave = async () => {
    if (!editingId) {
      return;
    }

    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      await updateCvVariant(token, editingId, {
        jobTags: editTags,
        template: editTemplate,
      });
      await loadVariants();
      handleEditCancel();
    } catch (err) {
      setActionError("Unable to update CV variant.");
    }
  };

  const handleDeleteVariant = async (variant: CvVariant) => {
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      await deleteCvVariant(token, variant.id);
      await loadVariants();
    } catch (err) {
      setActionError("Unable to delete CV variant.");
    }
  };

  const handleExport = async (variant: CvVariant) => {
    setExportingId(variant.id);
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }
      const blob = await exportCvPdf(
        token,
        variant.id,
        variant.template === template && isTemplateSupported ? theme : undefined,
        manualPanelDisabled ? undefined : variant.manualOverrides ?? undefined,
      );
      openPdfBlob(blob, `${variant.name}.pdf`, "download");
    } catch (err) {
      setActionError("Unable to export PDF.");
    } finally {
      setExportingId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading CV generator..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadVariants} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CV generator"
        description="Create tag-based CV variants and export ATS-ready PDFs."
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <ConfirmModal
        open={Boolean(confirmVariant)}
        title="Delete CV variant?"
        description={
          confirmVariant
            ? `Delete "${confirmVariant.name}"? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmVariant(null)}
        onConfirm={async () => {
          if (!confirmVariant) {
            return;
          }
          await handleDeleteVariant(confirmVariant);
          setConfirmVariant(null);
        }}
      />
      <Panel title="Build a preview">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <TagInput
              label="Job tags"
              value={jobTags}
              onChange={(next) => {
                setJobTags(next);
                setPreviewSource("live");
              }}
              placeholder="Add a tag and press Enter"
            />
          </div>
          <Field label="Template">
            <SelectField
              value={template}
              onChange={(next) => {
                setTemplate(next);
                setPreviewSource("live");
              }}
              options={[
                { value: "ats", label: "ATS" },
                { value: "dev", label: "Developer" },
                { value: "premium", label: "Premium" },
                { value: "premium-modern", label: "Premium Modern" },
                { value: "premium-executive", label: "Premium Executive" },
              ]}
            />
          </Field>
          <Field label="Preview mode">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewMode("json");
                  setPreviewSource("live");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  previewMode === "json"
                    ? "bg-accent text-white"
                    : "border border-slate/40 text-slate"
                }`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewMode("pdf");
                  setPreviewSource("live");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  previewMode === "pdf"
                    ? "bg-accent text-white"
                    : "border border-slate/40 text-slate"
                }`}
              >
                PDF
              </button>
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate">
            <input
              type="checkbox"
              checked={atsPreview}
              onChange={(event) => {
                setAtsPreview(event.target.checked);
                setPreviewSource("live");
              }}
            />
            ATS-friendly preview mode
          </label>
          {previewError ? <span className="text-sm text-red-600">{previewError}</span> : null}
        </div>
        <div className="relative mt-6 rounded-2xl border border-slate/20 bg-surface p-4">
          {activePreviewLabel ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              {activePreviewLabel}
            </p>
          ) : null}
          {previewMode === "json" ? (
            preview ? (
              <pre className="max-h-[320px] max-w-full overflow-auto whitespace-pre-wrap break-words text-xs text-ink">
                {JSON.stringify(preview, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-slate">
                Preview data will appear here after generation.
              </p>
            )
          ) : (
            <div className="space-y-3">
              {previewPdfUrl ? (
                <iframe
                  title="CV preview"
                  src={previewPdfUrl}
                  className="h-[520px] w-full rounded-xl border border-slate/20 bg-white"
                />
              ) : (
                <div className="flex h-[520px] w-full items-center justify-center rounded-xl border border-slate/20 bg-white text-sm text-slate">
                  PDF preview will appear here.
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (previewPdfUrl) {
                    window.open(previewPdfUrl, "_blank", "noopener");
                  }
                }}
                className="rounded-lg border border-slate/40 px-4 py-2 text-xs font-semibold text-slate"
                disabled={!previewPdfUrl}
              >
                Open PDF in new tab
              </button>
            </div>
          )}
          {(previewMode === "json" && previewLoading) ||
          (previewMode === "pdf" && previewPdfLoading) ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
              <div className="rounded-full border border-slate/30 bg-white px-4 py-2 text-xs font-semibold text-slate">
                Generating preview...
              </div>
            </div>
          ) : null}
        </div>
        <ManualContentPanel
          open={manualPanelOpen}
          onToggle={() => setManualPanelOpen((open) => !open)}
          onReset={handleResetOverrides}
          disabled={manualPanelDisabled}
          loading={contentLoading}
          error={contentError}
          canCustomize={Boolean(cvContent && manualOverrides && autoPreview)}
          sections={manualSections}
          onToggleItem={toggleOverride}
        />
      </Panel>
      <ThemeEditor
        theme={theme}
        defaults={defaults}
        onChange={(next) => {
          updateTheme(next);
          setPreviewSource("live");
        }}
        onReset={() => {
          resetTheme();
          setPreviewSource("live");
        }}
        template={template}
        disabled={themeEditorDisabled}
        disabledTitle={themeDisabledTitle}
        disabledDescription={themeDisabledDescription}
      />
      <Panel title="Create a CV variant">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <TagInput
              label="Variant tags"
              value={jobTags}
              onChange={(next) => {
                setJobTags(next);
                setPreviewSource("live");
              }}
              placeholder="Add a tag and press Enter"
            />
          </div>
          <Field label="Variant name" required>
            <input
              value={variantName}
              onChange={(event) => setVariantName(event.target.value)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-2 text-sm text-ink"
              placeholder="Senior Frontend - React"
            />
          </Field>
          <Field label="Template">
            <SelectField
              value={template}
              onChange={(next) => {
                setTemplate(next);
                setPreviewSource("live");
              }}
              options={[
                { value: "ats", label: "ATS" },
                { value: "dev", label: "Developer" },
                { value: "premium", label: "Premium" },
                { value: "premium-modern", label: "Premium Modern" },
                { value: "premium-executive", label: "Premium Executive" },
              ]}
            />
          </Field>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCreateVariant}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              disabled={!variantName}
            >
              Save CV variant
            </button>
          </div>
        </div>
      </Panel>
      {variants.length === 0 ? (
        <EmptyState title="No CV variants yet" description="Create your first variant above." />
      ) : (
        <Panel title="Stored CV variants">
          <div className="space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-xl border border-slate/20 bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-ink">
                      {variant.name}
                    </p>
                    <p className="break-words text-xs text-slate">
                      Template: {variant.template} | Tags:{" "}
                      {variant.jobTags.length ? variant.jobTags.join(", ") : "None"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative" data-cv-menu-id={variant.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === variant.id ? null : variant.id,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate/40 text-sm font-semibold text-slate"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === variant.id}
                        aria-label="Open actions menu"
                      >
                        ...
                      </button>
                      {openMenuId === variant.id ? (
                        <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-slate/20 bg-white p-1 shadow-panel">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleVariantPreview(variant);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate hover:bg-surface"
                            disabled={variantPreviewingId === variant.id}
                          >
                            {variantPreviewingId === variant.id
                              ? "Previewing..."
                              : "Preview JSON"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleVariantPreviewPdf(variant);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate hover:bg-surface"
                            disabled={variantPreviewPdfId === variant.id}
                          >
                            {variantPreviewPdfId === variant.id
                              ? "Previewing..."
                              : "Preview PDF"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleEditStart(variant);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate hover:bg-surface"
                          >
                            Edit tags
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setConfirmVariant(variant);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleExport(variant);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate hover:bg-surface"
                            disabled={exportingId === variant.id}
                          >
                            {exportingId === variant.id ? "Exporting..." : "Export PDF"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                {editingId === variant.id ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <TagInput
                        label="Job tags"
                        value={editTags}
                        onChange={setEditTags}
                        placeholder="Add a tag and press Enter"
                      />
                    </div>
                    <Field label="Template">
                      <SelectField
                        value={editTemplate}
                        onChange={setEditTemplate}
                        options={[
                          { value: "ats", label: "ATS" },
                          { value: "dev", label: "Developer" },
                          { value: "premium", label: "Premium" },
                          { value: "premium-modern", label: "Premium Modern" },
                          { value: "premium-executive", label: "Premium Executive" },
                        ]}
                      />
                    </Field>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <button
                        type="button"
                        onClick={handleEditSave}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="rounded-lg border border-slate/40 px-4 py-2 text-sm font-semibold text-slate"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
