import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AffiliateLayout from "../../components/layout/AffiliateLayout";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import Badge from "../../components/ui/Badge";
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

const cancelSchema = z.object({
  reason: z.string().min(1, "El motivo es requerido"),
});
type CancelForm = z.infer<typeof cancelSchema>;

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
      cancelledBy: "AFFILIATE",
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
          <button type="button" className="btn-secondary" onClick={onClose}>
            Volver
          </button>
          <button
            type="submit"
            form="cancel-form"
            className="btn-danger"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar cancelación"}
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
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            fontSize: "0.88rem",
            color: "var(--color-cream)",
            marginBottom: "0.2rem",
          }}
        >
          {appt.specialistName}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
          {appt.date} · {appt.startTime?.slice(0, 5)} ·{" "}
          {TYPE_LABELS[appt.type] ?? appt.type}
        </div>
      </div>

      <form id="cancel-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label">Motivo de cancelación</label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="Contanos por qué cancelás..."
            className={`form-input ${errors.reason ? "err" : ""}`}
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

export default function AffiliateAppointmentsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { toast, showToast } = useToast();
  const [filter, setFilter] = useState("UPCOMING");
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [detailAppt, setDetailAppt] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments", user?.userId],
    queryFn: () =>
      api
        .get(`/appointments/affiliate/${user?.userId}?page=0&size=200`)
        .then((r) => r.data),
    enabled: !!user?.userId,
  });

  const all: any[] = data?.content ?? [];
  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    let rows = [...all];
    if (filter === "UPCOMING")
      rows = rows.filter(
        (a) =>
          a.date >= today &&
          (a.status === "CONFIRMADA" || a.status === "PENDIENTE"),
      );
    else if (filter === "PAST")
      rows = rows.filter((a) => a.date < today || a.status === "COMPLETADA");
    else if (filter === "CANCELADA")
      rows = rows.filter(
        (a) => a.status === "CANCELADA" || a.status === "AUSENTE",
      );
    return rows.sort((a, b) => {
      const da = a.date + a.startTime,
        db = b.date + b.startTime;
      return filter === "PAST" ? db.localeCompare(da) : da.localeCompare(db);
    });
  }, [all, filter, today]);

  return (
    <AffiliateLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Mi historial</div>
        <h1 className="aff-header-title">Mis turnos</h1>
      </div>

      {/* Filtros */}
      <div className="filters-bars">
        <div className="status-chips">
          {[
            { key: "UPCOMING", label: "Próximos" },
            { key: "PAST", label: "Realizados" },
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
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.78rem",
            color: "var(--color-muted)",
          }}
        >
          {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="empty-state">Cargando turnos...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No hay turnos en esta categoría.</div>
      ) : (
        filtered.map((appt: any) => {
          const [year, month, day] = appt.date.split("-");
          const canCancel =
            (appt.status === "CONFIRMADA" || appt.status === "PENDIENTE") &&
            appt.date >= today;
          return (
            <div
              className="appt-card"
              key={appt.id}
              onClick={() => setDetailAppt(appt)}
              style={{ cursor: "pointer" }}
            >
              <div className="appt-date-box">
                <div className="appt-date-day">{day}</div>
                <div className="appt-date-month">
                  {MONTHS[parseInt(month) - 1]} {year}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="appt-info-name">{appt.specialistName}</div>
                <div className="appt-info-sub">
                  <span>
                    {appt.startTime?.slice(0, 5)} – {appt.endTime?.slice(0, 5)}
                  </span>
                  <span>{TYPE_LABELS[appt.type] ?? appt.type}</span>
                  {appt.clinicalNotes && (
                    <span
                      style={{ color: "var(--color-accent)", opacity: 0.8 }}
                    >
                      Con notas
                    </span>
                  )}
                </div>
                {appt.cancellationReason && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-muted)",
                      marginTop: "0.3rem",
                      fontStyle: "italic",
                    }}
                  >
                    Motivo: {appt.cancellationReason}
                  </div>
                )}
              </div>
              <div className="appt-actions">
                <Badge
                  variant={appt.status}
                  label={STATUS_LABELS[appt.status] ?? appt.status}
                />
                {canCancel && (
                  <button
                    className="btn-icon danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCancelTarget(appt);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["my-appointments"] });
            setCancelTarget(null);
            showToast("Turno cancelado correctamente", "ok");
          }}
        />
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => {}} />
      )}

      {detailAppt && (
        <AppointmentDetailPanel
          appt={detailAppt}
          role="AFFILIATE"
          onClose={() => setDetailAppt(null)}
          actions={
            (detailAppt.status === "CONFIRMADA" ||
              detailAppt.status === "PENDIENTE") &&
            detailAppt.date >= today ? (
              <button
                className="btn-icon danger"
                style={{ width: "100%" }}
                onClick={() => {
                  setDetailAppt(null);
                  setCancelTarget(detailAppt);
                }}
              >
                Cancelar turno
              </button>
            ) : null
          }
        />
      )}
    </AffiliateLayout>
  );
}
