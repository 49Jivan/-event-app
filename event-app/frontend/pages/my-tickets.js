import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyTickets() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    api
      .myBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleCancel(bookingId) {
    try {
      await api.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || loading) return <div className="container page">Chargement...</div>;

  const active = bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="container page">
      <h1 className="page-title">Mes tickets</h1>
      <p className="page-subtitle">Tous les evenements pour lesquels tu as reserve.</p>

      {error && <div className="error-box">{error}</div>}

      {active.length === 0 && (
        <div className="empty-state">Aucun ticket reserve pour le moment.</div>
      )}

      {active.map((b) => (
        <div key={b.booking_id} className="card event-card">
          <div>
            <h2 className="event-title">{b.title}</h2>
            <div className="event-meta">
              📅 {formatDate(b.event_date)}
              <br />
              📍 {b.location}
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => handleCancel(b.booking_id)}>
            Annuler
          </button>
        </div>
      ))}
    </div>
  );
}
