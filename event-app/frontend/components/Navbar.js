import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          🎟️ EventApp
        </Link>
        <div className="nav-links">
          <Link href="/">Evenements</Link>
          {user && <Link href="/my-tickets">Mes tickets</Link>}
          {user?.role === "admin" && <Link href="/admin/events">Admin</Link>}
          {user ? (
            <>
              <span>{user.name}</span>
              <button className="btn btn-outline" onClick={logout}>
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register" className="btn btn-primary">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
