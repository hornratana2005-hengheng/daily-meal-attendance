const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://daily-meal-attendance.onrender.com";

async function apiRequest(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      `Could not connect to the API at ${API_BASE_URL}. Make sure the backend is running.`,
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail;
    const error = new Error(
      message || `API request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export { apiRequest };
