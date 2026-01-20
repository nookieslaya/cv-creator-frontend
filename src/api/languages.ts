import { apiRequest } from "./client";
import type { Language } from "../types/api";

export type LanguageInput = {
  name: string;
  level?: string | null;
};

export function listLanguages(token: string) {
  return apiRequest<Language[]>("/languages", { token });
}

export function createLanguage(token: string, input: LanguageInput) {
  return apiRequest<Language>("/languages", { method: "POST", token, body: input });
}

export function updateLanguage(
  token: string,
  id: string,
  input: Partial<LanguageInput>,
) {
  return apiRequest<Language>(`/languages/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

export function deleteLanguage(token: string, id: string) {
  return apiRequest<void>(`/languages/${id}`, { method: "DELETE", token });
}
