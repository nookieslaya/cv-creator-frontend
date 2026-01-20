import { apiRequest, apiRequestBlob } from "./client";
import type { CvManualOverride, CvPayload, CvVariant } from "../types/api";
import type { CvTheme } from "../types/theme";

export type CvPreviewInput = {
  jobTags: string[];
  template: string;
  theme?: CvTheme;
  manualOverrides?: CvManualOverride;
};

export type CvCreateInput = {
  name: string;
  jobTags: string[];
  template: string;
  theme?: CvTheme;
  manualOverrides?: CvManualOverride;
};

export function previewCv(token: string, input: CvPreviewInput) {
  return apiRequest<CvPayload>("/cv/preview", { method: "POST", token, body: input });
}

export function previewCvPdf(token: string, input: CvPreviewInput) {
  return apiRequestBlob("/cv/preview/pdf", { method: "POST", token, body: input });
}

export function createCvVariant(token: string, input: CvCreateInput) {
  return apiRequest<CvVariant>("/cv", { method: "POST", token, body: input });
}

export function listCvVariants(token: string) {
  return apiRequest<CvVariant[]>("/cv", { token });
}

export function getCvVariant(token: string, id: string) {
  return apiRequest<CvVariant>(`/cv/${id}`, { token });
}

export function updateCvVariant(
  token: string,
  id: string,
  input: Partial<CvCreateInput>,
) {
  return apiRequest<CvVariant>(`/cv/${id}`, { method: "PUT", token, body: input });
}

export function deleteCvVariant(token: string, id: string) {
  return apiRequest<void>(`/cv/${id}`, { method: "DELETE", token });
}

export function exportCvPdf(
  token: string,
  id: string,
  theme?: CvTheme,
  manualOverrides?: CvManualOverride,
) {
  return apiRequestBlob(`/cv/${id}/export`, {
    method: "POST",
    token,
    body: theme || manualOverrides ? { theme, manualOverrides } : {},
  });
}
