import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorAlert } from "../components/ErrorAlert";
import { Field, TextInput } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";
import { getErrorMessage } from "../utils/errors";

type RoleChoice = "customer" | "vendor";

export function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<RoleChoice>("customer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Password confirmation does not match.");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration could not be completed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        Create account
      </p>
      <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight text-ink">Join AURABUILD</h1>
      <p className="mt-1 text-sm text-muted">
        Customers set up projects and drawings. Vendors can register now;
        marketplace tools are coming later. Admin accounts cannot be self-created.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorAlert title="Registration failed" message={error} /> : null}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Role</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "customer" as const,
                  title: "Customer",
                  copy: "Own projects and PDFs",
                  active: "border-area-customer bg-[#EAF1F8]",
                },
                {
                  id: "vendor" as const,
                  title: "Vendor",
                  copy: "Marketplace coming later",
                  active: "border-area-vendor bg-[#F4EEE8]",
                },
              ]
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition",
                  role === option.id
                    ? option.active
                    : "border-line bg-surface hover:border-subtle",
                )}
              >
                <span className="block text-sm font-semibold text-ink">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {option.copy}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" htmlFor="full_name">
          <TextInput
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </Field>
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
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirm_password">
          <TextInput
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="font-medium text-secondary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}






