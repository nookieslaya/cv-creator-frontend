import { apiRequest } from "./client";
import type { Profile } from "../types/api";

export type ProfileInput = {
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

export function getProfile(token: string) {
  return apiRequest<Profile>("/profile", { token });
}

export function createProfile(token: string, input: ProfileInput) {
  return apiRequest<Profile>("/profile", { method: "POST", token, body: input });
}

export function updateProfile(token: string, input: Partial<ProfileInput>) {
  return apiRequest<Profile>("/profile", { method: "PUT", token, body: input });
}
