import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import ThemeToggle from "../ui/ThemeToggle";
import Logo from "../ui/Logo";
import MobileMenu from "../ui/MobileMenu";

const navItems = [
  { path: "/affiliate/dashboard", label: "Inicio" },
  { path: "/affiliate/appointments", label: "Mis turnos" },
  { path: "/affiliate/book", label: "Reservar turno" },
  { path: "/affiliate/profile", label: "Mi perfil" },
];

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/");
  };

  return (
    <div className="aff-layout">
      <header className="aff-topbar">
        <Logo size="sm" onClick={() => navigate("/")} />

        {/* Nav desktop */}
        <nav className="aff-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`aff-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Derecha desktop */}
        <div className="aff-topbar-right">
          <span className="aff-user">
            Hola, <strong>{user?.fullName?.split(" ")[0]}</strong>
          </span>
          <ThemeToggle />
          <button
            className="aff-logout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Salir
          </button>
        </div>

        {/* Hamburger mobile */}
        <div className="aff-mobile-right">
          <ThemeToggle />
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.2rem",
              }}
            >
              Afiliado
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--color-cream)" }}>
              {user?.fullName}
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </MobileMenu>

      <main className="aff-main">{children}</main>
    </div>
  );
}
