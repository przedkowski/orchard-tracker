import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import { listSections } from "../api/sections";
import { listSprays } from "../api/sprays";
import { getSuggestions } from "../api/suggestions";

const priorityColors: Record<string, string> = {
  high: "bg-red-900/40 text-red-400",
  medium: "bg-amber-900/40 text-amber-400",
  low: "bg-emerald-900/40 text-emerald-400",
};

export function Dashboard() {
  const { user } = useAuth();

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: listSections,
  });

  const spraysQuery = useQuery({
    queryKey: ["sprays"],
    queryFn: () => listSprays(),
  });

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: getSuggestions,
  });

  const sectionCount = sectionsQuery.data?.length ?? 0;
  const sprayCount = spraysQuery.data?.length ?? 0;
  const recentSprays = (spraysQuery.data ?? []).slice(0, 5);

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1
            data-testid="dashboard-heading"
            className="text-2xl font-bold text-slate-50"
          >
            Good day,{" "}
            <span data-testid="dashboard-user-name">{user?.name}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here's your orchard at a glance.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card data-testid="dashboard-stat-sections" className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Sections
            </p>
            <p
              data-testid="dashboard-stat-sections-value"
              className="text-3xl font-bold text-slate-50"
            >
              {sectionCount}
            </p>
            <Link
              to="/sections"
              data-testid="dashboard-sections-link"
              className="mt-1 text-sm font-medium text-emerald-400 hover:underline"
            >
              Manage →
            </Link>
          </Card>

          <Card data-testid="dashboard-stat-sprays" className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Spray records
            </p>
            <p
              data-testid="dashboard-stat-sprays-value"
              className="text-3xl font-bold text-slate-50"
            >
              {sprayCount}
            </p>
            <Link
              to="/sprays"
              data-testid="dashboard-sprays-link"
              className="mt-1 text-sm font-medium text-emerald-400 hover:underline"
            >
              View all →
            </Link>
          </Card>

          <Card data-testid="dashboard-stat-suggestions" className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Suggestions
            </p>
            <p
              data-testid="dashboard-stat-suggestions-value"
              className="text-3xl font-bold text-slate-50"
            >
              {suggestionsQuery.data?.suggestions.length ?? 0}
            </p>
            <span className="mt-1 text-sm text-slate-500">AI-assisted</span>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section data-testid="dashboard-recent-sprays">
            <h2 className="mb-3 text-base font-semibold text-slate-200">
              Recent sprays
            </h2>
            {spraysQuery.isLoading && (
              <p
                data-testid="dashboard-recent-loading"
                className="text-sm text-slate-500"
              >
                Loading…
              </p>
            )}
            {spraysQuery.isError && (
              <p
                data-testid="dashboard-recent-error"
                className="text-sm text-red-400"
              >
                Failed to load sprays
              </p>
            )}
            {spraysQuery.isSuccess && recentSprays.length === 0 && (
              <p
                data-testid="dashboard-recent-empty"
                className="text-sm text-slate-500"
              >
                No sprays logged yet.
              </p>
            )}
            {spraysQuery.isSuccess && recentSprays.length > 0 && (
              <ul className="flex flex-col gap-2">
                {recentSprays.map((spray) => (
                  <li key={spray.id}>
                    <Card
                      data-testid={`dashboard-spray-${spray.id}`}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {spray.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {spray.category} · {spray.doseLPerHa} L/ha
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-slate-500">
                        {new Date(spray.sprayedAt).toLocaleDateString()}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-testid="dashboard-suggestions">
            <h2 className="mb-3 text-base font-semibold text-slate-200">
              Suggestions
            </h2>
            {suggestionsQuery.isLoading && (
              <p
                data-testid="dashboard-suggestions-loading"
                className="text-sm text-slate-500"
              >
                Loading…
              </p>
            )}
            {suggestionsQuery.isSuccess &&
              (suggestionsQuery.data?.suggestions.length ?? 0) === 0 && (
                <p
                  data-testid="dashboard-suggestions-empty"
                  className="text-sm text-slate-500"
                >
                  No suggestions right now.
                </p>
              )}
            {suggestionsQuery.isSuccess &&
              (suggestionsQuery.data?.suggestions.length ?? 0) > 0 && (
                <ul className="flex flex-col gap-2">
                  {suggestionsQuery.data!.suggestions.map((s, i) => (
                    <li key={i}>
                      <Card data-testid={`suggestion-item-${i}`} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-100">
                              {s.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {s.reason}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Window: {s.suggestedWindow}
                            </p>
                          </div>
                          <span
                            data-testid={`suggestion-priority-${i}`}
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                              priorityColors[s.priority] ??
                              "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {s.priority}
                          </span>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </div>
      </main>
    </div>
  );
}
