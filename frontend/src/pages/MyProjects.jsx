import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import ProjectCard from '../components/ProjectCard'
import Spinner from '../components/Spinner'
import { buttonSecondary } from '../lib/classes'
import { api, errorText } from '../lib/api'

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.get('/projects/mine/')
      setProjects(data)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Link to="/projects/new" className={buttonSecondary}>
          Create Project
        </Link>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No projects yet"
            message="Create your first project to start receiving proposals."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {projects.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
              <div className="mt-2 flex gap-3 text-sm">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  View details
                </Link>
                <Link
                  to={`/projects/${project.id}/proposals`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  View proposals ({project.proposal_count})
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}