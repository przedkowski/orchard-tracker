import { apiRequest } from "./client";
import type { AuthResponse, User } from "../types";

export function signUp(input: {
  email: string;
  password: string;
  name: string;
}) {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: input,
  });
}

export function signIn(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/signin", {
    method: "POST",
    body: input,
  });
}

export function me() {
  return apiRequest<{ user: User }>("/auth/me");
}
