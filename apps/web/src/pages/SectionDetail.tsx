import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { PhiBadge } from "../components/PhiBadge";
import { Combobox } from "../components/Combobox";
import { CROP_TYPES } from "../constants/cropTypes";
import { getSection, updateSection } from "../api/sections";
import { listSprays, deleteSpray } from "../api/sprays";
import { HttpError } from "../api/client";
import type { OrchardSection, SprayRecord } from "../types";

// Computes the most restrictive active PHI across all sprays for this section.
function PhiStatusBanner({ sprays }: { sprays: SprayRecord[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let latestClear: Date | null = null;
  for (const spray of sprays) {
    if (spray.phiDays == null) continue;
    const clearDate = new Date(spray.sprayedAt);
    clearDate.setDate(clearDate.getDate() + spray.phiDays);
    clearDate.setHours(0, 0, 0, 0);
    if (clearDate > today && (!latestClear || clearDate > latestClear)) {
      latestClear = clearDate;
    }
  }

  const hasPhi = sprays.some((s) => s.phiDays != null);
  if (!hasPhi) return null;

  if (latestClear) {
    const daysLeft = Math.ceil(
      (latestClear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (
      <div
        data-testid="section-phi-banner"
        className="mb-6 flex items-start gap-3 rounded-xl border border-amber-700/50 bg-amber-900/20 px-4 py-3"
      >
        <span className="mt-0.5 text-lg">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Do not harvest
          </p>
          <p className="text-xs text-amber-400/80">
            PHI active — safe to harvest from{" "}
            <span data-testid="section-phi-safe-date">
              {latestClear.toLocaleDateString()}
            </span>{" "}
            ({daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="section-phi-banner"
      className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-700/50 bg-emerald-900/20 px-4 py-3"
    >
      <span className="text-lg">✓</span>
      <p className="text-sm font-semibold text-emerald-400">
        Safe to harvest — all PHI intervals cleared
      </p>
    </div>
  );
}

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
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
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
      <Combobox
        label="Crop type"
        name="cropType"
        required
        value={cropType}
        onChange={setCropType}
        suggestions={CROP_TYPES}
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
          className="col-span-full rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="col-span-full flex gap-2">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          data-testid="section-detail-save-submit"
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
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
    <div data-testid="section-detail-page" className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/sections"
          data-testid="section-detail-back"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:underline"
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
            className="text-sm text-red-400"
            role="alert"
          >
            Failed to load section.
          </p>
        )}

        {sectionQuery.isSuccess && section && (
          <>
            <Card data-testid="section-detail-card" className="mb-8">
              {!editing ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1
                      data-testid="section-detail-name"
                      className="text-2xl font-bold text-slate-50"
                    >
                      {section.name}
                    </h1>
                    <p
                      data-testid="section-detail-meta"
                      className="mt-1 text-sm text-slate-400"
                    >
                      {section.cropType} · {section.areaHa} ha
                    </p>
                    {section.notes && (
                      <p
                        data-testid="section-detail-notes"
                        className="mt-2 text-sm text-slate-500"
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
              ) : (
                <EditSectionForm
                  section={section}
                  onDone={() => setEditing(false)}
                />
              )}
            </Card>

            <PhiStatusBanner sprays={sprays} />

            <section>
              <h2
                data-testid="section-sprays-heading"
                className="mb-4 text-base font-semibold text-slate-200"
              >
                Sprays
              </h2>

              {deleteError && (
                <p
                  data-testid="section-sprays-delete-error"
                  className="mb-3 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
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
                  className="text-sm text-red-400"
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
                      <Card
                        data-testid={`section-spray-card-${spray.id}`}
                        className="transition-shadow hover:shadow-md hover:shadow-slate-950/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-100">
                              {spray.productName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {spray.category} · {spray.doseLPerHa} L/ha ·{" "}
                              {new Date(spray.sprayedAt).toLocaleDateString()}
                            </p>
                            {spray.weatherNote && (
                              <p
                                data-testid={`section-spray-weather-${spray.id}`}
                                className="mt-1 text-xs text-slate-500"
                              >
                                {spray.weatherNote}
                              </p>
                            )}
                            {spray.phiDays != null && (
                              <PhiBadge
                                sprayedAt={spray.sprayedAt}
                                phiDays={spray.phiDays}
                                testid={`section-spray-phi-${spray.id}`}
                              />
                            )}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            data-testid={`section-spray-delete-${spray.id}`}
                            onClick={() =>
                              deleteSprayMutation.mutate(spray.id)
                            }
                            disabled={deleteSprayMutation.isPending}
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
            </section>
          </>
        )}
      </main>
    </div>
  );
}
