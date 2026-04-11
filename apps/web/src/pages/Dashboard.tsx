import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import { listSections } from "../api/sections";
import { listSprays } from "../api/sprays";
import { getSuggestions } from "../api/suggestions";

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
    <div data-testid="dashboard-page" className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-5xl p-4">
        <h1
          data-testid="dashboard-heading"
          className="mb-1 text-2xl font-semibold text-slate-900"
        >
          Welcome, <span data-testid="dashboard-user-name">{user?.name}</span>
        </h1>
        <p className="mb-6 text-sm text-slate-600">Your orchard at a glance.</p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card data-testid="dashboard-stat-sections">
            <p className="text-sm text-slate-500">Sections</p>
            <p
              data-testid="dashboard-stat-sections-value"
              className="text-2xl font-semibold text-slate-900"
            >
              {sectionCount}
            </p>
            <Link
              to="/sections"
              data-testid="dashboard-sections-link"
              className="text-sm text-emerald-700 hover:underline"
            >
              Manage →
            </Link>
          </Card>

          <Card data-testid="dashboard-stat-sprays">
            <p className="text-sm text-slate-500">Spray records</p>
            <p
              data-testid="dashboard-stat-sprays-value"
              className="text-2xl font-semibold text-slate-900"
            >
              {sprayCount}
            </p>
            <Link
              to="/sprays"
              data-testid="dashboard-sprays-link"
              className="text-sm text-emerald-700 hover:underline"
            >
              View all →
            </Link>
          </Card>

          <Card data-testid="dashboard-stat-suggestions">
            <p className="text-sm text-slate-500">Suggestions</p>
            <p
              data-testid="dashboard-stat-suggestions-value"
              className="text-2xl font-semibold text-slate-900"
            >
              {suggestionsQuery.data?.suggestions.length ?? 0}
            </p>
            <span className="text-sm text-slate-500">AI-assisted</span>
          </Card>
        </div>

        <section data-testid="dashboard-recent-sprays" className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
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
              className="text-sm text-red-600"
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
                  <Card data-testid={`dashboard-spray-${spray.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {spray.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {spray.category} · {spray.doseLPerHa} L/ha
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(spray.sprayedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section data-testid="dashboard-suggestions">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
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
                    <Card data-testid={`suggestion-item-${i}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {s.title}
                          </p>
                          <p className="text-xs text-slate-600">{s.reason}</p>
                          <p className="text-xs text-slate-500">
                            Window: {s.suggestedWindow}
                          </p>
                        </div>
                        <span
                          data-testid={`suggestion-priority-${i}`}
                          className="text-xs font-medium uppercase text-emerald-700"
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
      </main>
    </div>
  );
}
