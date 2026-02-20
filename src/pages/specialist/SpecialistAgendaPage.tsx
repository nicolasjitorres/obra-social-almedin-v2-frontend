import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import AppointmentDetailPanel from "../../components/ui/AppointmentDetailPanel";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  AUSENTE: "Ausente",
};
const TYPE_OPTIONS = [
  { value: "CONSULTA", label: "Consulta" },
  { value: "EXTRACCION", label: "Extracción" },
  { value: "CONTROL", label: "Control" },
  { value: "CIRUGIA", label: "Cirugía" },
  { value: "OTRO", label: "Otro" },
];
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

// ─── Schemas ──────────────────────────────────────────────────────────────────
const completeSchema = z.object({
  clinicalNotes: z.string().optional(),
  prescription: z.string().optional(),
});
type CompleteForm = z.infer<typeof completeSchema>;

const deriveSchema = z.object({
  date: z.string().min(1, "Requerido"),
  startTime: z.string().min(1, "Requerido"),
  type: z.string().min(1, "Requerido"),
});
type DeriveForm = z.infer<typeof deriveSchema>;

const cancelSchema = z.object({
  reason: z.string().min(1, "El motivo es requerido"),
});
type CancelForm = z.infer<typeof cancelSchema>;

// ─── Complete Modal ───────────────────────────────────────────────────────────
function CompleteModal({
  appt,
  onClose,
  onSuccess,
}: {
  appt: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CompleteForm>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      clinicalNotes: appt.clinicalNotes ?? "",
      prescription: appt.prescription ?? "",
    },
  });

  const onSubmit = async (data: CompleteForm) => {
    await api.patch(`/appointments/${appt.id}/complete`, data);
    onSuccess();
  };

  return (
    <Modal
      title="Completar turno"
      onClose={onClose}
      maxWidth={560}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            form="complete-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Confirmar turno"}
          </button>
        </>
      }
    >
      {/* Info del turno */}
      <div
        style={{
          padding: "0.85rem 1rem",
          background: "var(--color-bg-mid)",
          border: "1px solid var(--color-border)",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--color-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "0.3rem",
          }}
        >
          Turno
        </div>
        <div style={{ color: "var(--color-cream)", fontSize: "0.88rem" }}>
          {appt.affiliateName}
        </div>
        <div
          style={{
            color: "var(--color-muted)",
            fontSize: "0.78rem",
            marginTop: "0.2rem",
          }}
        >
          {appt.date} · {appt.startTime?.slice(0, 5)} ·{" "}
          {TYPE_OPTIONS.find((t) => t.value === appt.type)?.label ?? appt.type}
        </div>
      </div>

      <form id="complete-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label">Notas clínicas</label>
          <textarea
            {...register("clinicalNotes")}
            rows={4}
            className="form-input"
            placeholder="Descripción de la consulta, diagnóstico, observaciones..."
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Prescripción / Receta</label>
          <textarea
            {...register("prescription")}
            rows={3}
            className="form-input"
            placeholder="Medicamentos, dosis, indicaciones..."
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Derive Modal ─────────────────────────────────────────────────────────────
function DeriveModal({
  appt,
  onClose,
  onSuccess,
}: {
  appt: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeriveForm>({
    resolver: zodResolver(deriveSchema),
  });

  const onSubmit = async (data: DeriveForm) => {
    await api.post(`/appointments/${appt.id}/derive`, {
      affiliateId: appt.affiliateId,
      specialistId: user?.userId,
      date: data.date,
      startTime: data.startTime + ":00",
      type: data.type,
    });
    onSuccess();
  };

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Modal
      title="Derivar — segunda cita"
      onClose={onClose}
      maxWidth={480}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            form="derive-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear segunda cita"}
          </button>
        </>
      }
    >
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "var(--color-bg-mid)",
          border: "1px solid var(--color-border)",
          marginBottom: "0.5rem",
          fontSize: "0.82rem",
        }}
      >
        <span style={{ color: "var(--color-muted)" }}>Paciente: </span>
        <span style={{ color: "var(--color-cream)" }}>
          {appt.affiliateName}
        </span>
      </div>

      <form id="derive-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              {...register("date")}
              type="date"
              min={minDate}
              className={`form-input ${errors.date ? "err" : ""}`}
            />
            {errors.date && <p className="form-error">{errors.date.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Hora</label>
            <input
              {...register("startTime")}
              type="time"
              className={`form-input ${errors.startTime ? "err" : ""}`}
            />
            {errors.startTime && (
              <p className="form-error">{errors.startTime.message}</p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de cita</label>
          <select
            {...register("type")}
            className={`form-select ${errors.type ? "err" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="form-error">{errors.type.message}</p>}
        </div>
      </form>
    </Modal>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({
  appt,
  onClose,
  onSuccess,
}: {
  appt: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CancelForm>({
    resolver: zodResolver(cancelSchema),
  });

  const onSubmit = async (data: CancelForm) => {
    await api.patch(`/appointments/${appt.id}/cancel`, {
      cancelledBy: "SPECIALIST",
      reason: data.reason,
    });
    onSuccess();
  };

  return (
    <Modal
      title="Cancelar turno"
      onClose={onClose}
      maxWidth={440}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Volver
          </button>
          <button
            className="btn-danger"
            form="cancel-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar cancelación"}
          </button>
        </>
      }
    >
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "var(--color-bg-mid)",
          border: "1px solid var(--color-border)",
          marginBottom: "0.5rem",
          fontSize: "0.82rem",
        }}
      >
        <span style={{ color: "var(--color-muted)" }}>Paciente: </span>
        <span style={{ color: "var(--color-cream)" }}>
          {appt.affiliateName}
        </span>
        <span style={{ color: "var(--color-muted)", marginLeft: "1rem" }}>
          {appt.date} · {appt.startTime?.slice(0, 5)}
        </span>
      </div>
      <form id="cancel-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label">Motivo de cancelación</label>
          <textarea
            {...register("reason")}
            rows={3}
            className={`form-input ${errors.reason ? "err" : ""}`}
            placeholder="Describí el motivo..."
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
          {errors.reason && (
            <p className="form-error">{errors.reason.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpecialistAgendaPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { toast, showToast } = useToast();

  const [filter, setFilter] = useState("UPCOMING");
  const [search, setSearch] = useState("");
  const [completeTarget, setCompleteTarget] = useState<any>(null);
  const [deriveTarget, setDeriveTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [absentTarget, setAbsentTarget] = useState<any>(null);
  const [detailAppt, setDetailAppt] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["specialist-appointments", user?.userId],
    queryFn: () =>
      api
        .get(`/appointments/specialist/${user?.userId}?page=0&size=500`)
        .then((r) => r.data),
    enabled: !!user?.userId,
  });

  const absentMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/appointments/${id}/absent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specialist-appointments"] });
      setAbsentTarget(null);
      showToast("Turno marcado como ausente", "ok");
    },
    onError: () => showToast("Error al marcar ausente", "err"),
  });

  const all: any[] = data?.content ?? [];
  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    let rows = [...all];
    if (filter === "TODAY") rows = rows.filter((a) => a.date === today);
    else if (filter === "UPCOMING")
      rows = rows.filter(
        (a) =>
          a.date >= today &&
          (a.status === "CONFIRMADA" || a.status === "PENDIENTE"),
      );
    else if (filter === "COMPLETADA")
      rows = rows.filter((a) => a.status === "COMPLETADA");
    else if (filter === "CANCELADA")
      rows = rows.filter(
        (a) => a.status === "CANCELADA" || a.status === "AUSENTE",
      );
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((a) =>
        (a.affiliateName ?? "").toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => {
      const da = a.date + a.startTime,
        db = b.date + b.startTime;
      return filter === "COMPLETADA"
        ? db.localeCompare(da)
        : da.localeCompare(db);
    });
  }, [all, filter, search, today]);

  const canAct = (a: any) =>
    (a.status === "CONFIRMADA" || a.status === "PENDIENTE") && a.date <= today;
  const canCancel = (a: any) =>
    a.status === "CONFIRMADA" || a.status === "PENDIENTE";
  const canDerive = (a: any) => a.status === "COMPLETADA";

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["specialist-appointments"] });

  return (
    <SpecialistLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Gestión</div>
        <h1 className="aff-header-title">Mi agenda</h1>
      </div>

      {/* FILTROS */}
      <div className="filters-bar"
      >
        <div className="status-chips">
          {[
            { key: "TODAY", label: "Hoy" },
            { key: "UPCOMING", label: "Próximos" },
            { key: "COMPLETADA", label: "Completados" },
            { key: "CANCELADA", label: "Cancelados" },
            { key: "ALL", label: "Todos" },
          ].map((f) => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar paciente..."
          />
          <span
            style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
          >
            {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* LISTA */}
      {isLoading ? (
        <div className="empty-state">Cargando agenda...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No hay turnos en esta categoría.</div>
      ) : (
        filtered.map((a: any) => {
          const [year, month, day] = a.date.split("-");
          return (
            <div
              className="appt-card"
              key={a.id}
              onClick={() => setDetailAppt(a)}
              style={{ cursor: "pointer" }}
            >
              <div className="appt-date-box">
                <div className="appt-date-day">{day}</div>
                <div className="appt-date-month">
                  {MONTHS[parseInt(month) - 1]} {year}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="appt-info-name">
                  {a.affiliateName ?? `Afiliado #${a.affiliateId}`}
                </div>
                <div className="appt-info-sub">
                  <span>
                    {a.startTime?.slice(0, 5)} – {a.endTime?.slice(0, 5)}
                  </span>
                  <span>
                    {TYPE_OPTIONS.find((t) => t.value === a.type)?.label ??
                      a.type}
                  </span>
                  {a.parentAppointmentId && (
                    <span
                      style={{
                        color: "var(--color-accent)",
                        fontSize: "0.7rem",
                      }}
                    >
                      Segunda cita
                    </span>
                  )}
                </div>
                {a.clinicalNotes && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-muted)",
                      marginTop: "0.35rem",
                      fontStyle: "italic",
                    }}
                  >
                    {a.clinicalNotes.length > 80
                      ? a.clinicalNotes.slice(0, 80) + "..."
                      : a.clinicalNotes}
                  </div>
                )}
              </div>

              <div className="appt-actions">
                <Badge
                  variant={a.status}
                  label={STATUS_LABELS[a.status] ?? a.status}
                />
                {canAct(a) && (
                  <>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompleteTarget(a);
                      }}
                    >
                      Completar
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAbsentTarget(a);
                      }}
                    >
                      Ausente
                    </button>
                  </>
                )}
                {canCancel(a) && (
                  <button
                    className="btn-icon danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCancelTarget(a);
                    }}
                  >
                    Cancelar
                  </button>
                )}
                {canDerive(a) && (
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeriveTarget(a);
                    }}
                  >
                    Derivar
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* MODALES */}
      {completeTarget && (
        <CompleteModal
          appt={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onSuccess={() => {
            setCompleteTarget(null);
            invalidate();
            showToast("Turno completado", "ok");
          }}
        />
      )}
      {deriveTarget && (
        <DeriveModal
          appt={deriveTarget}
          onClose={() => setDeriveTarget(null)}
          onSuccess={() => {
            setDeriveTarget(null);
            invalidate();
            showToast("Segunda cita creada", "ok");
          }}
        />
      )}
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => {
            setCancelTarget(null);
            invalidate();
            showToast("Turno cancelado", "ok");
          }}
        />
      )}
      {absentTarget && (
        <div className="modal-overlay" onClick={() => setAbsentTarget(null)}>
          <div
            className="modal"
            style={{ maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Marcar ausente</h2>
              <button
                className="modal-close"
                onClick={() => setAbsentTarget(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  color: "var(--color-cream)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                }}
              >
                ¿Marcar a <strong>{absentTarget.affiliateName}</strong> como
                ausente? El afiliado puede recibir una penalidad por
                inasistencia.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setAbsentTarget(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                disabled={absentMutation.isPending}
                onClick={() => absentMutation.mutate(absentTarget.id)}
              >
                {absentMutation.isPending
                  ? "Procesando..."
                  : "Confirmar ausencia"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => {}} />
      )}

      {detailAppt && (
        <AppointmentDetailPanel
          appt={detailAppt}
          role="SPECIALIST"
          onClose={() => setDetailAppt(null)}
          actions={
            <>
              {canAct(detailAppt) && (
                <>
                  <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setDetailAppt(null);
                      setCompleteTarget(detailAppt);
                    }}
                  >
                    Completar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setDetailAppt(null);
                      setAbsentTarget(detailAppt);
                    }}
                  >
                    Ausente
                  </button>
                </>
              )}
              {canCancel(detailAppt) && (
                <button
                  className="btn-icon danger"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDetailAppt(null);
                    setCancelTarget(detailAppt);
                  }}
                >
                  Cancelar
                </button>
              )}
              {canDerive(detailAppt) && (
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDetailAppt(null);
                    setDeriveTarget(detailAppt);
                  }}
                >
                  Derivar
                </button>
              )}
            </>
          }
        />
      )}
    </SpecialistLayout>
  );
}
