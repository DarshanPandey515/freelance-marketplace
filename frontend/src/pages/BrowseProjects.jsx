import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import ProjectCard from '../components/ProjectCard'
import Spinner from '../components/Spinner'
import { buttonPrimary, buttonSecondary, inputClass, labelClass } from '../lib/classes'
import { api, errorText } from '../lib/api'

const CATEGORY_SUGGESTIONS = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Writing & Content',
  'Digital Marketing',
  'Data Science & ML',
]

function buildQuery(filters) {
  const params = new URLSearchParams()
  if (filters.category.trim()) params.set('category', filters.category.trim())
  if (filters.minBudget) params.set('minBudget', filters.minBudget)
  if (filters.maxBudget) params.set('maxBudget', filters.maxBudget)
  const qs = params.toString()
  return qs ? `/projects/?${qs}` : '/projects/'
}

export default function BrowseProjects() {
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ category: '', minBudget: '', maxBudget: '' })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (query) => {
    try {
      const data = await api.get(query)
      setProjects(data)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(buildQuery(appliedFilters))
  }, [load, appliedFilters])

  function update(field) {
    return (e) => setFilters((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setAppliedFilters(filters)
  }

  function handleReset() {
    const empty = { category: '', minBudget: '', maxBudget: '' }
    setFilters(empty)
    setError('')
    setLoading(true)
    setAppliedFilters(empty)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Browse Projects</h1>
      <p className="mt-1 text-sm text-gray-500">Find open projects and submit a proposal.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <input
              id="category"
              list="category-suggestions"
              type="text"
              value={filters.category}
              onChange={update('category')}
              className={`${inputClass} mt-1`}
              placeholder="All categories"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="minBudget" className={labelClass}>
              Minimum Budget
            </label>
            <input
              id="minBudget"
              type="number"
              min="0"
              step="0.01"
              value={filters.minBudget}
              onChange={update('minBudget')}
              className={`${inputClass} mt-1`}
              placeholder="Any"
            />
          </div>
          <div>
            <label htmlFor="maxBudget" className={labelClass}>
              Maximum Budget
            </label>
            <input
              id="maxBudget"
              type="number"
              min="0"
              step="0.01"
              value={filters.maxBudget}
              onChange={update('maxBudget')}
              className={`${inputClass} mt-1`}
              placeholder="Any"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className={buttonPrimary}>
              Apply Filters
            </button>
            <button type="button" onClick={handleReset} className={buttonSecondary}>
              Reset
            </button>
          </div>
        </div>
      </form>

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
            title="No open projects found"
            message="Try adjusting your filters, or check back later."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {projects.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
              <div className="mt-2 text-sm">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  View details & submit proposal
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}