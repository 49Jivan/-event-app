import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook() {
    if (!user) {
      router.push("/login");
      return;
    }
    setError("");
    setSuccess("");
    setBooking(true);
    try {
      await api.bookEvent(id);
      setSuccess("Ton ticket est reserve ! Retrouve-le dans 'Mes tickets'.");
      const updated = await api.getEvent(id);
      setEvent(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <div className="container page">Chargement...</div>;
  if (error && !event) return <div className="container page"><div className="error-box">{error}</div></div>;
  if (!event) return null;

  const full = event.remaining_seats <= 0;

  return (
    <div className="container page">
      <h1 className="page-title">{event.title}</h1>
      <p className="page-subtitle">
        📅 {formatDate(event.event_date)} · 📍 {event.location}
      </p>

      <div className="card">
        <p>{event.description || "Aucune description."}</p>
        <p className="event-meta">
          💶 {Number(event.price) === 0 ? "Gratuit" : `${event.price} €`}
          <br />
          🎫 {full ? "Complet" : `${event.remaining_seats} places restantes sur ${event.capacity}`}
        </p>

        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}
        {success && <div className="success-box" style={{ marginTop: 12 }}>{success}</div>}

        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-accent"
            onClick={handleBook}
            disabled={full || booking || !!success}
          >
            {booking ? "Reservation..." : full ? "Complet" : "Reserver mon ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
