import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { getSection, updateSection } from "../api/sections";
import { listSprays, deleteSpray } from "../api/sprays";
import { HttpError } from "../api/client";
import type { OrchardSection } from "../types";

// Internal component so edit form state initialises synchronously from props —
// avoids setState-in-effect and satisfies the fast-refresh rule (not exported).
function EditSectionForm({
  section,
  onDone,
}: {
  section: OrchardSection;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(section.name);
  const [cropType, setCropType] = useState(section.cropType);
  const [areaHa, setAreaHa] = useState(String(section.areaHa));
  const [notes, setNotes] = useState(section.notes ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateSection>[1]) =>
      updateSection(section.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section", section.id] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setFormError(null);
      onDone();
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        setFormError(err.body.error ?? "Failed to update section");
      } else {
        setFormError("Network error");
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    updateMutation.mutate({
      name: name.trim(),
      cropType: cropType.trim(),
      areaHa: parseFloat(areaHa),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="section-detail-edit-form"
      className="flex flex-col gap-3"
      noValidate
    >
      <Input
        label="Name"
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="section-detail-name-input"
      />
      <Input
        label="Crop type"
        name="cropType"
        required
        value={cropType}
        onChange={(e) => setCropType(e.target.value)}
        data-testid="section-detail-croptype-input"
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
        data-testid="section-detail-areaha-input"
      />
      <Input
        label="Notes (optional)"
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        data-testid="section-detail-notes-input"
      />

      {formError && (
        <p
          data-testid="section-detail-form-error"
          className="text-sm text-red-600"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          data-testid="section-detail-save-submit"
        >
          {updateMutation.isPending ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="secondary"
          onClick={onDone}
          data-testid="section-detail-cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function SectionDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sectionQuery = useQuery({
    queryKey: ["section", id],
    queryFn: () => getSection(id!),
    enabled: !!id,
  });

  const spraysQuery = useQuery({
    queryKey: ["sprays", { sectionId: id }],
    queryFn: () => listSprays({ sectionId: id }),
    enabled: !!id,
  });

  const deleteSprayMutation = useMutation({
    mutationFn: deleteSpray,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprays", { sectionId: id }] });
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

  const section = sectionQuery.data;
  const sprays = spraysQuery.data ?? [];

  return (
    <div data-testid="section-detail-page" className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-3xl p-4">
        <Link
          to="/sections"
          data-testid="section-detail-back"
          className="mb-4 inline-block text-sm text-emerald-700 hover:underline"
        >
          ← Back to sections
        </Link>

        {sectionQuery.isLoading && (
          <p
            data-testid="section-detail-loading"
            className="text-sm text-slate-500"
          >
            Loading…
          </p>
        )}

        {sectionQuery.isError && (
          <p
            data-testid="section-detail-error"
            className="text-sm text-red-600"
            role="alert"
          >
            Failed to load section.
          </p>
        )}

        {sectionQuery.isSuccess && section && (
          <>
            <Card data-testid="section-detail-card" className="mb-6">
              {!editing ? (
                <div>
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h1
                        data-testid="section-detail-name"
                        className="text-2xl font-semibold text-slate-900"
                      >
                        {section.name}
                      </h1>
                      <p
                        data-testid="section-detail-meta"
                        className="text-sm text-slate-600"
                      >
                        {section.cropType} · {section.areaHa} ha
                      </p>
                      {section.notes && (
                        <p
                          data-testid="section-detail-notes"
                          className="mt-1 text-xs text-slate-500"
                        >
                          {section.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(true)}
                      data-testid="section-detail-edit-button"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <EditSectionForm
                  section={section}
                  onDone={() => setEditing(false)}
                />
              )}
            </Card>

            <section>
              <h2
                data-testid="section-sprays-heading"
                className="mb-3 text-lg font-semibold text-slate-900"
              >
                Sprays
              </h2>

              {deleteError && (
                <p
                  data-testid="section-sprays-delete-error"
                  className="mb-3 text-sm text-red-600"
                  role="alert"
                >
                  {deleteError}
                </p>
              )}

              {spraysQuery.isLoading && (
                <p
                  data-testid="section-sprays-loading"
                  className="text-sm text-slate-500"
                >
                  Loading…
                </p>
              )}

              {spraysQuery.isError && (
                <p
                  data-testid="section-sprays-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  Failed to load sprays.
                </p>
              )}

              {spraysQuery.isSuccess && sprays.length === 0 && (
                <p
                  data-testid="section-sprays-empty"
                  className="text-sm text-slate-500"
                >
                  No sprays logged for this section.
                </p>
              )}

              {spraysQuery.isSuccess && sprays.length > 0 && (
                <ul
                  data-testid="section-sprays-list"
                  className="flex flex-col gap-3"
                >
                  {sprays.map((spray) => (
                    <li key={spray.id}>
                      <Card data-testid={`section-spray-card-${spray.id}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {spray.productName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {spray.category} · {spray.doseLPerHa} L/ha
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(spray.sprayedAt).toLocaleDateString()}
                            </p>
                            {spray.weatherNote && (
                              <p
                                data-testid={`section-spray-weather-${spray.id}`}
                                className="text-xs text-slate-500"
                              >
                                {spray.weatherNote}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            data-testid={`section-spray-delete-${spray.id}`}
                            onClick={() =>
                              deleteSprayMutation.mutate(spray.id)
                            }
                            disabled={deleteSprayMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
