import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { HttpError } from "../api/client";

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, name);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.body.error ?? "Sign up failed");
      } else {
        setError("Network error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="signup-page"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-4"
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">🌳</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Orchard Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your orchard sprays with ease
          </p>
        </div>

        <div
          data-testid="signup-card"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60"
        >
          <h2
            data-testid="signup-heading"
            className="mb-6 text-lg font-semibold text-slate-900"
          >
            Create your account
          </h2>

          <form
            onSubmit={handleSubmit}
            data-testid="signup-form"
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Name"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="signup-name-input"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="signup-email-input"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="signup-password-input"
            />

            {error && (
              <p
                data-testid="signup-error"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              data-testid="signup-submit"
              className="mt-1 w-full"
            >
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/signin"
            data-testid="signup-to-signin"
            className="font-medium text-emerald-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
