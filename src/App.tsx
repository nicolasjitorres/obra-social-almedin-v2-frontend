import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import type { Role } from "./types";

// Pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AffiliatesPage from "./pages/admin/AffiliatesPage";
import SpecialistsPage from "./pages/admin/SpecialistsPage";
import AppointmentsPage from "./pages/admin/AppointmentsPage";
import SchedulesPage from "./pages/admin/SchedulesPage";
import PenaltiesPage from "./pages/admin/PenaltiesPage";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateAppointmentsPage from "./pages/affiliate/AffiliateAppointmentsPage";
import BookAppointmentPage from "./pages/affiliate/BookAppointmentPage";
import SpecialistProfilePage from "./pages/specialist/SpecialistProfilePage";
import SpecialistDashboard from "./pages/specialist/SpecialistDashboard";
import SpecialistSchedulesPage from "./pages/specialist/SpecialistSchedulesPage";
import SpecialistAgendaPage from "./pages/specialist/SpecialistAgendaPage";
import SpecialistPatientsPage from "./pages/specialist/SpecialistPatientsPage";
import AffiliateProfilePage from "./pages/affiliate/AffiliateProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/affiliates"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AffiliatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/specialists"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <SpecialistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedules"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <SchedulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/penalties"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <PenaltiesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/affiliate/dashboard"
            element={
              <ProtectedRoute roles={["AFFILIATE"]}>
                <AffiliateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/affiliate/appointments"
            element={
              <ProtectedRoute roles={["AFFILIATE"]}>
                <AffiliateAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/affiliate/book"
            element={
              <ProtectedRoute roles={["AFFILIATE"]}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/affiliate/profile"
            element={
              <ProtectedRoute roles={["AFFILIATE"]}>
                <AffiliateProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/specialist/dashboard"
            element={
              <ProtectedRoute roles={["SPECIALIST"]}>
                <SpecialistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialist/agenda"
            element={
              <ProtectedRoute roles={["SPECIALIST"]}>
                <SpecialistAgendaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialist/patients"
            element={
              <ProtectedRoute roles={["SPECIALIST"]}>
                <SpecialistPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialist/schedules"
            element={
              <ProtectedRoute roles={["SPECIALIST"]}>
                <SpecialistSchedulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialist/profile"
            element={
              <ProtectedRoute roles={["SPECIALIST"]}>
                <SpecialistProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
