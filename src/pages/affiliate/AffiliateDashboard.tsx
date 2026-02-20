import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AffiliateLayout from "../../components/layout/AffiliateLayout";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  AUSENTE: "Ausente",
};

const TYPE_LABELS: Record<string, string> = {
  CONSULTA: "Consulta",
  EXTRACCION: "Extracción",
  CONTROL: "Control",
  CIRUGIA: "Cirugía",
  OTRO: "Otro",
};

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["my-appointments", user?.userId],
    queryFn: () =>
      api
        .get(`/appointments/affiliate/${user?.userId}?page=0&size=100`)
        .then((r) => r.data),
    enabled: !!user?.userId,
  });

  const { data: penaltiesData } = useQuery({
    queryKey: ["my-penalties", user?.userId],
    queryFn: () => api.get("/penalties/my").then((r) => r.data),
    enabled: !!user?.userId,
  });

  const allAppointments = data?.content ?? [];
  const today = new Date().toISOString().split("T")[0];

  const upcoming = allAppointments
    .filter(
      (a: any) =>
        a.date >= today &&
        (a.status === "CONFIRMADA" || a.status === "PENDIENTE"),
    )
    .sort((a: any, b: any) =>
      (a.date + a.startTime).localeCompare(b.date + b.startTime),
    )
    .slice(0, 5);

  const past = allAppointments.filter(
    (a: any) => a.date < today || a.status === "COMPLETADA",
  ).length;

  const activePenalty = (penaltiesData as any[])?.find((p: any) => p.active);

  return (
    <AffiliateLayout>
      {/* HEADER */}
      <div className="aff-header">
        <div className="aff-header-tag">Panel personal</div>
        <h1 className="aff-header-title">
          Buenos días, {user?.fullName?.split(" ")[0]}
        </h1>
      </div>

      {/* PENALIDAD ACTIVA */}
      {activePenalty && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-error-text",
                marginBottom: "0.3rem",
              }}
            >
              Penalidad activa
            </div>
            <div style={{ fontSize: "0.88rem", color: "#fca5a5" }}>
              Tenés una suspensión activa.
              {activePenalty.suspendedUntil && (
                <>
                  {" "}
                  Hasta el{" "}
                  {new Date(activePenalty.suspendedUntil).toLocaleDateString(
                    "es-AR",
                  )}
                  .
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="dashboard-metrics3"
      >
        {[
          {
            label: "Próximos turnos",
            value: upcoming.length,
            color: "var(--color-accent-light)",
          },
          {
            label: "Turnos realizados",
            value: past,
            color: "var(--color-cream)",
          },
          {
            label: "Total histórico",
            value: allAppointments.length,
            color: "var(--color-muted)",
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--color-accent-soft)",
              border: "1px solid var(--color-border)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.5rem",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.2rem",
                fontWeight: 300,
                color: m.color,
                lineHeight: 1,
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* PRÓXIMOS TURNOS */}
      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          Próximos turnos
        </div>
        <button
          className="btn-sm"
          onClick={() => navigate("/affiliate/appointments")}
        >
          Ver todos →
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          No tenés turnos próximos.{" "}
          <span
            style={{
              color: "var(--color-accent)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/affiliate/book")}
          >
            Reservar uno
          </span>
        </div>
      ) : (
        upcoming.map((appt: any) => {
          const [year, month, day] = appt.date.split("-");
          return (
            <div className="appt-card" key={appt.id}>
              <div className="appt-date-box">
                <div className="appt-date-day">{day}</div>
                <div className="appt-date-month">
                  {MONTHS[parseInt(month) - 1]} {year}
                </div>
              </div>
              <div>
                <div className="appt-info-name">{appt.specialistName}</div>
                <div className="appt-info-sub">
                  <span>
                    {appt.startTime?.slice(0, 5)} – {appt.endTime?.slice(0, 5)}
                  </span>
                  <span>{TYPE_LABELS[appt.type] ?? appt.type}</span>
                </div>
              </div>
              <div className="appt-actions">
                <span className={`badge badge-${appt.status}`}>
                  {STATUS_LABELS[appt.status] ?? appt.status}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* CTA RESERVAR */}
      <div
        style={{
          marginTop: "2rem",
          padding: "2rem",
          textAlign: "center",
          border: "1px solid var(--color-border)",
          background: "var(--color-accent-soft)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "var(--color-cream)",
            marginBottom: "0.5rem",
          }}
        >
          ¿Necesitás un turno?
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--color-muted)",
            marginBottom: "1.25rem",
          }}
        >
          Reservá en minutos con cualquiera de nuestros especialistas.
        </div>
        <button
          className="btn-sm primary"
          onClick={() => navigate("/affiliate/book")}
        >
          Reservar turno
        </button>
      </div>
    </AffiliateLayout>
  );
}
