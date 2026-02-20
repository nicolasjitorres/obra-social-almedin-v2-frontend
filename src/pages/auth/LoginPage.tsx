import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import type { AuthResponse } from "../../types";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Logo from "../../components/ui/Logo";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (user.role === "AFFILIATE") navigate("/affiliate/dashboard");
      else navigate("/specialist/dashboard");
    }
  }, [token, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      const { token, role, fullName, userId } = res.data;
      setAuth({ userId, fullName, role, token }, token);
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "AFFILIATE") navigate("/affiliate/dashboard");
      else navigate("/specialist/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
        }}
      >
        <ThemeToggle />
      </div>
      <div className="login-root">
        {/* LEFT */}
        <div className="login-left">
          <div className="login-left-grid" />
          <div className="login-left-orb" />
          <Logo size="sm" onClick={() => navigate("/")} />
          <div className="login-left-content">
            <div className="login-left-tag">Acceso al sistema</div>
            <h2 className="login-left-title">
              Bienvenido de
              <br />
              vuelta al <em>sistema</em>
            </h2>
            <p className="login-left-desc">
              Gestioná turnos, especialistas y afiliados desde un único lugar.
              Seguro, rápido y siempre disponible.
            </p>
            <div className="login-left-badges">
              <span className="login-badge">Seguridad JWT</span>
              <span className="login-badge">Rate limiting</span>
              <span className="login-badge">Acceso por roles</span>
            </div>
          </div>

          <div className="login-left-footer">
            <span>Obra Social Almedin © 2026</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <h1 className="login-form-title">Iniciar sesión</h1>
            <p className="login-form-sub">
              Ingresá tus credenciales para continuar
            </p>

            {error && <div className="login-error-box">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  className={`form-input ${errors.email ? "err" : ""}`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`form-input ${errors.password ? "err" : ""}`}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" /> Verificando...
                  </>
                ) : (
                  "Acceder al sistema"
                )}
              </button>
            </form>

            <div className="login-divider" />
            <button className="login-back" onClick={() => navigate("/")}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
