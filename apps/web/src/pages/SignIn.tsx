import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { HttpError } from "../api/client";

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.body.error ?? "Sign in failed");
      } else {
        setError("Network error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="signin-page"
      className="flex min-h-screen items-center justify-center bg-slate-950 p-4"
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">🌳</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-50">
            Orchard Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
        </div>

        <div
          data-testid="signin-card"
          className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl shadow-slate-950/60"
        >
          <h2
            data-testid="signin-heading"
            className="mb-6 text-lg font-semibold text-slate-50"
          >
            Welcome back
          </h2>

          <form
            onSubmit={handleSubmit}
            data-testid="signin-form"
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="signin-email-input"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="signin-password-input"
            />

            {error && (
              <p
                data-testid="signin-error"
                className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              data-testid="signin-submit"
              className="mt-1 w-full"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            to="/signup"
            data-testid="signin-to-signup"
            className="font-medium text-emerald-400 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
