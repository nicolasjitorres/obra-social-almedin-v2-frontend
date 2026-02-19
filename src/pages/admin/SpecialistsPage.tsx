import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import SortIcon from "../../components/ui/SortIcon";
import Table from "../../components/ui/Table";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import api from "../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SpecialistResponse {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  speciality: string;
  address: string;
  role: string;
  active: boolean;
}

type SortKey =
  | "lastName"
  | "firstName"
  | "dni"
  | "email"
  | "speciality"
  | "active";
type SortDir = "asc" | "desc";

const SPECIALITIES = [
  "CARDIOLOGIA",
  "DERMATOLOGIA",
  "ENDOCRINOLOGIA",
  "ONCOLOGIA",
  "ORTOPEDIA",
  "UROLOGIA",
  "ODONTOLOGIA",
  "NEUROLOGIA",
  "HEMATOLOGIA",
  "MEDICINA_GENERAL",
];

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
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  dni: z.string().regex(/^\d{7,8}$/, "DNI debe tener 7 u 8 dígitos"),
  email: z.string().email("Email inválido"),
  speciality: z.string().min(1, "Requerido"),
  address: z.string().optional(),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

// ─── Form Modal ───────────────────────────────────────────────────────────────
function SpecialistForm({
  specialist,
  onClose,
  onSuccess,
}: {
  specialist: SpecialistResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!specialist;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: specialist ? { ...specialist, password: "" } : {},
  });

  const onSubmit = async (data: FormData) => {
    const body: any = { ...data };
    if (isEdit && !body.password) delete body.password;
    if (!isEdit && !body.password) body.password = "Temporal1234!";
    isEdit
      ? await api.put(`/specialists/${specialist!.id}`, body)
      : await api.post("/specialists", body);
    qc.invalidateQueries({ queryKey: ["specialists"] });
    onSuccess();
  };

  return (
    <Modal
      title={isEdit ? "Editar especialista" : "Nuevo especialista"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            form="specialist-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear especialista"}
          </button>
        </>
      }
    >
      <form id="specialist-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              {...register("firstName")}
              className={`form-input ${errors.firstName ? "err" : ""}`}
            />
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              {...register("lastName")}
              className={`form-input ${errors.lastName ? "err" : ""}`}
            />
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">DNI</label>
            <input
              {...register("dni")}
              className={`form-input ${errors.dni ? "err" : ""}`}
            />
            {errors.dni && <p className="form-error">{errors.dni.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Especialidad</label>
            <select
              {...register("speciality")}
              className={`form-select ${errors.speciality ? "err" : ""}`}
            >
              <option value="">Seleccionar...</option>
              {SPECIALITIES.map((s) => (
                <option key={s} value={s}>
                  {SPECIALITY_LABELS[s]}
                </option>
              ))}
            </select>
            {errors.speciality && (
              <p className="form-error">{errors.speciality.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            {...register("email")}
            type="email"
            className={`form-input ${errors.email ? "err" : ""}`}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            {...register("address")}
            className="form-input"
            placeholder="Av. Corrientes 1234, Buenos Aires"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder={isEdit ? "Dejar vacío para no cambiar" : "••••••••"}
            className={`form-input ${errors.password ? "err" : ""}`}
          />
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpecialistsPage() {
  const qc = useQueryClient();
  const { toast, showToast } = useToast();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SpecialistResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpecialistResponse | null>(
    null,
  );
  const [showInactive, setShowInactive] = useState(false);

  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["specialists", showInactive],
    queryFn: () =>
      api
        .get(`/specialists?page=0&size=200&includeInactive=${showInactive}`)
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/specialists/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specialists"] });
      showToast("Especialista dado de baja correctamente", "ok");
      setDeleteTarget(null);
    },
    onError: () => showToast("Error al dar de baja", "err"),
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (s: SpecialistResponse) => {
    setEditTarget(s);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const allSpecialists: SpecialistResponse[] = data?.content ?? [];

  const filtered = allSpecialists
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        `${s.firstName} ${s.lastName} ${s.dni} ${s.email}`
          .toLowerCase()
          .includes(q);
      const matchSpeciality =
        specialityFilter === "ALL" || s.speciality === specialityFilter;
      return matchSearch && matchSpeciality;
    })
    .sort((a, b) => {
      const va = String(a[sortKey] ?? "");
      const vb = String(b[sortKey] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Gestión</div>
          <h1 className="adm-header-title">Especialistas</h1>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo especialista
        </button>
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div className="adm-section-title">
            {filtered.length} especialista{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="adm-controls">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(0);
              }}
              placeholder="Buscar por nombre, DNI o email..."
            />
            <select
              className="form-select"
              style={{ width: 180 }}
              value={specialityFilter}
              onChange={(e) => {
                setSpecialityFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">Todas las especialidades</option>
              {SPECIALITIES.map((s) => (
                <option key={s} value={s}>
                  {SPECIALITY_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="status-chips">
            <button
              className={`chip ${!showInactive ? "active" : ""}`}
              onClick={() => setShowInactive(false)}
            >
              Solo activos
            </button>
            <button
              className={`chip ${showInactive ? "active" : ""}`}
              onClick={() => setShowInactive(true)}
            >
              Todos
            </button>
          </div>
        </div>

        <Table
          rowKey={(s) => s.id}
          isLoading={isLoading}
          data={paginated}
          columns={[
            {
              key: "nombre",
              header: (
                <span
                  onClick={() => handleSort("lastName")}
                  style={{ cursor: "pointer" }}
                >
                  Nombre{" "}
                  <SortIcon
                    col="lastName"
                    sortKey={sortKey}
                    sortDir={sortDir}
                  />
                </span>
              ),
              render: (s) => `${s.firstName} ${s.lastName}`,
            },
            {
              key: "speciality",
              header: (
                <span
                  onClick={() => handleSort("speciality")}
                  style={{ cursor: "pointer" }}
                >
                  Especialidad{" "}
                  <SortIcon
                    col="speciality"
                    sortKey={sortKey}
                    sortDir={sortDir}
                  />
                </span>
              ),
              render: (s) => (
                <span className="td-muted">
                  {SPECIALITY_LABELS[s.speciality] ?? s.speciality}
                </span>
              ),
            },
            {
              key: "dni",
              header: (
                <span
                  onClick={() => handleSort("dni")}
                  style={{ cursor: "pointer" }}
                >
                  DNI <SortIcon col="dni" sortKey={sortKey} sortDir={sortDir} />
                </span>
              ),
              render: (s) => <span className="td-muted">{s.dni}</span>,
            },
            {
              key: "email",
              header: (
                <span
                  onClick={() => handleSort("email")}
                  style={{ cursor: "pointer" }}
                >
                  Email{" "}
                  <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
                </span>
              ),
              render: (s) => <span className="td-muted">{s.email}</span>,
            },
            {
              key: "address",
              header: "Dirección",
              render: (s) => (
                <span className="td-muted">{s.address ?? "—"}</span>
              ),
            },
            {
              key: "estado",
              header: (
                <span
                  onClick={() => handleSort("active")}
                  style={{ cursor: "pointer" }}
                >
                  Estado{" "}
                  <SortIcon col="active" sortKey={sortKey} sortDir={sortDir} />
                </span>
              ),
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
                      Dar de baja
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />

        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {modalOpen && (
        <SpecialistForm
          specialist={editTarget}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            showToast(
              editTarget ? "Especialista actualizado" : "Especialista creado",
              "ok",
            );
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Confirmar baja"
          message={`¿Dar de baja a ${deleteTarget.firstName} ${deleteTarget.lastName}? Esta acción desactivará su cuenta.`}
          confirmLabel="Dar de baja"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => {}} />
      )}
    </AdminLayout>
  );
}
