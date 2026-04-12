import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Combobox } from "../components/Combobox";
import { listSections, createSection, deleteSection } from "../api/sections";
import { HttpError } from "../api/client";
import { CROP_TYPES } from "../constants/cropTypes";

export function Sections() {
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: listSections,
  });

  const [name, setName] = useState("");
  const [cropType, setCropType] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setName("");
      setCropType("");
      setAreaHa("");
      setNotes("");
      setFormError(null);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to create section");
      } else {
        setFormError("Network error");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setDeleteError(null);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setDeleteError(err.body.error ?? "Failed to delete section");
      } else {
        setDeleteError("Network error");
      }
    },
  });

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate({
      name: name.trim(),
      cropType: cropType.trim(),
      areaHa: parseFloat(areaHa),
      notes: notes.trim() || undefined,
    });
  };

  const sections = sectionsQuery.data ?? [];

  return (
    <div data-testid="sections-page" className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1
            data-testid="sections-heading"
            className="text-2xl font-bold text-slate-50"
          >
            Orchard Sections
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your orchard areas and crop types.
          </p>
        </div>

        <Card data-testid="sections-create-card" className="mb-8">
          <h2 className="mb-5 text-base font-semibold text-slate-200">
            Add new section
          </h2>
          <form
            onSubmit={handleCreate}
            data-testid="sections-create-form"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            noValidate
          >
            <Input
              label="Name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="sections-name-input"
            />
            <Combobox
              label="Crop type"
              name="cropType"
              required
              value={cropType}
              onChange={setCropType}
              suggestions={CROP_TYPES}
              data-testid="sections-croptype-input"
            />
            <Input
              label="Area (ha)"
              name="areaHa"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={areaHa}
              onChange={(e) => setAreaHa(e.target.value)}
              data-testid="sections-areaha-input"
            />
            <Input
              label="Notes (optional)"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="sections-notes-input"
            />

            {formError && (
              <p
                data-testid="sections-form-error"
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
                data-testid="sections-create-submit"
              >
                {createMutation.isPending ? "Adding…" : "Add section"}
              </Button>
            </div>
          </form>
        </Card>

        {deleteError && (
          <p
            data-testid="sections-delete-error"
            className="mb-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
            role="alert"
          >
            {deleteError}
          </p>
        )}

        {sectionsQuery.isLoading && (
          <p data-testid="sections-loading" className="text-sm text-slate-500">
            Loading…
          </p>
        )}

        {sectionsQuery.isError && (
          <p
            data-testid="sections-error"
            className="text-sm text-red-400"
            role="alert"
          >
            Failed to load sections.
          </p>
        )}

        {sectionsQuery.isSuccess && sections.length === 0 && (
          <p data-testid="sections-empty" className="text-sm text-slate-500">
            No sections yet. Add one above.
          </p>
        )}

        {sectionsQuery.isSuccess && sections.length > 0 && (
          <ul data-testid="sections-list" className="flex flex-col gap-3">
            {sections.map((section) => (
              <li key={section.id}>
                <Card
                  data-testid={`section-card-${section.id}`}
                  className="transition-shadow hover:shadow-md hover:shadow-slate-950/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/sections/${section.id}`}
                        data-testid={`section-link-${section.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-emerald-400 hover:underline"
                      >
                        {section.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {section.cropType} · {section.areaHa} ha
                      </p>
                      {section.notes && (
                        <p
                          data-testid={`section-notes-${section.id}`}
                          className="mt-1 text-xs text-slate-500"
                        >
                          {section.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      data-testid={`section-delete-${section.id}`}
                      onClick={() => deleteMutation.mutate(section.id)}
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
