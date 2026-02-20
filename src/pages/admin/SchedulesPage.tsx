import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import api from "../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SpecialistOption {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  speciality: string;
  active: boolean;
}

interface ScheduleResponse {
  id: number;
  specialistId: number;
  specialistName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  active: boolean;
}

const DAYS_OF_WEEK = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];
const DAY_LABELS: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};
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

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = z.object({
  dayOfWeek: z.string().min(1, "Requerido"),
  startTime: z.string().min(1, "Requerido"),
  endTime: z.string().min(1, "Requerido"),
  slotDuration: z.coerce
    .number()
    .min(10, "Mínimo 10 minutos")
    .max(120, "Máximo 120 minutos"),
});
type FormData = z.infer<typeof schema>;

// ─── Schedule Form Modal ──────────────────────────────────────────────────────
function ScheduleForm({
  schedule,
  specialistId,
  onClose,
  onSuccess,
}: {
  schedule: ScheduleResponse | null;
  specialistId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!schedule;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: schedule
      ? {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime?.slice(0, 5),
          endTime: schedule.endTime?.slice(0, 5),
          slotDuration: schedule.slotDuration,
        }
      : { slotDuration: 30 },
  });

  const onSubmit = async (data: FormData) => {
    const body = {
      specialistId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime + ":00",
      endTime: data.endTime + ":00",
      slotDuration: data.slotDuration,
    };
    isEdit
      ? await api.put(`/schedules/${schedule!.id}`, body)
      : await api.post("/schedules", body);
    qc.invalidateQueries({ queryKey: ["schedules", specialistId] });
    onSuccess();
  };

  return (
    <Modal
      title={isEdit ? "Editar horario" : "Nuevo horario"}
      onClose={onClose}
      maxWidth={480}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            form="schedule-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear horario"}
          </button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label">Día de la semana</label>
          <select
            {...register("dayOfWeek")}
            className={`form-select ${errors.dayOfWeek ? "err" : ""}`}
          >
            <option value="">Seleccionar...</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d]}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <p className="form-error">{errors.dayOfWeek.message}</p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora inicio</label>
            <input
              {...register("startTime")}
              type="time"
              className={`form-input ${errors.startTime ? "err" : ""}`}
            />
            {errors.startTime && (
              <p className="form-error">{errors.startTime.message}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin</label>
            <input
              {...register("endTime")}
              type="time"
              className={`form-input ${errors.endTime ? "err" : ""}`}
            />
            {errors.endTime && (
              <p className="form-error">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Duración del slot (minutos)</label>
          <select
            {...register("slotDuration")}
            className={`form-select ${errors.slotDuration ? "err" : ""}`}
          >
            {[10, 15, 20, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          {errors.slotDuration && (
            <p className="form-error">{errors.slotDuration.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SchedulesPage() {
  const qc = useQueryClient();
  const { toast, showToast } = useToast();

  const [selectedSpecialistId, setSelectedSpecialistId] = useState<
    number | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleResponse | null>(
    null,
  );
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Cargar lista de especialistas para el selector
  const { data: specialistsData } = useQuery({
    queryKey: ["specialists"],
    queryFn: () => api.get("/specialists?page=0&size=200").then((r) => r.data),
  });
  const specialists: SpecialistOption[] = specialistsData?.content ?? [];

  const filteredSpecialists = specialists.filter(
    (s: SpecialistOption & { active: boolean }) => {
      if (!s.active) return false;
      const q = specialistSearch.toLowerCase();
      if (!q) return true;
      return (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.dni?.toLowerCase().includes(q) ||
        s.speciality?.toLowerCase().includes(q)
      );
    },
  );

  // Cargar horarios del especialista seleccionado
  const { data: schedules, isLoading } = useQuery<ScheduleResponse[]>({
    queryKey: ["schedules", selectedSpecialistId],
    queryFn: () =>
      api
        .get(`/schedules/specialist/${selectedSpecialistId}`)
        .then((r) => r.data),
    enabled: !!selectedSpecialistId,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/schedules/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules", selectedSpecialistId] });
      showToast("Horario desactivado", "ok");
      setDeleteTarget(null);
    },
    onError: () => showToast("Error al desactivar", "err"),
  });

  const selectedSpecialist = specialists.find(
    (s) => s.id === selectedSpecialistId,
  );

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (s: ScheduleResponse) => {
    setEditTarget(s);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  // Ordenar por día de la semana
  const sortedSchedules = [...(schedules ?? [])].sort(
    (a, b) =>
      DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek),
  );

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Gestión</div>
          <h1 className="adm-header-title">Horarios</h1>
        </div>
        {selectedSpecialistId && (
          <button className="btn-primary" onClick={openCreate}>
            + Nuevo horario
          </button>
        )}
      </div>

      {/* Selector de especialista */}
      <div
        className="adm-section"
        style={{ marginBottom: "1.5rem", padding: "1.25rem 1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Especialista
          </div>

          <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
            {/* Input de búsqueda */}
            <input
              className="adm-search"
              style={{ width: "100%" }}
              placeholder="Buscar por nombre, DNI o especialidad..."
              value={specialistSearch}
              onChange={(e) => {
                setSpecialistSearch(e.target.value);
                setSelectorOpen(true);
              }}
              onFocus={() => setSelectorOpen(true)}
              onBlur={() => setTimeout(() => setSelectorOpen(false), 150)}
            />

            {/* Dropdown */}
            {selectorOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: "var(--color-accent-soft)",
                  border: "1px solid var(--color-border)",
                  borderTop: "none",
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {filteredSpecialists.length === 0 ? (
                  <div
                    style={{
                      padding: "0.85rem 1rem",
                      color: "var(--color-muted)",
                      fontSize: "0.82rem",
                      fontStyle: "italic",
                    }}
                  >
                    Sin resultados
                  </div>
                ) : (
                  filteredSpecialists.map((s) => (
                    <div
                      key={s.id}
                      onMouseDown={() => {
                        setSelectedSpecialistId(s.id);
                        setSpecialistSearch(`${s.firstName} ${s.lastName}`);
                        setSelectorOpen(false);
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.83rem",
                        color:
                          selectedSpecialistId === s.id
                            ? "var(--accent)"
                            : "var(--color-cream)",
                        background:
                          selectedSpecialistId === s.id
                            ? "rgba(201,168,76,0.07)"
                            : "transparent",
                        borderBottom: "1px solid rgba(201,168,76,0.05)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(201,168,76,0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          selectedSpecialistId === s.id
                            ? "rgba(201,168,76,0.07)"
                            : "transparent")
                      }
                    >
                      <div>
                        {s.firstName} {s.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--color-muted)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {SPECIALITY_LABELS[s.speciality] ?? s.speciality} · DNI{" "}
                        {s.dni}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Chip del especialista seleccionado */}
          {selectedSpecialist && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>
                {sortedSchedules.length} horario
                {sortedSchedules.length !== 1 ? "s" : ""}
              </span>
              <button
                className="btn-icon danger"
                onClick={() => {
                  setSelectedSpecialistId(null);
                  setSpecialistSearch("");
                }}
              >
                ✕ Limpiar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de horarios */}
      {!selectedSpecialistId ? (
        <div
          style={{
            background: "var(--color-accent-soft)",
            border: "1px solid var(--color-border)",
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-muted)",
            fontStyle: "italic",
            fontSize: "0.88rem",
          }}
        >
          Seleccioná un especialista para ver sus horarios
        </div>
      ) : (
        <div className="adm-section">
          <div className="adm-section-header">
            <div className="adm-section-title">
              Horarios de {selectedSpecialist?.firstName}{" "}
              {selectedSpecialist?.lastName}
            </div>
          </div>

          <Table
            rowKey={(s) => s.id}
            isLoading={isLoading}
            data={sortedSchedules}
            columns={[
              {
                key: "day",
                header: "Día",
                render: (s) => DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek,
              },
              {
                key: "hours",
                header: "Horario",
                render: (s) => (
                  <>
                    <div>
                      {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}
                    </div>
                    <div className="td-muted">
                      {(() => {
                        const [sh, sm] = s.startTime.split(":").map(Number);
                        const [eh, em] = s.endTime.split(":").map(Number);
                        const totalMin = eh * 60 + em - (sh * 60 + sm);
                        const slots = Math.floor(totalMin / s.slotDuration);
                        return `${totalMin} min totales · ${slots} turnos`;
                      })()}
                    </div>
                  </>
                ),
              },
              {
                key: "slot",
                header: "Duración slot",
                render: (s) => (
                  <span className="td-muted">{s.slotDuration} min</span>
                ),
              },
              {
                key: "estado",
                header: "Estado",
                render: (s) => (
                  <Badge
                    variant={s.active ? "active" : "inactive"}
                    label={s.active ? "Activo" : "Inactivo"}
                  />
                ),
              },
              {
                key: "acciones",
                header: "Acciones",
                render: (s) => (
                  <div className="action-btns">
                    <button className="btn-icon" onClick={() => openEdit(s)}>
                      Editar
                    </button>
                    {s.active && (
                      <button
                        className="btn-icon danger"
                        onClick={() => setDeleteTarget(s)}
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {modalOpen && selectedSpecialistId && (
        <ScheduleForm
          schedule={editTarget}
          specialistId={selectedSpecialistId}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            showToast(
              editTarget ? "Horario actualizado" : "Horario creado",
              "ok",
            );
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Desactivar horario"
          message={`¿Desactivar el horario del ${DAY_LABELS[deleteTarget.dayOfWeek]} (${deleteTarget.startTime?.slice(0, 5)} – ${deleteTarget.endTime?.slice(0, 5)})?`}
          confirmLabel="Desactivar"
          onConfirm={() => deactivateMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => {}} />
      )}
    </AdminLayout>
  );
}
