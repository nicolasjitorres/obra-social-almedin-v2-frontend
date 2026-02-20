import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import AffiliateLayout from "../../components/layout/AffiliateLayout";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const SPECIALITY_LABELS: Record<string, string> = {
  CARDIOLOGIA: "Cardiología",
  DERMATOLOGIA: "Dermatología",
  ENDOCRINOLOGIA: "Endocrinología",
  ONCOLOGIA: "Oncología",
  ORTOPEDIA: "Ortopedia",
  UROLOGIA: "Urología",
  ODONTOLOGIA: "Odontología",
  NEUROLOGIA: "Neurología",
  HEMATOLOGIA: "Hematología",
  MEDICINA_GENERAL: "Medicina General",
};

const TYPE_OPTIONS = [
  { value: "CONSULTA", label: "Consulta" },
  { value: "CONTROL", label: "Control" },
  { value: "EXTRACCION", label: "Extracción" },
  { value: "OTRO", label: "Otro" },
];

const MONTHS = [
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

const STEPS = ["Especialista", "Fecha y horario", "Confirmar"];

const DAY_MAP: Record<string, number> = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("CONSULTA");
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [specialitySelected, setSpecialitySelected] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookedAppt, setBookedAppt] = useState<any>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: specialistsData } = useQuery({
    queryKey: ["specialists-active"],
    queryFn: () => api.get("/specialists?page=0&size=200").then((r) => r.data),
  });
  const specialists: any[] = (specialistsData?.content ?? []).filter(
    (s: any) => s.active,
  );

  const { data: schedules } = useQuery({
    queryKey: ["schedules-specialist", selectedSpecialist?.id],
    queryFn: () =>
      api
        .get(`/schedules/specialist/${selectedSpecialist.id}`)
        .then((r) => r.data),
    enabled: !!selectedSpecialist,
  });

  const { data: unavailability } = useQuery({
    queryKey: ["unavailability-specialist", selectedSpecialist?.id],
    queryFn: () =>
      api
        .get(`/unavailability/specialist/${selectedSpecialist.id}`)
        .then((r) => r.data),
    enabled: !!selectedSpecialist,
  });

  const availableDays = new Set(
    (schedules ?? [])
      .filter((s: any) => s.active)
      .map((s: any) => DAY_MAP[s.dayOfWeek]),
  );

  function isDateAvailable(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr + "T12:00:00");
    if (!availableDays.has(date.getDay())) return false;
    const unavails: any[] = unavailability ?? [];
    return !unavails.some((u) => {
      const from = u.dateFrom;
      const to = u.dateTo ?? u.dateFrom;
      return dateStr >= from && dateStr <= to;
    });
  }

  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ["slots", selectedSpecialist?.id, selectedDate],
    queryFn: () =>
      api
        .get(
          `/schedules/available-slots?specialistId=${selectedSpecialist.id}&date=${selectedDate}`,
        )
        .then((r) => r.data),
    enabled:
      !!selectedSpecialist && !!selectedDate && isDateAvailable(selectedDate),
  });

  // ── Mutación ───────────────────────────────────────────────────────────────
  const bookMutation = useMutation({
    mutationFn: () =>
      api.post("/appointments", {
        affiliateId: user?.userId,
        specialistId: selectedSpecialist.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        type: selectedType,
      }),
    onSuccess: (res) => {
      setBookedAppt(res.data);
      setSuccess(true);
    },
  });

  // ── Filtros de especialistas ───────────────────────────────────────────────
  const uniqueSpecialities = [
    ...new Set(specialists.map((s: any) => s.speciality)),
  ];

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (success && bookedAppt) {
    const [year, month, day] = bookedAppt.date.split("-");
    return (
      <AffiliateLayout>
        <div
          style={{ maxWidth: 500, margin: "3rem auto", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              color: "var(--color-success-text)",
            }}
          >
            ✓
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "var(--color-cream)",
              marginBottom: "0.5rem",
            }}
          >
            Turno confirmado
          </div>
          <div
            style={{
              fontSize: "0.88rem",
              color: "var(--color-muted)",
              marginBottom: "2rem",
            }}
          >
            Tu turno fue reservado exitosamente.
          </div>
          <div
            style={{
              background: "var(--color-accent-soft)",
              border: "1px solid var(--color-border)",
              padding: "1.5rem",
              textAlign: "left",
              marginBottom: "2rem",
            }}
          >
            {[
              { label: "Especialista", value: bookedAppt.specialistName },
              {
                label: "Fecha",
                value: `${day} de ${MONTHS[parseInt(month) - 1]} de ${year}`,
              },
              {
                label: "Horario",
                value: `${bookedAppt.startTime?.slice(0, 5)} – ${bookedAppt.endTime?.slice(0, 5)}`,
              },
              {
                label: "Tipo",
                value:
                  TYPE_OPTIONS.find((t) => t.value === bookedAppt.type)
                    ?.label ?? bookedAppt.type,
              },
              { label: "Estado", value: "Confirmado" },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{ fontSize: "0.88rem", color: "var(--color-cream)" }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              className="btn-sm"
              onClick={() => navigate("/affiliate/appointments")}
            >
              Ver mis turnos
            </button>
            <button
              className="btn-sm primary"
              onClick={() => {
                setStep(0);
                setSelectedSpecialist(null);
                setSelectedDate("");
                setSelectedSlot(null);
                setSuccess(false);
                setBookedAppt(null);
                setSpecialitySelected("");
              }}
            >
              Reservar otro
            </button>
          </div>
        </div>
      </AffiliateLayout>
    );
  }

  return (
    <AffiliateLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Nueva reserva</div>
        <h1 className="aff-header-title">Reservar turno</h1>
      </div>

      {/* STEPPER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <div
                className={`stepper-number ${i < step ? "done" : i === step ? "current" : "pending"}`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`stepper-label ${i < step ? "done" : i === step ? "current" : "pending"}`}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`stepper-line ${i < step ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0 — ESPECIALISTA */}
      {step === 0 && (
        <div>
          {!specialitySelected ? (
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "1rem",
                }}
              >
                ¿Qué especialidad necesitás?
              </div>
              <div className="specialist-grid">
                {uniqueSpecialities.map((sp) => (
                  <div
                    key={sp}
                    className="specialist-card"
                    onClick={() => setSpecialitySelected(sp)}
                  >
                    <div className="specialist-card-speciality">
                      {SPECIALITY_LABELS[sp] ?? sp}
                    </div>
                    <div
                      className="specialist-card-address"
                      style={{ marginTop: "0.5rem" }}
                    >
                      {
                        specialists.filter((s: any) => s.speciality === sp)
                          .length
                      }{" "}
                      especialista(s)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <button
                  className="btn-sm"
                  onClick={() => {
                    setSpecialitySelected("");
                    setSpecialistSearch("");
                  }}
                >
                  ← Especialidades
                </button>
                <span
                  style={{ fontSize: "0.82rem", color: "var(--color-accent)" }}
                >
                  {SPECIALITY_LABELS[specialitySelected] ?? specialitySelected}
                </span>
              </div>

              <input
                placeholder="Buscar por nombre o DNI..."
                value={specialistSearch}
                onChange={(e) => setSpecialistSearch(e.target.value)}
                className="adm-search"
                style={{
                  width: "100%",
                  maxWidth: 360,
                  marginBottom: "1.25rem",
                }}
              />

              <div className="specialist-grid">
                {specialists
                  .filter((s: any) => s.speciality === specialitySelected)
                  .filter((s: any) => {
                    const q = specialistSearch.toLowerCase();
                    return (
                      !q ||
                      `${s.firstName} ${s.lastName} ${s.dni}`
                        .toLowerCase()
                        .includes(q)
                    );
                  })
                  .map((s: any) => (
                    <div
                      key={s.id}
                      className={`specialist-card ${selectedSpecialist?.id === s.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedSpecialist(s);
                        setStep(1);
                      }}
                    >
                      <div className="specialist-card-name">
                        Dr/a. {s.firstName} {s.lastName}
                      </div>
                      <div className="specialist-card-speciality">
                        {SPECIALITY_LABELS[s.speciality] ?? s.speciality}
                      </div>
                      {s.address && (
                        <div className="specialist-card-address">
                          {s.address}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 1 — FECHA Y SLOT */}
      {step === 1 && (
        <div>
          {/* Chip especialista */}
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.25rem",
              background: "var(--color-accent-soft)",
              border: "1px solid var(--color-border)",
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
                  color: "var(--color-accent)",
                  marginBottom: "0.2rem",
                }}
              >
                Especialista seleccionado
              </div>
              <div style={{ color: "var(--color-cream)" }}>
                Dr/a. {selectedSpecialist.firstName}{" "}
                {selectedSpecialist.lastName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                {SPECIALITY_LABELS[selectedSpecialist.speciality] ??
                  selectedSpecialist.speciality}
              </div>
            </div>
            <button
              className="btn-sm"
              onClick={() => {
                setStep(0);
                setSelectedDate("");
                setSelectedSlot(null);
                setSpecialitySelected("");
              }}
            >
              Cambiar
            </button>
          </div>

          {/* Calendar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.75rem",
                width: "100%",
              }}
            >
              Seleccioná una fecha
            </label>
              <DayPicker
                mode="single"
                selected={
                  selectedDate
                    ? new Date(selectedDate + "T12:00:00")
                    : undefined
                }
                onSelect={(date) => {
                  if (!date) return;
                  const str = date.toISOString().split("T")[0];
                  setSelectedDate(str);
                  setSelectedSlot(null);
                }}
                disabled={[
                  { before: new Date() },
                  (date) => !availableDays.has(date.getDay()),
                  (date) => {
                    const str = date.toISOString().split("T")[0];
                    const unavails: any[] = unavailability ?? [];
                    return unavails.some((u) => {
                      const from = u.dateFrom;
                      const to = u.dateTo ?? u.dateFrom;
                      return str >= from && str <= to;
                    });
                  },
                ]}
                fromDate={new Date()}
              />
          </div>

          {/* Slots */}
          {selectedDate && (
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Horarios disponibles
              </div>
              {loadingSlots ? (
                <div className="empty-state">Cargando horarios...</div>
              ) : !slots || slots.length === 0 ? (
                <div className="empty-state">
                  No hay horarios disponibles para esa fecha. Probá con otro
                  día.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {slots.map((slot: any) => (
                    <button
                      key={slot.startTime}
                      className={`slot-btn ${selectedSlot?.startTime === slot.startTime ? "selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.startTime?.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tipo de consulta */}
          {selectedSlot && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "0.6rem",
                }}
              >
                Tipo de consulta
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    className={`type-btn ${selectedType === t.value ? "selected" : ""}`}
                    onClick={() => setSelectedType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-sm" onClick={() => setStep(0)}>
              ← Atrás
            </button>
            {selectedSlot && (
              <button className="btn-sm primary" onClick={() => setStep(2)}>
                Continuar →
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 — CONFIRMAR */}
      {step === 2 && (
        <div style={{ maxWidth: 480 }}>
          <div
            style={{
              background: "var(--color-accent-soft)",
              border: "1px solid var(--color-border)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                marginBottom: "1rem",
              }}
            >
              Resumen del turno
            </div>
            {[
              {
                label: "Especialista",
                value: `Dr/a. ${selectedSpecialist.firstName} ${selectedSpecialist.lastName}`,
              },
              {
                label: "Especialidad",
                value:
                  SPECIALITY_LABELS[selectedSpecialist.speciality] ??
                  selectedSpecialist.speciality,
              },
              {
                label: "Fecha",
                value: new Date(selectedDate + "T12:00:00").toLocaleDateString(
                  "es-AR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                ),
              },
              {
                label: "Horario",
                value: `${selectedSlot.startTime?.slice(0, 5)} – ${selectedSlot.endTime?.slice(0, 5)} (${selectedSlot.durationMinutes} min)`,
              },
              {
                label: "Tipo",
                value:
                  TYPE_OPTIONS.find((t) => t.value === selectedType)?.label ??
                  selectedType,
              },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.65rem 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--color-cream)",
                    textAlign: "right",
                    maxWidth: "60%",
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--color-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Al confirmar, el turno quedará registrado en el sistema. Podés
            cancelarlo desde "Mis turnos".
          </div>

          {bookMutation.isError && (
            <div
              style={{
                background: "var(--color-error-soft)",
                border: "1px solid var(--color-error-border)",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "var(--color-error-text)",
              }}
            >
              Error al reservar el turno. Verificá que el horario siga
              disponible.
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-sm" onClick={() => setStep(1)}>
              ← Atrás
            </button>
            <button
              className="btn-sm primary"
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? "Reservando..." : "Confirmar turno"}
            </button>
          </div>
        </div>
      )}
    </AffiliateLayout>
  );
}
