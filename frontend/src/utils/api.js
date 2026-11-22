const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Native fetch wrapper that automatically attaches JWT Authorization header
 * and handles 401 Unauthorized responses.
 */
export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Endpoint can be full URL or relative path like "/api/subjects"
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:logout"));
  }

  return response;
}

export { API_URL };
