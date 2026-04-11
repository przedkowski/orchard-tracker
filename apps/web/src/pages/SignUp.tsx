import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
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
      className="flex min-h-screen items-center justify-center bg-slate-50 p-4"
    >
      <Card data-testid="signup-card" className="w-full max-w-sm">
        <h1
          data-testid="signup-heading"
          className="mb-4 text-xl font-semibold text-slate-900"
        >
          Create account
        </h1>

        <form
          onSubmit={handleSubmit}
          data-testid="signup-form"
          className="flex flex-col gap-3"
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
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            data-testid="signup-submit"
          >
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            data-testid="signup-to-signin"
            className="text-emerald-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
