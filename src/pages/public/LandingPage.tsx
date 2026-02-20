import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import { useAuthStore } from "../../store/authStore";

const specialities = [
  "Cardiología",
  "Neurología",
  "Dermatología",
  "Oncología",
  "Pediatría",
  "Traumatología",
  "Oftalmología",
  "Urología",
];

const stats = [
  { value: "12+", label: "Especialidades médicas" },
  { value: "98%", label: "Satisfacción de pacientes" },
  { value: "24h", label: "Gestión de turnos" },
  { value: "10k+", label: "Consultas realizadas" },
];

const features = [
  {
    icon: "⚡",
    title: "Turnos en tiempo real",
    desc: "Reservá, cancelá y reprogramá turnos con disponibilidad actualizada al instante.",
  },
  {
    icon: "🔐",
    title: "Seguridad por roles",
    desc: "Acceso diferenciado para administradores, afiliados y especialistas con JWT RS256.",
  },
  {
    icon: "📧",
    title: "Recordatorios automáticos",
    desc: "El sistema envía notificaciones 24 horas antes de cada turno programado.",
  },
];

const dashboardItems = [
  { label: "Afiliados activos", val: "1,284", color: "var(--color-success)" },
  { label: "Especialistas", val: "47", color: "var(--color-accent)" },
  { label: "Turnos este mes", val: "386", color: "var(--color-accent-light)" },
];

const avatars = [
  { initials: "JG", bg: "var(--color-accent)" },
  { initials: "MP", bg: "var(--color-accent-light)" },
  { initials: "AL", bg: "var(--color-success)" },
  { initials: "RS", bg: "var(--color-error)" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const isLogged = !!token;
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const v = visible ? "visible" : "";

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="landing-nav">
        <Logo size="md" onClick={() => navigate("/")} />
        {isLogged ? (
          <button
            className="landing-nav-btn"
            onClick={() => {
              if (user?.role === "ADMIN") navigate("/admin/dashboard");
              else if (user?.role === "AFFILIATE")
                navigate("/affiliate/dashboard");
              else navigate("/specialist/dashboard");
            }}
          >
            Ir a mi panel →
          </button>
        ) : (
          <button
            className="landing-nav-btn"
            onClick={() => navigate("/login")}
          >
            Ingresar al sistema
          </button>
        )}
      </nav>

      {/* HERO */}
      <section className="landing-hero" ref={heroRef}>
        <div className="landing-hero-left">
          <div className={`landing-hero-label ${v}`}>
            Sistema de gestión médica — v2.0
          </div>
          <h1 className={`landing-hero-title ${v}`}>
            Salud que se
            <br />
            gestiona con <em>precisión</em>
          </h1>
          <p className={`landing-hero-subtitle ${v}`}>
            Plataforma integral para la administración de turnos, especialistas
            y afiliados. Diseñada para la excelencia en la atención médica.
          </p>
          <div className={`landing-hero-actions ${v}`}>
            <button
              className="landing-btn-primary"
              onClick={() => navigate("/login")}
            >
              {isLogged ? "Ir a mi panel" : "Acceder al sistema"}
            </button>
            <button
              className="landing-btn-secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Conocer más →
            </button>
          </div>
        </div>

        <div className="landing-hero-right">
          <div className="landing-hero-visual" />
          <div className="landing-hero-grid" />
          <div className="landing-hero-orb landing-orb-1" />
          <div className="landing-hero-orb landing-orb-2" />

          <div className={`landing-hero-card landing-hero-card-1 ${v}`}>
            <div className="landing-card-label">Próximo turno</div>
            <div className="landing-card-value">10:30 AM</div>
            <div className="landing-card-sub">Dr. García — Cardiología</div>
          </div>

          <div className={`landing-hero-card landing-hero-card-2 ${v}`}>
            <div className="landing-card-label">Estado del sistema</div>
            <div
              className="landing-card-value"
              style={{
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span className="landing-card-dot" />
              Operativo
            </div>
            <div className="landing-card-sub">Todos los servicios activos</div>
          </div>

          <div className={`landing-hero-card landing-hero-card-3 ${v}`}>
            <div className="landing-card-label">Turnos hoy</div>
            <div className="landing-card-value">24</div>
            <div
              className="landing-card-sub"
              style={{ display: "flex", gap: "1rem" }}
            >
              <span style={{ color: "var(--color-success)" }}>
                18 confirmados
              </span>
              <span>6 pendientes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-divider" />

      {/* STATS */}
      <section className="landing-stats">
        {stats.map((s) => (
          <div className="landing-stat-item" key={s.label}>
            <div className="landing-stat-value">{s.value}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* SPECIALITIES */}
      <section className="landing-specialities">
        <div className="landing-section-label">Cobertura médica</div>
        <h2 className="landing-section-title">
          Todas las <em>especialidades</em>
          <br />
          en un solo lugar
        </h2>
        <div className="landing-specialities-grid">
          {specialities.map((s, i) => (
            <div className="landing-speciality-item" key={s}>
              <div className="landing-speciality-number">0{i + 1}</div>
              <div className="landing-speciality-name">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features" id="features">
        <div>
          <div className="landing-section-label">Plataforma completa</div>
          <h2 className="landing-section-title">
            Todo lo que
            <br />
            necesitás para <em>gestionar</em>
          </h2>
          <div className="landing-features-list">
            {features.map((f) => (
              <div className="landing-feature-item" key={f.title}>
                <div className="landing-feature-icon">{f.icon}</div>
                <div>
                  <div className="landing-feature-title">{f.title}</div>
                  <div className="landing-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-features-visual">
          <div className="landing-features-card-main">
            <div className="landing-mini-label">Panel de administración</div>
            <div className="landing-mini-value">Resumen del día</div>
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {dashboardItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: item.color,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
            <div className="landing-progress-bar">
              <div className="landing-progress-fill" />
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.65rem",
                color: "var(--color-muted)",
              }}
            >
              72% capacidad utilizada
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {avatars.map((a) => (
                <div
                  key={a.initials}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: a.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {a.initials}
                </div>
              ))}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  color: "var(--color-muted)",
                }}
              >
                +
              </div>
            </div>
          </div>

          <div className="landing-features-card-accent">
            <div className="landing-mini-label">Disponibilidad</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                color: "var(--color-success)",
                marginBottom: "0.25rem",
              }}
            >
              98%
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>
              Uptime del sistema
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">
          ¿Listo para una gestión
          <br />
          <em>más inteligente?</em>
        </h2>
        <p className="landing-cta-sub">
          Accedé al sistema con tus credenciales y empezá a gestionar hoy.
        </p>

        <button className="landing-cta-btn" onClick={() => navigate("/login")}>
          Ingresar al sistema
        </button>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">Obra Social Almedin</div>
        <div className="landing-footer-text">
          © 2026 — Sistema de gestión médica v2.0
        </div>
      </footer>
    </div>
  );
}
