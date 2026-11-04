import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", {
        replace: true,
        state: { message: "Password changed successfully. Please log in." },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/login" className="text-sm font-semibold text-green-700">
          MealTrack
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Your password must be at least 8 characters long.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !token}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Change password"}
          </button>
          {!token && (
            <p className="text-sm text-red-700" role="alert">
              This reset link is missing its token. Request another reset link.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            to="/forgot-password"
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Request another reset link
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
