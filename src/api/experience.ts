import { apiRequest } from "./client";
import type { Experience } from "../types/api";

export type ExperienceInput = {
  company: string;
  position: string;
  description: string;
  tags?: string[];
  startDate: string;
  endDate?: string | null;
};

export function listExperience(token: string) {
  return apiRequest<Experience[]>("/experience", { token });
}

export function createExperience(token: string, input: ExperienceInput) {
  return apiRequest<Experience>("/experience", { method: "POST", token, body: input });
}

export function updateExperience(
  token: string,
  id: string,
  input: Partial<ExperienceInput>,
) {
  return apiRequest<Experience>(`/experience/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

export function deleteExperience(token: string, id: string) {
  return apiRequest<void>(`/experience/${id}`, { method: "DELETE", token });
}
