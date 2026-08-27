import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import Spinner from '../components/Spinner'
import { buttonPrimary, inputClass } from '../lib/classes'
import { api, errorText } from '../lib/api'
import { formatDate, formatMoney, statusClass, statusLabel } from '../lib/format'
import { useAuth } from '../hooks/useAuth'

function ProposalForm({ projectId, onSubmitted }) {
  const [form, setForm] = useState({ cover_letter: '', proposed_price: '', estimated_duration: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const e = {}
    if (!form.cover_letter.trim()) e.cover_letter = 'Cover letter is required.'
    else if (form.cover_letter.trim().length > 5000)
      e.cover_letter = 'Cover letter must be 5000 characters or fewer.'
    if (!form.proposed_price) e.proposed_price = 'Proposed price is required.'
    else if (Number(form.proposed_price) <= 0) e.proposed_price = 'Price must be greater than zero.'
    if (!form.estimated_duration) e.estimated_duration = 'Estimated duration is required.'
    else if (Number(form.estimated_duration) <= 0)
      e.estimated_duration = 'Duration must be greater than zero.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setApiError('')
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/proposals/`, {
        cover_letter: form.cover_letter.trim(),
        proposed_price: form.proposed_price,
        estimated_duration: form.estimated_duration,
      })
      onSubmitted()
    } catch (err) {
      setApiError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Submit a Proposal</h2>

      {apiError && (
        <div className="mt-4">
          <Alert>{apiError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <FormField label="Cover Letter" htmlFor="cover_letter" error={errors.cover_letter}>
          <textarea
            id="cover_letter"
            rows={5}
            value={form.cover_letter}
            onChange={update('cover_letter')}
            className={inputClass}
            placeholder="Introduce yourself and explain why you're the right fit..."
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Proposed Price (USD)"
            htmlFor="proposed_price"
            error={errors.proposed_price}
          >
            <input
              id="proposed_price"
              type="number"
              min="0"
              step="0.01"
              value={form.proposed_price}
              onChange={update('proposed_price')}
              className={inputClass}
              placeholder="1500"
            />
          </FormField>

          <FormField
            label="Estimated Duration (days)"
            htmlFor="estimated_duration"
            error={errors.estimated_duration}
          >
            <input
              id="estimated_duration"
              type="number"
              min="1"
              step="1"
              value={form.estimated_duration}
              onChange={update('estimated_duration')}
              className={inputClass}
              placeholder="21"
            />
          </FormField>
        </div>

        <button type="submit" disabled={loading} className={buttonPrimary}>
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  )
}

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [myProposal, setMyProposal] = useState(null)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isClient = user.role === 'client'
  const isFreelancer = user.role === 'freelancer'

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/projects/${projectId}/`)
      setProject(data)
      if (isFreelancer) {
        const proposals = await api.get('/proposals/mine/')
        const found = proposals.find((p) => p.project_id === projectId)
        setMyProposal(found || null)
      }
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }, [projectId, isFreelancer])

  useEffect(() => {
    load()
  }, [load])

  function handleProposalSubmitted() {
    setSuccess('Proposal submitted successfully!')
    setMyProposal({ status: 'pending' })
    load()
  }

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (!project) return null

  const alreadyProposed = isFreelancer && myProposal

  return (
    <div className="max-w-3xl">
      {success && (
        <div className="mb-4">
          <Alert kind="success">{success}</Alert>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(project.status)}`}>
            {statusLabel(project.status)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Posted by {project.client_name} · {project.proposal_count} proposals
        </p>

        <p className="mt-4 whitespace-pre-wrap text-gray-700">{project.description}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Category</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{project.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Budget</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {formatMoney(project.budget_min)} – {formatMoney(project.budget_max)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Deadline</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(project.deadline)}
            </dd>
          </div>
        </dl>
      </div>

      {isClient && project.client_id === user.id && (
        <div className="mt-6">
          <Link
            to={`/projects/${project.id}/proposals`}
            className="font-medium text-indigo-600 hover:underline"
          >
            View proposals ({project.proposal_count})
          </Link>
        </div>
      )}

      {isFreelancer && (
        <div className="mt-6">
          {project.status !== 'open' ? (
            <Alert>This project is no longer accepting proposals.</Alert>
          ) : alreadyProposed ? (
            <Alert kind="success">
              You have already submitted a proposal for this project. Current status:{' '}
              {statusLabel(myProposal.status)}.
            </Alert>
          ) : (
            <ProposalForm projectId={project.id} onSubmitted={handleProposalSubmitted} />
          )}
        </div>
      )}
    </div>
  )
}