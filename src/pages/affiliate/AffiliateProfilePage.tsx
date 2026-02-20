import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AffiliateLayout from '../../components/layout/AffiliateLayout'
import Toast from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:  z.string().min(2, 'Mínimo 2 caracteres'),
  email:     z.string().email('Email inválido'),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword:     z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Requerido'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
})
type PasswordForm = z.infer<typeof passwordSchema>

export default function AffiliateProfilePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { toast, showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['affiliate-profile', user?.userId],
    queryFn: () => api.get(`/affiliates/${user?.userId}`).then(r => r.data),
    enabled: !!user?.userId,
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName,
      lastName:  profile.lastName,
      email:     profile.email,
    } : undefined,
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      api.patch(`/affiliates/${user?.userId}/profile`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['affiliate-profile'] })
      showToast('Perfil actualizado correctamente', 'ok')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? 'Error al actualizar', 'err'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      api.patch(`/affiliates/${user?.userId}/password`, {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      }),
    onSuccess: () => {
      passwordForm.reset()
      showToast('Contraseña actualizada correctamente', 'ok')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? 'Contraseña actual incorrecta', 'err'),
  })

  const tabs = [
    { key: 'profile',  label: 'Datos personales' },
    { key: 'password', label: 'Contraseña' },
  ] as const

  return (
    <AffiliateLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Cuenta</div>
        <h1 className="aff-header-title">Mi perfil</h1>
      </div>

      <div style={{ maxWidth: 560 }}>

        {/* Chip de info — solo lectura */}
        {profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem',
            padding: '1rem 1.25rem', background: 'var(--color-bg-soft)',
            border: '1px solid var(--color-border)', marginBottom: '1.5rem',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--color-accent-soft)',
              border: '1px solid var(--color-border-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              color: 'var(--color-accent)', flexShrink: 0,
            }}>
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-cream)', fontWeight: 500 }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                DNI {profile.dni} · Código OS: {profile.healthInsuranceCode}
              </div>
            </div>
            <div style={{
              fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.3rem 0.75rem', border: '1px solid var(--color-success-border)',
              color: 'var(--color-success-text)', background: 'var(--color-success-soft)',
            }}>
              {profile.active ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '0.75rem 1.25rem', background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-muted)',
              fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Datos personales */}
        {activeTab === 'profile' && (
          <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  {...profileForm.register('firstName')}
                  className={`form-input ${profileForm.formState.errors.firstName ? 'err' : ''}`}
                />
                {profileForm.formState.errors.firstName && (
                  <p className="form-error">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  {...profileForm.register('lastName')}
                  className={`form-input ${profileForm.formState.errors.lastName ? 'err' : ''}`}
                />
                {profileForm.formState.errors.lastName && (
                  <p className="form-error">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                {...profileForm.register('email')}
                type="email"
                className={`form-input ${profileForm.formState.errors.email ? 'err' : ''}`}
              />
              {profileForm.formState.errors.email && (
                <p className="form-error">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Campos de solo lectura */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">DNI</label>
                <input value={profile?.dni ?? ''} className="form-input" readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Código obra social</label>
                <input value={profile?.healthInsuranceCode ?? ''} className="form-input" readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={profileMutation.isPending || isLoading}
              >
                {profileMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Contraseña */}
        {activeTab === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(d => passwordMutation.mutate(d))} noValidate>
            <div className="form-group">
              <label className="form-label">Contraseña actual</label>
              <input
                {...passwordForm.register('currentPassword')}
                type="password"
                placeholder="••••••••"
                className={`form-input ${passwordForm.formState.errors.currentPassword ? 'err' : ''}`}
                autoComplete="current-password"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="form-error">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                placeholder="Mínimo 6 caracteres"
                className={`form-input ${passwordForm.formState.errors.newPassword ? 'err' : ''}`}
                autoComplete="new-password"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="form-error">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar nueva contraseña</label>
              <input
                {...passwordForm.register('confirmPassword')}
                type="password"
                placeholder="Repetí la nueva contraseña"
                className={`form-input ${passwordForm.formState.errors.confirmPassword ? 'err' : ''}`}
                autoComplete="new-password"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="form-error">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => {}} />}
    </AffiliateLayout>
  )
}