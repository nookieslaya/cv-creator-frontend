import { apiRequest } from "./client";
import type { Skill } from "../types/api";

export type SkillInput = {
  name: string;
  level?: string | null;
  tags?: string[];
  priority?: number;
};

export function listSkills(token: string) {
  return apiRequest<Skill[]>("/skills", { token });
}

export function createSkill(token: string, input: SkillInput) {
  return apiRequest<Skill>("/skills", { method: "POST", token, body: input });
}

export function updateSkill(token: string, id: string, input: Partial<SkillInput>) {
  return apiRequest<Skill>(`/skills/${id}`, { method: "PUT", token, body: input });
}

export function deleteSkill(token: string, id: string) {
  return apiRequest<void>(`/skills/${id}`, { method: "DELETE", token });
}
