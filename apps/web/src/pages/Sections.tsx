import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { listSections, createSection, deleteSection } from "../api/sections";
import { HttpError } from "../api/client";

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
    <div data-testid="sections-page" className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <h1
          data-testid="sections-heading"
          className="mb-6 text-2xl font-semibold text-slate-900"
        >
          Orchard Sections
        </h1>

        <Card data-testid="sections-create-card" className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Add section
          </h2>
          <form
            onSubmit={handleCreate}
            data-testid="sections-create-form"
            className="flex flex-col gap-3"
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
            <Input
              label="Crop type"
              name="cropType"
              required
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
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
                className="text-sm text-red-600"
                role="alert"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="sections-create-submit"
            >
              {createMutation.isPending ? "Adding…" : "Add section"}
            </Button>
          </form>
        </Card>

        {deleteError && (
          <p
            data-testid="sections-delete-error"
            className="mb-4 text-sm text-red-600"
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
            className="text-sm text-red-600"
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
                <Card data-testid={`section-card-${section.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/sections/${section.id}`}
                        data-testid={`section-link-${section.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                      >
                        {section.name}
                      </Link>
                      <p className="text-sm text-slate-600">
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
                      variant="danger"
                      size="sm"
                      data-testid={`section-delete-${section.id}`}
                      onClick={() => deleteMutation.mutate(section.id)}
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
