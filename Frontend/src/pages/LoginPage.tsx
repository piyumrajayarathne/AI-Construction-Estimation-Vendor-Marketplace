import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorAlert } from "../components/ErrorAlert";
import { Field, TextInput } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";

export function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginUser({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in with those credentials."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        Sign in
      </p>
      <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Use your AURABUILD account to open the construction workspace.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorAlert title="Sign-in failed" message={error} /> : null}
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={submitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Need an account?{" "}
        <Link className="font-medium text-secondary hover:underline" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}






