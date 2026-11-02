import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function AuthPage() {
  const { user, loading, sessionError, logIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="p-8 text-center text-gray-600">Checking your session…</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSigningUp) {
        await signUp({ name, email, password });
      } else {
        await logIn({ email, password });
      }
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm font-semibold text-green-700">
          MealTrack
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          {isSigningUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {isSigningUp
            ? "Sign up to create your member profile and track attendance."
            : "Log in to manage your meal attendance."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isSigningUp && (
            <div>
              <label
                htmlFor="signup-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="signup-name"
                autoComplete="name"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isSigningUp ? "new-password" : "current-password"}
              minLength={isSigningUp ? 8 : 1}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
            {isSigningUp && (
              <p className="mt-1 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            )}
          </div>

          {(error || sessionError) && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error || `Could not verify your session: ${sessionError}`}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : isSigningUp
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSigningUp ? "Already have an account?" : "New to MealTrack?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSigningUp((previous) => !previous);
              setError("");
            }}
            className="font-semibold text-green-700 hover:text-green-800"
          >
            {isSigningUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
