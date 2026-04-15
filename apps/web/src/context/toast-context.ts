import { createContext } from "react";

export interface ToastItem {
  id: string;
  message: string;
}

export interface ToastContextValue {
  addToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
