import { apiRequest } from "./client";
import type { Education } from "../types/api";

export type EducationInput = {
  school: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export function listEducation(token: string) {
  return apiRequest<Education[]>("/education", { token });
}

export function createEducation(token: string, input: EducationInput) {
  return apiRequest<Education>("/education", { method: "POST", token, body: input });
}

export function updateEducation(
  token: string,
  id: string,
  input: Partial<EducationInput>,
) {
  return apiRequest<Education>(`/education/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

export function deleteEducation(token: string, id: string) {
  return apiRequest<void>(`/education/${id}`, { method: "DELETE", token });
}
