import { apiRequest } from "./client";
import type { Project } from "../types/api";

export type ProjectInput = {
  name: string;
  description: string;
  role?: string | null;
  tech?: string[];
  tags?: string[];
  url?: string | null;
};

export function listProjects(token: string) {
  return apiRequest<Project[]>("/projects", { token });
}

export function createProject(token: string, input: ProjectInput) {
  return apiRequest<Project>("/projects", { method: "POST", token, body: input });
}

export function updateProject(token: string, id: string, input: Partial<ProjectInput>) {
  return apiRequest<Project>(`/projects/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

export function deleteProject(token: string, id: string) {
  return apiRequest<void>(`/projects/${id}`, { method: "DELETE", token });
}
