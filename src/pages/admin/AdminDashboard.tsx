import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/layout/AdminLayout";
import Badge from "../../components/ui/Badge";
import api from "../../lib/axios";
import Table from "../../components/ui/Table";
import SortIcon from "../../components/ui/SortIcon";

interface DashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalSpecialists: number;
  activeSpecialists: number;
  appointmentsToday: number;
  appointmentsThisMonth: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

interface AppointmentRow {
  id: number;
  date: string;
  startTime: string;
  status: string;
  type: string;
  affiliateResponse: { firstName: string; lastName: string };
  specialistResponse: {
    firstName: string;
    lastName: string;
    speciality: string;
  };
}

type SortKey = "date" | "status" | "type" | "affiliate" | "specialist";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  AUSENTE: "Ausente",
};

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data),
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["appointments-all"],
    queryFn: () => api.get("/appointments?page=0&size=200").then((r) => r.data),
  });

  const allAppointments: AppointmentRow[] = appointmentsData?.content ?? [];

  const filtered = useMemo(() => {
    let rows = [...allAppointments];
    if (statusFilter !== "ALL")
      rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          `${r.affiliateResponse?.firstName} ${r.affiliateResponse?.lastName}`
            .toLowerCase()
            .includes(q) ||
          `${r.specialistResponse?.firstName} ${r.specialistResponse?.lastName}`
            .toLowerCase()
            .includes(q),
      );
    }
    rows.sort((a, b) => {
      let va = "",
        vb = "";
      if (sortKey === "date") {
        va = a.date + a.startTime;
        vb = b.date + b.startTime;
      }
      if (sortKey === "status") {
        va = a.status;
        vb = b.status;
      }
      if (sortKey === "type") {
        va = a.type;
        vb = b.type;
      }
      if (sortKey === "affiliate") {
        va = a.affiliateResponse?.lastName ?? "";
        vb = b.affiliateResponse?.lastName ?? "";
      }
      if (sortKey === "specialist") {
        va = a.specialistResponse?.lastName ?? "";
        vb = b.specialistResponse?.lastName ?? "";
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [allAppointments, statusFilter, search, sortKey, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Panel de control</div>
          <h1 className="adm-header-title">Dashboard</h1>
        </div>
      </div>

      {/* Metrics */}
      <div className="adm-metrics">
        <div className="metric-card">
          <div className="metric-label">Afiliados activos</div>
          <div className="metric-value">{stats?.activeAffiliates ?? "—"}</div>
          <div className="metric-sub">
            de{" "}
            <span className="metric-accent">
              {stats?.totalAffiliates ?? "—"}
            </span>{" "}
            registrados
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Especialistas activos</div>
          <div className="metric-value">{stats?.activeSpecialists ?? "—"}</div>
          <div className="metric-sub">
            de{" "}
            <span className="metric-accent">
              {stats?.totalSpecialists ?? "—"}
            </span>{" "}
            registrados
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Turnos hoy</div>
          <div className="metric-value">{stats?.appointmentsToday ?? "—"}</div>
          <div className="metric-sub">
            <span className="metric-accent">
              {stats?.appointmentsThisMonth ?? "—"}
            </span>{" "}
            este mes
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pendientes</div>
          <div className="metric-value" style={{ color: "var(--accent)" }}>
            {stats?.pendingAppointments ?? "—"}
          </div>
          <div className="metric-sub">
            <span style={{ color: "#22c55e" }}>
              {stats?.completedAppointments ?? 0} completados
            </span>
            {" · "}
            <span style={{ color: "#ef4444" }}>
              {stats?.cancelledAppointments ?? 0} cancelados
            </span>
          </div>
        </div>
      </div>

      <Table
        rowKey={(appt) => appt.id}
        isLoading={false}
        data={paginated}
        columns={[
          {
            key: "date",
            header: (
              <span
                onClick={() => handleSort("date")}
                style={{ cursor: "pointer" }}
              >
                Fecha / Hora{" "}
                <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} />
              </span>
            ),
            render: (appt) => (
              <>
                <div>{appt.date}</div>
                <div className="td-muted">{appt.startTime?.slice(0, 5)}</div>
              </>
            ),
          },
          {
            key: "affiliate",
            header: (
              <span
                onClick={() => handleSort("affiliate")}
                style={{ cursor: "pointer" }}
              >
                Afiliado{" "}
                <SortIcon col="affiliate" sortKey={sortKey} sortDir={sortDir} />
              </span>
            ),
            render: (appt) =>
              appt.affiliateResponse ? (
                `${appt.affiliateResponse.firstName} ${appt.affiliateResponse.lastName}`
              ) : (
                <span className="td-muted">—</span>
              ),
          },
          {
            key: "specialist",
            header: (
              <span
                onClick={() => handleSort("specialist")}
                style={{ cursor: "pointer" }}
              >
                Especialista{" "}
                <SortIcon
                  col="specialist"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </span>
            ),
            render: (appt) => (
              <>
                <div>
                  {appt.specialistResponse ? (
                    `${appt.specialistResponse.firstName} ${appt.specialistResponse.lastName}`
                  ) : (
                    <span className="td-muted">—</span>
                  )}
                </div>
                <div className="td-muted">
                  {appt.specialistResponse?.speciality}
                </div>
              </>
            ),
          },
          {
            key: "type",
            header: (
              <span
                onClick={() => handleSort("type")}
                style={{ cursor: "pointer" }}
              >
                Tipo <SortIcon col="type" sortKey={sortKey} sortDir={sortDir} />
              </span>
            ),
            render: (appt) => <span className="td-muted">{appt.type}</span>,
          },
          {
            key: "status",
            header: (
              <span
                onClick={() => handleSort("status")}
                style={{ cursor: "pointer" }}
              >
                Estado{" "}
                <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </span>
            ),
            render: (appt) => (
              <Badge
                variant={appt.status}
                label={STATUS_LABELS[appt.status] ?? appt.status}
              />
            ),
          },
        ]}
      />
    </AdminLayout>
  );
}
