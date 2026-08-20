import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  capacity: 20,
  price: 0,
};

export default function AdminEvents() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    loadEvents();
  }, [user, authLoading]);

  function loadEvents() {
    api.listEvents().then(setEvents).catch((err) => setError(err.message));
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.createEvent({
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price),
      });
      setSuccess("Evenement cree avec succes.");
      setForm(emptyForm);
      loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet evenement ?")) return;
    try {
      await api.deleteEvent(id);
      loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || !user || user.role !== "admin") {
    return <div className="container page">Chargement...</div>;
  }

  return (
    <div className="container page">
      <h1 className="page-title">Administration des evenements</h1>
      <p className="page-subtitle">Cree et gere les evenements proposes aux utilisateurs.</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Nouvel evenement</h2>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <div className="form-group">
            <label>Titre</label>
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Date et heure</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => handleChange("event_date", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lieu</label>
            <input
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacite (places)</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Prix (€)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Creation..." : "Creer l'evenement"}
          </button>
        </form>
      </div>

      <h2>Evenements existants</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date</th>
            <th>Lieu</th>
            <th>Places</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{new Date(e.event_date).toLocaleDateString("fr-FR")}</td>
              <td>{e.location}</td>
              <td>{e.remaining_seats}/{e.capacity}</td>
              <td>
                <button className="btn btn-danger" onClick={() => handleDelete(e.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
