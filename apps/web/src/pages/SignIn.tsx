import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
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
      className="flex min-h-screen items-center justify-center bg-slate-50 p-4"
    >
      <Card data-testid="signin-card" className="w-full max-w-sm">
        <h1
          data-testid="signin-heading"
          className="mb-4 text-xl font-semibold text-slate-900"
        >
          Sign in
        </h1>

        <form
          onSubmit={handleSubmit}
          data-testid="signin-form"
          className="flex flex-col gap-3"
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
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            data-testid="signin-submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link
            to="/signup"
            data-testid="signin-to-signup"
            className="text-emerald-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
