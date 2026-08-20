import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.register({ name, email, password });
      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Inscription</h1>
      <p className="page-subtitle">
        Deja un compte ? <Link href="/login">Connecte-toi</Link>
      </p>

      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creation..." : "Creer mon compte"}
        </button>
      </form>
    </div>
  );
}
