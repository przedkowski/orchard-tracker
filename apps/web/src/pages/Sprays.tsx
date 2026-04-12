import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { listSections } from "../api/sections";
import { listSprays, createSpray, deleteSpray } from "../api/sprays";
import { HttpError } from "../api/client";

const CATEGORIES = ["Fungicide", "Insecticide", "Herbicide", "Fertilizer", "Other"];

const selectClass =
  "block w-full rounded-md border border-slate-300 px-3 h-10 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 bg-white";

export function Sprays() {
  const queryClient = useQueryClient();

  // Filter
  const [filterSectionId, setFilterSectionId] = useState("");

  const filters = filterSectionId ? { sectionId: filterSectionId } : undefined;

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: listSections,
  });

  const spraysQuery = useQuery({
    queryKey: ["sprays", filters],
    queryFn: () => listSprays(filters),
  });

  // Create form
  const [sectionId, setSectionId] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [doseLPerHa, setDoseLPerHa] = useState("");
  const [sprayedAt, setSprayedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [weatherNote, setWeatherNote] = useState("");
  const [notes, setNotes] = useState("");
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
    });
  };

  const sections = sectionsQuery.data ?? [];
  const sprays = spraysQuery.data ?? [];

  return (
    <div data-testid="sprays-page" className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <h1
          data-testid="sprays-heading"
          className="mb-6 text-2xl font-semibold text-slate-900"
        >
          Spray Records
        </h1>

        {/* Create form */}
        <Card data-testid="sprays-create-card" className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Log spray
          </h2>
          <form
            onSubmit={handleCreate}
            data-testid="sprays-create-form"
            className="flex flex-col gap-3"
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="spray-section"
                className="text-sm font-medium text-slate-700"
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

            <Input
              label="Product name"
              name="productName"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              data-testid="sprays-product-input"
            />

            <div className="flex flex-col gap-1">
              <label
                htmlFor="spray-category"
                className="text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="spray-category"
                name="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              label="Notes (optional)"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="sprays-notes-input"
            />

            {formError && (
              <p
                data-testid="sprays-form-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="sprays-create-submit"
            >
              {createMutation.isPending ? "Logging…" : "Log spray"}
            </Button>
          </form>
        </Card>

        {/* Filter */}
        <div className="mb-4 flex flex-col gap-1">
          <label
            htmlFor="filter-section"
            className="text-sm font-medium text-slate-700"
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
            className="mb-4 text-sm text-red-600"
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
            className="text-sm text-red-600"
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
                <Card data-testid={`spray-card-${spray.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {spray.productName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {spray.category} · {spray.doseLPerHa} L/ha
                      </p>
                      {spray.section && (
                        <p
                          data-testid={`spray-section-${spray.id}`}
                          className="text-xs text-slate-500"
                        >
                          {spray.section.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        {new Date(spray.sprayedAt).toLocaleDateString()}
                      </p>
                      {spray.weatherNote && (
                        <p
                          data-testid={`spray-weather-${spray.id}`}
                          className="text-xs text-slate-500"
                        >
                          {spray.weatherNote}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      data-testid={`spray-delete-${spray.id}`}
                      onClick={() => deleteMutation.mutate(spray.id)}
                      disabled={deleteMutation.isPending}
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
