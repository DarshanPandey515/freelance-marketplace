import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
  }`

export default function Layout() {
  const { user, logout } = useAuth()

  const navItems =
    user.role === 'client'
      ? [
          { to: '/my-projects', label: 'My Projects' },
          { to: '/projects/new', label: 'Create Project' },
          { to: '/projects', label: 'Browse Projects' },
          { to: '/contracts', label: 'Contracts' },
        ]
      : [
          { to: '/projects', label: 'Browse Projects' },
          { to: '/my-proposals', label: 'My Proposals' },
          { to: '/contracts', label: 'Contracts' },
        ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            Freelance Marketplace
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}