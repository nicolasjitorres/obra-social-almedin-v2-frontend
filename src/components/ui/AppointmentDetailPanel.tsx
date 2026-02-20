import Badge from "./Badge";

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
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

interface Props {
  appt: any;
  role: "AFFILIATE" | "SPECIALIST";
  onClose: () => void;
  // Acciones opcionales que el padre inyecta según contexto
  actions?: React.ReactNode;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.88rem",
          color: "var(--color-cream)",
          lineHeight: 1.6,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AppointmentDetailPanel({
  appt,
  role,
  onClose,
  actions,
}: Props) {
  if (!appt) return null;

  const [year, month, day] = appt.date.split("-");
  const dateFormatted = `${parseInt(day)} de ${MONTHS_LONG[parseInt(month) - 1]} de ${year}`;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 300,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: "var(--color-bg-soft)",
          borderLeft: "1px solid var(--color-border)",
          zIndex: 301,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "sticky",
            top: 0,
            background: "var(--color-bg-soft)",
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                marginBottom: "0.4rem",
              }}
            >
              Detalle del turno
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                color: "var(--color-cream)",
                fontWeight: 400,
              }}
            >
              {role === "AFFILIATE"
                ? appt.specialistName
                : (appt.affiliateName ?? `Afiliado #${appt.affiliateId}`)}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                marginTop: "0.2rem",
              }}
            >
              {dateFormatted}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", flex: 1 }}>
          {/* Estado */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Badge
              variant={appt.status}
              label={STATUS_LABELS[appt.status] ?? appt.status}
            />
          </div>

          {/* Info básica */}
          <div
            style={{
              background: "var(--color-bg-mid)",
              border: "1px solid var(--color-border)",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Field label="Fecha" value={dateFormatted} />
            <Field
              label="Horario"
              value={`${appt.startTime?.slice(0, 5)} – ${appt.endTime?.slice(0, 5)}`}
            />
            <Field label="Tipo" value={TYPE_LABELS[appt.type] ?? appt.type} />
            <Field
              label="Duración"
              value={
                appt.durationMinutes ? `${appt.durationMinutes} min` : null
              }
            />
          </div>

          {/* Notas clínicas */}
          {appt.clinicalNotes && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "0.75rem",
                }}
              >
                Notas clínicas
              </div>
              <div
                style={{
                  background: "var(--color-bg-mid)",
                  border: "1px solid var(--color-border)",
                  padding: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--color-cream)",
                  lineHeight: 1.7,
                }}
              >
                {appt.clinicalNotes}
              </div>
            </div>
          )}

          {/* Prescripción */}
          {appt.prescription && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "0.75rem",
                }}
              >
                Prescripción
              </div>
              <div
                style={{
                  background: "var(--color-bg-mid)",
                  border: "1px solid var(--color-border)",
                  padding: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--color-cream)",
                  lineHeight: 1.7,
                }}
              >
                {appt.prescription}
              </div>
            </div>
          )}

          {/* Motivo de cancelación */}
          {appt.cancellationReason && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Motivo de cancelación
              </div>
              {/* ← Agregá esto */}
              {appt.cancelledBy && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-muted)",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>Cancelado por:</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.6rem",
                      border: `1px solid ${appt.cancelledBy === "SPECIALIST" ? "var(--color-border-hover)" : appt.cancelledBy === "ADMIN" ? "rgba(239,68,68,0.3)" : "var(--color-border)"}`,
                      color:
                        appt.cancelledBy === "SPECIALIST"
                          ? "var(--color-accent)"
                          : appt.cancelledBy === "ADMIN"
                            ? "var(--color-error-text)"
                            : "var(--color-muted)",
                      background:
                        appt.cancelledBy === "SPECIALIST"
                          ? "var(--color-accent-soft)"
                          : appt.cancelledBy === "ADMIN"
                            ? "var(--color-error-soft)"
                            : "transparent",
                    }}
                  >
                    {appt.cancelledBy === "AFFILIATE"
                      ? "Afiliado"
                      : appt.cancelledBy === "SPECIALIST"
                        ? "Especialista"
                        : "Administrador"}
                  </span>
                </div>
              )}
              <div
                style={{
                  background: "var(--color-error-soft)",
                  border: "1px solid var(--color-error-border)",
                  padding: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--color-error-text)",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                {appt.cancellationReason}
              </div>
            </div>
          )}

          {/* Segunda cita */}
          {appt.parentAppointmentId && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                background: "var(--color-accent-soft)",
                border: "1px solid var(--color-border-hover)",
                padding: "0.6rem 1rem",
                marginBottom: "1.25rem",
              }}
            >
              Segunda cita · referencia #{appt.parentAppointmentId}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {actions && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              position: "sticky",
              bottom: 0,
              background: "var(--color-bg-soft)",
            }}
          >
            {actions}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
