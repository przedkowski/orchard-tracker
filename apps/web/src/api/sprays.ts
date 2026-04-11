import { apiRequest } from "./client";
import type { SprayRecord } from "../types";

export function listSprays(filters?: {
  sectionId?: string;
  from?: string;
  to?: string;
}) {
  return apiRequest<SprayRecord[]>("/sprays", { query: filters });
}

export function getSpray(id: string) {
  return apiRequest<SprayRecord>(`/sprays/${id}`);
}

export function createSpray(input: {
  sectionId: string;
  productName: string;
  category: string;
  doseLPerHa: number;
  sprayedAt: string;
  weatherNote?: string;
  notes?: string;
}) {
  return apiRequest<SprayRecord>("/sprays", { method: "POST", body: input });
}

export function deleteSpray(id: string) {
  return apiRequest<void>(`/sprays/${id}`, { method: "DELETE" });
}
