import { useState, useEffect, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/useToast";
import { Button } from "./Button";
import { Input } from "./Input";
import { Combobox } from "./Combobox";
import { listSections } from "../api/sections";
import { listProducts } from "../api/products";
import { createSpray } from "../api/sprays";
import { HttpError } from "../api/client";
import type { Suggestion } from "../types";

const CATEGORIES = ["Fungicide", "Insecticide", "Herbicide", "Fertilizer", "Other"];

const selectClass =
  "block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 h-10 text-sm text-slate-100 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500";

interface Props {
  suggestion: Suggestion;
  onClose: () => void;
}

export function SprayModal({ suggestion, onClose }: Props) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: listSections });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: listProducts });

  const sections = sectionsQuery.data ?? [];

  // sections are already cached from Dashboard, so the initializer resolves on first render
  const [sectionId, setSectionId] = useState(
    () => sections.find((s) => s.name === suggestion.sectionName)?.id ?? "",
  );
  const [category, setCategory] = useState(suggestion.category ?? CATEGORIES[0]);
  const [productName, setProductName] = useState("");
  const [doseLPerHa, setDoseLPerHa] = useState("");
  const [sprayedAt, setSprayedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [weatherNote, setWeatherNote] = useState("");
  const [phiDays, setPhiDays] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: createSpray,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprays"] });
      addToast("Spray logged");
      onClose();
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to log spray");
      } else {
        setFormError("Network error");
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    mutation.mutate({
      sectionId,
      productName: productName.trim(),
      category,
      doseLPerHa: parseFloat(doseLPerHa),
      sprayedAt: new Date(sprayedAt).toISOString(),
      weatherNote: weatherNote.trim() || undefined,
      notes: notes.trim() || undefined,
      phiDays: phiDays ? parseInt(phiDays, 10) : undefined,
    });
  };

  return (
    <div
      data-testid="spray-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        data-testid="spray-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spray-modal-title"
        className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-700 px-5 py-4">
          <div>
            <h2
              id="spray-modal-title"
              data-testid="spray-modal-heading"
              className="text-base font-semibold text-slate-100"
            >
              Log spray
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{suggestion.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="spray-modal-close"
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          data-testid="spray-modal-form"
          noValidate
          className="flex flex-col gap-4 p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-section" className="text-sm font-medium text-slate-300">
                Section
              </label>
              <select
                id="modal-section"
                required
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                data-testid="spray-modal-section-select"
                className={selectClass}
              >
                <option value="">Select a section…</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-category" className="text-sm font-medium text-slate-300">
                Category
              </label>
              <select
                id="modal-category"
                required
                value={category}
                onChange={(e) => { setCategory(e.target.value); setProductName(""); }}
                data-testid="spray-modal-category-select"
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Combobox
              label="Product name"
              name="productName"
              required
              value={productName}
              onChange={setProductName}
              suggestions={(productsQuery.data ?? [])
                .filter((p) => p.category === category)
                .map((p) => p.name)}
              data-testid="spray-modal-product-input"
            />

            <Input
              label="Dose (L/ha)"
              name="doseLPerHa"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={doseLPerHa}
              onChange={(e) => setDoseLPerHa(e.target.value)}
              data-testid="spray-modal-dose-input"
            />

            <Input
              label="Date sprayed"
              name="sprayedAt"
              type="date"
              required
              value={sprayedAt}
              onChange={(e) => setSprayedAt(e.target.value)}
              data-testid="spray-modal-date-input"
            />

            <Input
              label="Weather note (optional)"
              name="weatherNote"
              value={weatherNote}
              onChange={(e) => setWeatherNote(e.target.value)}
              data-testid="spray-modal-weather-input"
            />

            <Input
              label="PHI (days, optional)"
              name="phiDays"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 14"
              value={phiDays}
              onChange={(e) => setPhiDays(e.target.value)}
              data-testid="spray-modal-phi-input"
            />

            <div className="sm:col-span-2">
              <Input
                label="Notes (optional)"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="spray-modal-notes-input"
              />
            </div>
          </div>

          {formError && (
            <p
              data-testid="spray-modal-form-error"
              className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
              role="alert"
            >
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="spray-modal-submit"
            >
              {mutation.isPending ? "Logging…" : "Log spray"}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              data-testid="spray-modal-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
