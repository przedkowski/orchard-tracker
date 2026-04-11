import { apiRequest } from "./client";
import type { OrchardSection } from "../types";

export function listSections() {
  return apiRequest<OrchardSection[]>("/sections");
}

export function getSection(id: string) {
  return apiRequest<OrchardSection>(`/sections/${id}`);
}

export function createSection(input: {
  name: string;
  cropType: string;
  areaHa: number;
  notes?: string;
}) {
  return apiRequest<OrchardSection>("/sections", {
    method: "POST",
    body: input,
  });
}

export function updateSection(
  id: string,
  input: { name?: string; cropType?: string; areaHa?: number; notes?: string },
) {
  return apiRequest<OrchardSection>(`/sections/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteSection(id: string) {
  return apiRequest<void>(`/sections/${id}`, { method: "DELETE" });
}
