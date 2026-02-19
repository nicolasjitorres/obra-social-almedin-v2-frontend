import { type ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="adm-root">
      <Sidebar />
      <main className="adm-main">
        {children}
      </main>
    </div>
  )
}