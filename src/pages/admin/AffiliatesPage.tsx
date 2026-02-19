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
import Toast from "../../components/ui/Toast";
import Table from "../../components/ui/Table";
import { useToast } from "../../hooks/useToast";
import api from "../../lib/axios";
import SortIcon from "../../components/ui/SortIcon";

interface AffiliateResponse {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  healthInsuranceCode: string;
  role: string;
  active: boolean;
}

type SortKey =
  | "firstName"
  | "lastName"
  | "dni"
  | "email"
  | "healthInsuranceCode"
  | "active";
type SortDir = "asc" | "desc";

const schema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  dni: z.string().regex(/^\d{7,8}$/, "DNI debe tener 7 u 8 dígitos"),
  email: z.string().email("Email inválido"),
  healthInsuranceCode: z.string().min(1, "Requerido"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function AffiliateForm({
  affiliate,
  onClose,
  onSuccess,
}: {
  affiliate: AffiliateResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!affiliate;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: affiliate ? { ...affiliate, password: "" } : {},
  });

  const onSubmit = async (data: FormData) => {
    const body: any = { ...data };
    if (isEdit && !body.password) delete body.password;
    if (!isEdit && !body.password) body.password = "Temporal1234!";
    isEdit
      ? await api.put(`/affiliates/${affiliate!.id}`, body)
      : await api.post("/affiliates", body);
    qc.invalidateQueries({ queryKey: ["affiliates"] });
    onSuccess();
  };

  return (
    <Modal
      title={isEdit ? "Editar afiliado" : "Nuevo afiliado"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            form="affiliate-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear afiliado"}
          </button>
        </>
      }
    >
      <form id="affiliate-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <label className="form-label">Código obra social</label>
            <input
              {...register("healthInsuranceCode")}
              className={`form-input ${errors.healthInsuranceCode ? "err" : ""}`}
            />
            {errors.healthInsuranceCode && (
              <p className="form-error">{errors.healthInsuranceCode.message}</p>
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

export default function AffiliatesPage() {
  const qc = useQueryClient();
  const { toast, showToast } = useToast();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AffiliateResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AffiliateResponse | null>(
    null,
  );
  const [showInactive, setShowInactive] = useState(false);

  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["affiliates", showInactive],
    queryFn: () =>
      api
        .get(`/affiliates?page=0&size=200&includeInactive=${showInactive}`)
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/affiliates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
      showToast("Afiliado dado de baja correctamente", "ok");
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

  const allAffiliates: AffiliateResponse[] = data?.content ?? [];

  const filtered = allAffiliates
    .filter((a) => {
      const q = search.toLowerCase();
      return (
        !q ||
        `${a.firstName} ${a.lastName} ${a.dni} ${a.email}`
          .toLowerCase()
          .includes(q)
      );
    })
    .sort((a, b) => {
      const va = String(a[sortKey] ?? "");
      const vb = String(b[sortKey] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (a: AffiliateResponse) => {
    setEditTarget(a);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Gestión</div>
          <h1 className="adm-header-title">Afiliados</h1>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo afiliado
        </button>
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div className="adm-section-title">
            {filtered.length} afiliado{filtered.length !== 1 ? "s" : ""}
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
          rowKey={(a) => a.id}
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
              render: (a) => `${a.firstName} ${a.lastName}`,
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
              render: (a) => <span className="td-muted">{a.dni}</span>,
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
              render: (a) => <span className="td-muted">{a.email}</span>,
            },
            {
              key: "codigo",
              header: (
                <span
                  onClick={() => handleSort("healthInsuranceCode")}
                  style={{ cursor: "pointer" }}
                >
                  Código OS{" "}
                  <SortIcon
                    col="healthInsuranceCode"
                    sortKey={sortKey}
                    sortDir={sortDir}
                  />
                </span>
              ),
              render: (a) => (
                <span className="td-muted">{a.healthInsuranceCode}</span>
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
              render: (a) => (
                <Badge
                  variant={a.active ? "active" : "inactive"}
                  label={a.active ? "Activo" : "Inactivo"}
                />
              ),
            },
            {
              key: "acciones",
              header: "Acciones",
              render: (a) => (
                <div className="action-btns">
                  <button className="btn-icon" onClick={() => openEdit(a)}>
                    Editar
                  </button>
                  {a.active && (
                    <button
                      className="btn-icon danger"
                      onClick={() => setDeleteTarget(a)}
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
        <AffiliateForm
          affiliate={editTarget}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            showToast(
              editTarget ? "Afiliado actualizado" : "Afiliado creado",
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
