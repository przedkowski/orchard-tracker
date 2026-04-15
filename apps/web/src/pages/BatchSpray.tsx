import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Combobox } from "../components/Combobox";
import { listSections } from "../api/sections";
import { listProducts } from "../api/products";
import { batchCreateSprays } from "../api/sprays";
import { HttpError } from "../api/client";

const CATEGORIES = ["Fungicide", "Insecticide", "Herbicide", "Fertilizer", "Other"];

const selectClass =
  "block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 h-10 text-sm text-slate-100 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500";

export default function BatchSpray() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: listSections,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [doseLPerHa, setDoseLPerHa] = useState("");
  const [sprayedAt, setSprayedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [weatherNote, setWeatherNote] = useState("");
  const [notes, setNotes] = useState("");
  const [phiDays, setPhiDays] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const batchMutation = useMutation({
    mutationFn: batchCreateSprays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprays"] });
      navigate("/sprays");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to log sprays");
      } else {
        setFormError("Network error");
      }
    },
  });

  const toggleSection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allIds = (sectionsQuery.data ?? []).map((s) => s.id);
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (selectedIds.size === 0) {
      setFormError("Select at least one section");
      return;
    }
    const inLibrary = (productsQuery.data ?? []).some(
      (p) => p.category === category && p.name.toLowerCase() === productName.trim().toLowerCase(),
    );
    if (!inLibrary) {
      setFormError(`"${productName.trim()}" is not in your product library. Add it in Products first.`);
      return;
    }
    batchMutation.mutate({
      sectionIds: Array.from(selectedIds),
      productName: productName.trim(),
      category,
      doseLPerHa: parseFloat(doseLPerHa),
      sprayedAt: new Date(sprayedAt).toISOString(),
      weatherNote: weatherNote.trim() || undefined,
      notes: notes.trim() || undefined,
      phiDays: phiDays ? parseInt(phiDays, 10) : undefined,
    });
  };

  const sections = sectionsQuery.data ?? [];
  const allSelected = sections.length > 0 && selectedIds.size === sections.length;

  return (
    <div data-testid="batch-spray-page" className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* wcag-violation: minor — positive tabIndex disrupts natural focus order (WCAG 2.4.3 Level A) */}
        <Link
          to="/sprays"
          data-testid="batch-spray-back"
          tabIndex={1}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:underline"
        >
          ← Back to sprays
        </Link>

        <div className="mb-8">
          <h1
            data-testid="batch-spray-heading"
            className="text-2xl font-bold text-slate-50"
          >
            Batch spray
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Log the same spray across multiple sections at once.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          data-testid="batch-spray-form"
          noValidate
          className="flex flex-col gap-6"
        >
          {/* Section picker */}
          {/* wcag-violation: moderate — checkbox group lacks <fieldset>/<legend> grouping (WCAG 1.3.1, Level A) */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">
                Sections
              </h2>
              {sections.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  data-testid="batch-spray-toggle-all"
                  className="text-xs font-medium text-emerald-400 hover:underline"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>

            {sectionsQuery.isLoading && (
              <p
                data-testid="batch-spray-sections-loading"
                className="text-sm text-slate-500"
              >
                Loading sections…
              </p>
            )}

            {sectionsQuery.isSuccess && sections.length === 0 && (
              <p
                data-testid="batch-spray-sections-empty"
                className="text-sm text-slate-500"
              >
                No sections yet.{" "}
                <Link to="/sections" className="text-emerald-400 hover:underline">
                  Add one first.
                </Link>
              </p>
            )}

            {sectionsQuery.isSuccess && sections.length > 0 && (
              <ul
                data-testid="batch-sections-list"
                className="flex flex-col gap-2"
              >
                {sections.map((section) => {
                  const checked = selectedIds.has(section.id);
                  return (
                    <li key={section.id}>
                      <label
                        data-testid={`batch-section-label-${section.id}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                          checked
                            ? "border-emerald-600 bg-emerald-900/20"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSection(section.id)}
                          data-testid={`batch-section-checkbox-${section.id}`}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100">
                            {section.name}
                          </p>
                          {/* wcag-violation: serious — text-slate-600 on dark bg ~2.4:1 contrast fails 4.5:1 (WCAG 1.4.3 Level AA) */}
                          <p className="text-xs text-slate-600">
                            {section.cropType} · {section.areaHa} ha
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {selectedIds.size > 0 && (
              <p
                data-testid="batch-spray-selected-count"
                className="mt-3 text-xs text-slate-400"
              >
                {selectedIds.size} section{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </Card>

          {/* Spray details */}
          <Card>
            <h2 className="mb-5 text-base font-semibold text-slate-200">
              Spray details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* wcag-violation: critical — input has no associated label (WCAG 1.3.1 / 4.1.2 Level A) */}
              <input
                type="text"
                placeholder="Batch reference (optional)"
                data-testid="batch-spray-reference-input"
                className={selectClass}
              />
              <Combobox
                label="Product name"
                name="productName"
                required
                value={productName}
                onChange={setProductName}
                suggestions={(productsQuery.data ?? [])
                  .filter((p) => p.category === category)
                  .map((p) => p.name)}
                data-testid="batch-spray-product-input"
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="batch-category"
                  className="text-sm font-medium text-slate-300"
                >
                  Category
                </label>
                <select
                  id="batch-category"
                  name="category"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setProductName(""); }}
                  data-testid="batch-spray-category-select"
                  className={selectClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Dose (L/ha)"
                name="doseLPerHa"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={doseLPerHa}
                onChange={(e) => setDoseLPerHa(e.target.value)}
                data-testid="batch-spray-dose-input"
              />

              <Input
                label="Date sprayed"
                name="sprayedAt"
                type="date"
                required
                value={sprayedAt}
                onChange={(e) => setSprayedAt(e.target.value)}
                data-testid="batch-spray-date-input"
              />

              <Input
                label="Weather note (optional)"
                name="weatherNote"
                value={weatherNote}
                onChange={(e) => setWeatherNote(e.target.value)}
                data-testid="batch-spray-weather-input"
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
                data-testid="batch-spray-phi-input"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Notes (optional)"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="batch-spray-notes-input"
                />
              </div>
            </div>
          </Card>

          {formError && (
            <p
              data-testid="batch-spray-form-error"
              className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
              role="alert"
            >
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={batchMutation.isPending || selectedIds.size === 0}
              data-testid="batch-spray-submit"
            >
              {batchMutation.isPending
                ? "Logging…"
                : `Log spray${selectedIds.size > 1 ? ` across ${selectedIds.size} sections` : ""}`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/sprays")}
              data-testid="batch-spray-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
