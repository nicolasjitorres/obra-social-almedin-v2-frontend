import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const specialities = [
  'Cardiología', 'Neurología', 'Dermatología', 'Oncología',
  'Pediatría', 'Traumatología', 'Oftalmología', 'Urología',
]

const stats = [
  { value: '12+', label: 'Especialidades médicas' },
  { value: '98%', label: 'Satisfacción de pacientes' },
  { value: '24h', label: 'Gestión de turnos' },
  { value: '10k+', label: 'Consultas realizadas' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --ink: #0a0a0f;
          --ink-soft: #13131a;
          --cobalt: #1a3fcc;
          --cobalt-light: #2d55e8;
          --gold: #c9a84c;
          --gold-light: #e2c77a;
          --cream: #f5f0e8;
          --cream-soft: #ede8df;
          --muted: #6b6b7a;
          --border: rgba(201,168,76,0.15);
        }

        .landing-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--ink);
          color: var(--cream);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1.5rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(10,10,15,0.95), transparent);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(201,168,76,0.08);
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--cream);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-logo-dot {
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .nav-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cream);
          background: transparent;
          border: 1px solid var(--gold);
          padding: 0.6rem 1.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn:hover {
          background: var(--gold);
          color: var(--ink);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 4rem 4rem 4rem;
          position: relative;
          z-index: 2;
        }

        .hero-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 2rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease 0.1s;
        }

        .hero-label.visible { opacity: 1; transform: translateY(0); }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 5.5vw, 6rem);
          font-weight: 300;
          line-height: 1.05;
          color: var(--cream);
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.9s ease 0.2s;
        }

        .hero-title.visible { opacity: 1; transform: translateY(0); }

        .hero-title em {
          font-style: italic;
          color: var(--gold-light);
        }

        .hero-subtitle {
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.7;
          color: var(--muted);
          max-width: 420px;
          margin-bottom: 3rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease 0.35s;
        }

        .hero-subtitle.visible { opacity: 1; transform: translateY(0); }

        .hero-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease 0.5s;
        }

        .hero-actions.visible { opacity: 1; transform: translateY(0); }

        .btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          background: var(--gold);
          border: none;
          padding: 1rem 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold-light);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .btn-primary:hover::after { transform: translateX(0); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-secondary {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: var(--muted);
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }

        .btn-secondary:hover { color: var(--cream); }

        .btn-secondary::after {
          content: '→';
          transition: transform 0.3s ease;
        }

        .btn-secondary:hover::after { transform: translateX(4px); }

        /* HERO RIGHT */
        .hero-right {
          position: relative;
          overflow: hidden;
        }

        .hero-visual {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--ink-soft) 0%, #0d1530 50%, #0a0f1f 100%);
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(26,63,204,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,63,204,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        .hero-card {
          position: absolute;
          background: rgba(19,19,26,0.9);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          padding: 1.5rem;
          opacity: 0;
          transition: all 1s ease;
        }

        .hero-card.visible { opacity: 1; }

        .hero-card-1 {
          top: 20%;
          left: 10%;
          width: 220px;
          transition-delay: 0.6s;
          transform: translateY(20px);
        }
        .hero-card-1.visible { transform: translateY(0); }

        .hero-card-2 {
          top: 45%;
          right: 8%;
          width: 200px;
          transition-delay: 0.8s;
          transform: translateY(20px);
        }
        .hero-card-2.visible { transform: translateY(0); }

        .hero-card-3 {
          bottom: 20%;
          left: 15%;
          width: 240px;
          transition-delay: 1s;
          transform: translateY(20px);
        }
        .hero-card-3.visible { transform: translateY(0); }

        .card-label {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .card-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 400;
          color: var(--cream);
          line-height: 1.2;
        }

        .card-sub {
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 0.25rem;
        }

        .card-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.4rem;
          animation: pulse 2s infinite;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: rgba(26,63,204,0.15);
          top: -100px; right: -100px;
        }

        .orb-2 {
          width: 300px; height: 300px;
          background: rgba(201,168,76,0.08);
          bottom: 0; left: 0;
        }

        /* DIVIDER */
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          opacity: 0.3;
          margin: 0 4rem;
        }

        /* STATS */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 4rem;
          gap: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .stat-item {
          text-align: center;
          padding: 2rem;
          position: relative;
        }

        .stat-item::after {
          content: '';
          position: absolute;
          right: 0; top: 25%; bottom: 25%;
          width: 1px;
          background: var(--border);
        }

        .stat-item:last-child::after { display: none; }

        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 300;
          color: var(--gold-light);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: var(--muted);
          text-transform: uppercase;
        }

        /* SPECIALITIES */
        .specialities {
          padding: 6rem 4rem;
          position: relative;
        }

        .section-label {
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 3rem;
          max-width: 500px;
          line-height: 1.1;
        }

        .section-title em {
          font-style: italic;
          color: var(--gold-light);
        }

        .specialities-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .speciality-item {
          background: var(--ink);
          padding: 2rem 1.5rem;
          cursor: default;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .speciality-item::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--gold);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .speciality-item:hover {
          background: var(--ink-soft);
        }

        .speciality-item:hover::before { transform: scaleX(1); }

        .speciality-number {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: var(--gold);
          margin-bottom: 0.75rem;
          opacity: 0.6;
        }

        .speciality-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 400;
          color: var(--cream);
        }

        /* FEATURES */
        .features {
          padding: 6rem 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
          border-top: 1px solid var(--border);
        }

        .features-text {}

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-item {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .feature-item:last-child { border-bottom: none; }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(201,168,76,0.1);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--cream);
          margin-bottom: 0.4rem;
        }

        .feature-desc {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.6;
        }

        .features-visual {
          position: relative;
          height: 500px;
        }

        .features-card-main {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          background: var(--ink-soft);
          border: 1px solid var(--border);
          padding: 2rem;
        }

        .features-card-accent {
          position: absolute;
          top: 10%;
          right: 5%;
          width: 140px;
          background: rgba(26,63,204,0.15);
          border: 1px solid rgba(26,63,204,0.3);
          padding: 1.2rem;
        }

        .mini-label {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .mini-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: var(--cream);
        }

        .progress-bar {
          height: 2px;
          background: var(--border);
          margin-top: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(to right, var(--cobalt), var(--gold));
          width: 72%;
        }

        .avatar-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--ink);
        }

        /* CTA */
        .cta {
          padding: 8rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(to bottom, var(--ink), #0d1530, var(--ink));
        }

        .cta::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(26,63,204,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 5.5rem);
          font-weight: 300;
          line-height: 1.05;
          color: var(--cream);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .cta-title em { font-style: italic; color: var(--gold-light); }

        .cta-sub {
          font-size: 1rem;
          color: var(--muted);
          margin-bottom: 3rem;
          position: relative;
        }

        .cta-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          background: var(--gold);
          border: none;
          padding: 1.1rem 3rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .cta-btn:hover {
          background: var(--gold-light);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(201,168,76,0.2);
        }

        /* FOOTER */
        .footer {
          padding: 2rem 4rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          color: var(--muted);
        }

        .footer-text {
          font-size: 0.75rem;
          color: var(--muted);
          opacity: 0.6;
        }

        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .hero-left { padding: 8rem 2rem 4rem; }
          .stats { grid-template-columns: repeat(2, 1fr); padding: 3rem 2rem; }
          .specialities { padding: 4rem 2rem; }
          .specialities-grid { grid-template-columns: repeat(2, 1fr); }
          .features { grid-template-columns: 1fr; padding: 4rem 2rem; gap: 3rem; }
          .features-visual { display: none; }
          .nav { padding: 1.5rem 2rem; }
          .cta { padding: 5rem 2rem; }
          .footer { padding: 2rem; flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          Almedin
        </div>
        <button className="nav-btn" onClick={() => navigate('/login')}>
          Ingresar al sistema
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-left">
          <div className={`hero-label ${visible ? 'visible' : ''}`}>
            Sistema de gestión médica — v2.0
          </div>
          <h1 className={`hero-title ${visible ? 'visible' : ''}`}>
            Salud que se<br />
            gestiona con <em>precisión</em>
          </h1>
          <p className={`hero-subtitle ${visible ? 'visible' : ''}`}>
            Plataforma integral para la administración de turnos,
            especialistas y afiliados. Diseñada para la excelencia
            en la atención médica.
          </p>
          <div className={`hero-actions ${visible ? 'visible' : ''}`}>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              <span>Acceder al sistema</span>
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Conocer más
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual" />
          <div className="hero-grid" />
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />

          <div className={`hero-card hero-card-1 ${visible ? 'visible' : ''}`}>
            <div className="card-label">Próximo turno</div>
            <div className="card-value">10:30 AM</div>
            <div className="card-sub">Dr. García — Cardiología</div>
          </div>

          <div className={`hero-card hero-card-2 ${visible ? 'visible' : ''}`}>
            <div className="card-label">Estado del sistema</div>
            <div className="card-value" style={{ fontSize: '1rem' }}>
              <span className="card-dot" />
              Operativo
            </div>
            <div className="card-sub">Todos los servicios activos</div>
          </div>

          <div className={`hero-card hero-card-3 ${visible ? 'visible' : ''}`}>
            <div className="card-label">Turnos hoy</div>
            <div className="card-value">24</div>
            <div className="card-sub" style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#22c55e' }}>18 confirmados</span>
              <span>6 pendientes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* STATS */}
      <section className="stats">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* SPECIALITIES */}
      <section className="specialities">
        <div className="section-label">Cobertura médica</div>
        <h2 className="section-title">
          Todas las <em>especialidades</em><br />en un solo lugar
        </h2>
        <div className="specialities-grid">
          {specialities.map((s, i) => (
            <div className="speciality-item" key={s}>
              <div className="speciality-number">0{i + 1}</div>
              <div className="speciality-name">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="features-text">
          <div className="section-label">Plataforma completa</div>
          <h2 className="section-title">
            Todo lo que<br />necesitás para <em>gestionar</em>
          </h2>
          <div className="features-list">
            {[
              { icon: '⚡', title: 'Turnos en tiempo real', desc: 'Reservá, cancelá y reprogramá turnos con disponibilidad actualizada al instante.' },
              { icon: '🔐', title: 'Seguridad por roles', desc: 'Acceso diferenciado para administradores, afiliados y especialistas con JWT RS256.' },
              { icon: '📧', title: 'Recordatorios automáticos', desc: 'El sistema envía notificaciones 24 horas antes de cada turno programado.' },
            ].map((f) => (
              <div className="feature-item" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="features-visual">
          <div className="features-card-main">
            <div className="mini-label">Panel de administración</div>
            <div className="mini-value">Resumen del día</div>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Afiliados activos', val: '1,284', color: '#22c55e' },
                { label: 'Especialistas', val: '47', color: '#3b82f6' },
                { label: 'Turnos este mes', val: '386', color: '#c9a84c' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.9rem', color: item.color, fontFamily: 'Cormorant Garamond, serif' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--muted)' }}>72% capacidad utilizada</div>
            <div className="avatar-row">
              {['JG', 'MP', 'AL', 'RS'].map((a, i) => (
                <div className="avatar" key={a} style={{ background: ['#1a3fcc', '#c9a84c', '#22c55e', '#ef4444'][i] }}>{a}</div>
              ))}
              <div className="avatar" style={{ background: 'var(--ink-soft)', color: 'var(--muted)', border: '1px solid var(--border)' }}>+</div>
            </div>
          </div>

          <div className="features-card-accent">
            <div className="mini-label">Disponibilidad</div>
            <div className="mini-value" style={{ fontSize: '1.8rem', color: '#22c55e' }}>98%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Uptime del sistema</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2 className="cta-title">
          ¿Listo para una gestión<br />
          <em>más inteligente?</em>
        </h2>
        <p className="cta-sub">
          Accedé al sistema con tus credenciales y empezá a gestionar hoy.
        </p>
        <button className="cta-btn" onClick={() => navigate('/login')}>
          Ingresar al sistema
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Obra Social Almedin</div>
        <div className="footer-text">© 2026 — Sistema de gestión médica v2.0</div>
      </footer>
    </div>
  )
}
