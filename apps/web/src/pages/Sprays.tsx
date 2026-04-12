import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { PhiBadge } from "../components/PhiBadge";
import { Combobox } from "../components/Combobox";
import { listSections } from "../api/sections";
import { listProducts } from "../api/products";
import { listSprays, createSpray, deleteSpray } from "../api/sprays";
import { HttpError } from "../api/client";

const CATEGORIES = ["Fungicide", "Insecticide", "Herbicide", "Fertilizer", "Other"];

const selectClass =
  "block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 h-10 text-sm text-slate-100 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500";

export function Sprays() {
  const queryClient = useQueryClient();

  const [filterSectionId, setFilterSectionId] = useState("");
  const filters = filterSectionId ? { sectionId: filterSectionId } : undefined;

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: listSections,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const spraysQuery = useQuery({
    queryKey: ["sprays", filters],
    queryFn: () => listSprays(filters),
  });

  const [sectionId, setSectionId] = useState("");
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createSpray,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprays"] });
      setSectionId("");
      setProductName("");
      setCategory(CATEGORIES[0]);
      setDoseLPerHa("");
      setSprayedAt(new Date().toISOString().slice(0, 10));
      setWeatherNote("");
      setNotes("");
      setPhiDays("");
      setFormError(null);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to create spray");
      } else {
        setFormError("Network error");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpray,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprays"] });
      setDeleteError(null);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setDeleteError(err.body.error ?? "Failed to delete spray");
      } else {
        setDeleteError("Network error");
      }
    },
  });

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate({
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

  const sections = sectionsQuery.data ?? [];
  const sprays = spraysQuery.data ?? [];

  return (
    <div data-testid="sprays-page" className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              data-testid="sprays-heading"
              className="text-2xl font-bold text-slate-50"
            >
              Spray Records
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Log and review all spray applications.
            </p>
          </div>
          <Link
            to="/sprays/batch"
            data-testid="sprays-batch-link"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 h-10 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            Batch spray
          </Link>
        </div>

        <Card data-testid="sprays-create-card" className="mb-8">
          <h2 className="mb-5 text-base font-semibold text-slate-200">
            Log new spray
          </h2>
          <form
            onSubmit={handleCreate}
            data-testid="sprays-create-form"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="spray-section"
                className="text-sm font-medium text-slate-300"
              >
                Section
              </label>
              <select
                id="spray-section"
                name="sectionId"
                required
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                data-testid="sprays-section-select"
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

            <Combobox
              label="Product name"
              name="productName"
              required
              value={productName}
              onChange={setProductName}
              suggestions={(productsQuery.data ?? [])
                .filter((p) => p.category === category)
                .map((p) => p.name)}
              data-testid="sprays-product-input"
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="spray-category"
                className="text-sm font-medium text-slate-300"
              >
                Category
              </label>
              <select
                id="spray-category"
                name="category"
                required
                value={category}
                onChange={(e) => { setCategory(e.target.value); setProductName(""); }}
                data-testid="sprays-category-select"
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
              data-testid="sprays-dose-input"
            />

            <Input
              label="Date sprayed"
              name="sprayedAt"
              type="date"
              required
              value={sprayedAt}
              onChange={(e) => setSprayedAt(e.target.value)}
              data-testid="sprays-date-input"
            />

            <Input
              label="Weather note (optional)"
              name="weatherNote"
              value={weatherNote}
              onChange={(e) => setWeatherNote(e.target.value)}
              data-testid="sprays-weather-input"
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
              data-testid="sprays-phi-input"
            />

            <div className="sm:col-span-2">
              <Input
                label="Notes (optional)"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="sprays-notes-input"
              />
            </div>

            {formError && (
              <p
                data-testid="sprays-form-error"
                className="col-span-full rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
                role="alert"
              >
                {formError}
              </p>
            )}

            <div className="col-span-full">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="sprays-create-submit"
              >
                {createMutation.isPending ? "Logging…" : "Log spray"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mb-5 flex flex-col gap-1.5">
          <label
            htmlFor="filter-section"
            className="text-sm font-medium text-slate-300"
          >
            Filter by section
          </label>
          <select
            id="filter-section"
            value={filterSectionId}
            onChange={(e) => setFilterSectionId(e.target.value)}
            data-testid="sprays-section-filter"
            className={`${selectClass} max-w-xs`}
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {deleteError && (
          <p
            data-testid="sprays-delete-error"
            className="mb-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
            role="alert"
          >
            {deleteError}
          </p>
        )}

        {spraysQuery.isLoading && (
          <p data-testid="sprays-loading" className="text-sm text-slate-500">
            Loading…
          </p>
        )}

        {spraysQuery.isError && (
          <p
            data-testid="sprays-error"
            className="text-sm text-red-400"
            role="alert"
          >
            Failed to load sprays.
          </p>
        )}

        {spraysQuery.isSuccess && sprays.length === 0 && (
          <p data-testid="sprays-empty" className="text-sm text-slate-500">
            No sprays logged yet.
          </p>
        )}

        {spraysQuery.isSuccess && sprays.length > 0 && (
          <ul data-testid="sprays-list" className="flex flex-col gap-3">
            {sprays.map((spray) => (
              <li key={spray.id}>
                <Card
                  data-testid={`spray-card-${spray.id}`}
                  className="transition-shadow hover:shadow-md hover:shadow-slate-950/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">
                        {spray.productName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {spray.category} · {spray.doseLPerHa} L/ha
                        {spray.section ? ` · ${spray.section.name}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(spray.sprayedAt).toLocaleDateString()}
                      </p>
                      {spray.weatherNote && (
                        <p
                          data-testid={`spray-weather-${spray.id}`}
                          className="mt-1 text-xs text-slate-500"
                        >
                          {spray.weatherNote}
                        </p>
                      )}
                      {spray.phiDays != null && (
                        <PhiBadge
                          sprayedAt={spray.sprayedAt}
                          phiDays={spray.phiDays}
                          testid={`spray-phi-${spray.id}`}
                        />
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      data-testid={`spray-delete-${spray.id}`}
                      onClick={() => deleteMutation.mutate(spray.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-400 hover:border-red-800 hover:bg-red-950/50"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
