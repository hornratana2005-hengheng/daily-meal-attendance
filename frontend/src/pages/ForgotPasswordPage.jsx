import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your account email and we&apos;ll send you a password reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="reset-email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {(message || error) && (
            <p
              className={`rounded-xl border p-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
              role={error ? "alert" : "status"}
            >
              {error || message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
