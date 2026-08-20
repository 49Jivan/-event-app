const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3047/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Une erreur est survenue");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  listEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (payload) => request("/events", { method: "POST", body: payload, auth: true }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE", auth: true }),

  bookEvent: (eventId) => request(`/bookings/${eventId}`, { method: "POST", auth: true }),
  myBookings: () => request("/bookings/me", { auth: true }),
  cancelBooking: (id) => request(`/bookings/${id}`, { method: "DELETE", auth: true }),
};

export { getToken };
