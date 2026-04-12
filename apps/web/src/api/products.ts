import { apiRequest } from "./client";

export interface UserProduct {
  id: string;
  name: string;
  category: string;
}

export function listProducts() {
  return apiRequest<UserProduct[]>("/products");
}

export function createProduct(input: { name: string; category: string }) {
  return apiRequest<UserProduct>("/products", { method: "POST", body: input });
}

export function deleteProduct(id: string) {
  return apiRequest<void>(`/products/${id}`, { method: "DELETE" });
}
