import { apiRequest } from "./client";
import type { Suggestion } from "../types";

export function getSuggestions() {
  return apiRequest<{ suggestions: Suggestion[] }>("/suggestions");
}
