export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OrchardSection {
  id: string;
  name: string;
  cropType: string;
  areaHa: number;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SprayRecord {
  id: string;
  productName: string;
  category: string;
  doseLPerHa: number;
  sprayedAt: string;
  weatherNote: string | null;
  notes: string | null;
  sectionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  section?: {
    id: string;
    name: string;
    cropType: string;
  };
}

export interface Suggestion {
  title: string;
  reason: string;
  suggestedWindow: string;
  priority: "low" | "medium" | "high";
}

export interface ApiError {
  error: string;
  details?: unknown;
}
