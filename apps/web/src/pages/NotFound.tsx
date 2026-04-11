import { Link } from "react-router-dom";
import { Card } from "../components/Card";

export function NotFound() {
  return (
    <div
      data-testid="notfound-page"
      className="flex min-h-screen items-center justify-center bg-slate-50 p-4"
    >
      <Card data-testid="notfound-card" className="w-full max-w-sm text-center">
        <h1
          data-testid="notfound-heading"
          className="mb-2 text-2xl font-semibold text-slate-900"
        >
          404
        </h1>
        <p className="mb-4 text-sm text-slate-600">That page doesn't exist.</p>
        <Link
          to="/"
          data-testid="notfound-home-link"
          className="text-sm text-emerald-700 hover:underline"
        >
          Back home
        </Link>
      </Card>
    </div>
  );
}
