import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { usuario, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Gestao Escolar</div>
        <nav className="sidebar-nav">
          <NavLink to="/escolas" className={({ isActive }) => (isActive ? 'active' : '')}>
            Escolas
          </NavLink>
          <NavLink to="/professores" className={({ isActive }) => (isActive ? 'active' : '')}>
            Professores
          </NavLink>
          <NavLink to="/alunos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Alunos
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>{usuario?.nome}</span>
          <button onClick={logout} className="btn btn-ghost">
            Sair
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
