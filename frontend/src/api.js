const API_BASE_URL = (
import.meta.env.VITE_API_BASE_URL ||
"https://daily-meal-attendance.onrender.com"
).replace(/\/+$/, "");

console.log("API BASE URL:", API_BASE_URL);

async function apiRequest(path, options = {}) {
const url = `${API_BASE_URL}${path}`;

let response;

try {
response = await fetch(url, {
...options,
headers: {
"Content-Type": "application/json",
...options.headers,
},
});
} catch (error) {
console.error("API CONNECTION ERROR:", error);


throw new Error(
  `Cannot connect to ${url}. Check your browser Console for details.`,
  { cause: error },
);


}

const data = await response.json().catch(() => null);

if (!response.ok) {
const detail = data?.detail;

const message = Array.isArray(detail)
  ? detail.map((item) => item.msg).join(", ")
  : detail;

const error = new Error(
  message || `API request failed (${response.status})`
);

error.status = response.status;
throw error;


}

return data;
}

export { apiRequest };
