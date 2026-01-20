export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  title?: string | null;
  summary?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Skill = {
  id: string;
  profileId: string;
  name: string;
  level?: string | null;
  tags: string[];
  priority: number;
};

export type Project = {
  id: string;
  profileId: string;
  name: string;
  description: string;
  role?: string | null;
  tech: string[];
  tags: string[];
  url?: string | null;
};

export type Experience = {
  id: string;
  profileId: string;
  company: string;
  position: string;
  description: string;
  tags: string[];
  startDate: string;
  endDate?: string | null;
};

export type Education = {
  id: string;
  profileId: string;
  school: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type Language = {
  id: string;
  profileId: string;
  name: string;
  level?: string | null;
};

export type CvManualOverride = {
  skills: Record<string, boolean>;
  projects: Record<string, boolean>;
  experience: Record<string, boolean>;
  education: Record<string, boolean>;
  languages: Record<string, boolean>;
};

export type CvVariant = {
  id: string;
  profileId: string;
  name: string;
  jobTags: string[];
  template: string;
  rulesSnapshot: unknown;
  manualOverrides?: CvManualOverride | null;
  createdAt: string;
};

export type CvPayload = {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  languages: Language[];
};
