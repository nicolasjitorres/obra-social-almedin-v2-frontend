import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'
import type { AuthResponse } from '../../types'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post<AuthResponse>('/auth/login', data)
      const { token, role, fullName, userId } = res.data
      setAuth({ userId, fullName, role, token }, token)
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'AFFILIATE') navigate('/affiliate/dashboard')
      else navigate('/specialist/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --ink: #0a0a0f;
          --ink-soft: #13131a;
          --cobalt: #1a3fcc;
          --gold: #c9a84c;
          --gold-light: #e2c77a;
          --cream: #f5f0e8;
          --muted: #6b6b7a;
          --border: rgba(201,168,76,0.15);
          --error: #ef4444;
        }

        .login-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--ink);
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* LEFT PANEL */
        .login-left {
          background: linear-gradient(135deg, #0d1530 0%, #0a0f1f 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .login-left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(26,63,204,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,63,204,0.06) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .login-left-orb {
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(26,63,204,0.15) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .login-left-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--cream);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          cursor: pointer;
        }

        .login-left-logo:hover { opacity: 0.8; }

        .logo-dot {
          width: 8px; height: 8px;
          background: var(--gold);
          border-radius: 50%;
        }

        .login-left-content {
          position: relative;
        }

        .login-left-tag {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }

        .login-left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: var(--cream);
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .login-left-title em {
          font-style: italic;
          color: var(--gold-light);
        }

        .login-left-desc {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.7;
          max-width: 320px;
        }

        .login-left-badges {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
          flex-wrap: wrap;
          position: relative;
        }

        .badge {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 0.4rem 0.9rem;
        }

        .login-left-footer {
          font-size: 0.7rem;
          color: var(--muted);
          opacity: 0.5;
          position: relative;
        }

        /* RIGHT PANEL */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--ink);
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 0.5rem;
        }

        .login-form-sub {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 2.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.6rem;
        }

        .form-input {
          width: 100%;
          background: var(--ink-soft);
          border: 1px solid rgba(201,168,76,0.2);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 0.85rem 1rem;
          outline: none;
          transition: border-color 0.3s ease;
          -webkit-appearance: none;
        }

        .form-input:focus {
          border-color: var(--gold);
        }

        .form-input::placeholder { color: var(--muted); opacity: 0.5; }

        .form-input.error-input { border-color: var(--error); }

        .form-error {
          font-size: 0.72rem;
          color: var(--error);
          margin-top: 0.4rem;
        }

        .form-submit {
          width: 100%;
          background: var(--gold);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .form-submit:hover:not(:disabled) {
          background: var(--gold-light);
          transform: translateY(-1px);
        }

        .form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          color: #fca5a5;
          margin-bottom: 1.5rem;
        }

        .login-divider {
          height: 1px;
          background: var(--border);
          margin: 2rem 0;
        }

        .login-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0;
        }

        .login-back:hover { color: var(--cream); }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(10,10,15,0.3);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 2rem; }
        }
      `}</style>

      {/* LEFT */}
      <div className="login-left">
        <div className="login-left-grid" />
        <div className="login-left-orb" />

        <div className="login-left-logo" onClick={() => navigate('/')}>
          <span className="logo-dot" />
          Almedin
        </div>

        <div className="login-left-content">
          <div className="login-left-tag">Acceso al sistema</div>
          <h2 className="login-left-title">
            Bienvenido de<br />
            vuelta al <em>sistema</em>
          </h2>
          <p className="login-left-desc">
            Gestioná turnos, especialistas y afiliados desde
            un único lugar. Seguro, rápido y siempre disponible.
          </p>
          <div className="login-left-badges">
            <span className="badge">Seguridad JWT</span>
            <span className="badge">Limite de peticiones</span>
            <span className="badge">Acceso basado en roles</span>
          </div>
        </div>

        <div className="login-left-footer">
          Obra Social Almedin © 2026
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-form-title">Iniciar sesión</h1>
          <p className="login-form-sub">Ingresá tus credenciales para continuar</p>

          {error && <div className="login-error-box">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="usuario@ejemplo.com"
                className={`form-input ${errors.email ? 'error-input' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? 'error-input' : ''}`}
                autoComplete="current-password"
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Verificando...</> : 'Acceder al sistema'}
            </button>
          </form>

          <div className="login-divider" />

          <button className="login-back" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}