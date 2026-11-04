import { useState } from "react";

import { useAuth } from "../context/useAuth";

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const updatedUser = await updateProfile({ name, email });
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setMessage("Your profile has been updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="mt-1 text-gray-500">
          Update the name and email address associated with your account.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="profile-name"
              autoComplete="name"
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {(error || message) && (
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
            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
