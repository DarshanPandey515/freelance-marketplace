import { Link } from 'react-router-dom'
import { formatDate, formatMoney, statusClass, statusLabel } from '../lib/format'

export default function ProjectCard({ project }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
          >
            {project.title}
          </Link>
          <p className="mt-1 text-sm text-gray-500">by {project.client_name}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-gray-600">{project.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {project.category}
        </span>
        <span>
          Budget: {formatMoney(project.budget_min)} – {formatMoney(project.budget_max)}
        </span>
        <span>Deadline: {formatDate(project.deadline)}</span>
        <span>{project.proposal_count} proposals</span>
      </div>
    </div>
  )
}