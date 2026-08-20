import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <h1 className="page-title">Evenements disponibles</h1>
      <p className="page-subtitle">Choisis un evenement et reserve ton ticket.</p>

      {loading && <p>Chargement...</p>}
      {error && <div className="error-box">{error}</div>}

      {!loading && events.length === 0 && (
        <div className="empty-state">Aucun evenement disponible pour le moment.</div>
      )}

      {events.map((event) => {
        const full = event.remaining_seats <= 0;
        return (
          <Link key={event.id} href={`/events/${event.id}`}>
            <div className="card event-card">
              <div>
                <h2 className="event-title">{event.title}</h2>
                <div className="event-meta">
                  📅 {formatDate(event.event_date)}
                  <br />
                  📍 {event.location}
                  <br />
                  💶 {Number(event.price) === 0 ? "Gratuit" : `${event.price} €`}
                </div>
              </div>
              <span className={`badge ${full ? "badge-full" : "badge-open"}`}>
                {full ? "Complet" : `${event.remaining_seats} places`}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
