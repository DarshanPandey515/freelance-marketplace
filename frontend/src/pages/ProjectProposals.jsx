import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { buttonPrimary } from '../lib/classes'
import { api, errorText } from '../lib/api'
import { formatDate, formatMoney, statusClass, statusLabel } from '../lib/format'

export default function ProjectProposals() {
  const { projectId } = useParams()
  const [proposals, setProposals] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionError, setActionError] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [projectData, proposalsData] = await Promise.all([
        api.get(`/projects/${projectId}/`),
        api.get(`/projects/${projectId}/proposals/`),
      ])
      setProject(projectData)
      setProposals(proposalsData)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  async function handleAccept(proposal) {
    setAcceptingId(proposal.proposal_id)
    setActionError('')
    setSuccess('')
    try {
      await api.put(`/proposals/${proposal.proposal_id}/accept/`)
      setSuccess(
        `Proposal from ${proposal.freelancer_name} accepted! A contract has been created.`,
      )
      await load()
    } catch (err) {
      setActionError(errorText(err))
    } finally {
      setAcceptingId(null)
    }
  }

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>

  const projectClosed = project && project.status !== 'open'

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
      <p className="mt-1 text-sm text-gray-500">
        Project: <Link to={`/projects/${projectId}`} className="text-indigo-600 hover:underline">{project?.title}</Link>
      </p>

      {success && (
        <div className="mt-4">
          <Alert kind="success">
            {success}{' '}
            <Link to="/contracts" className="font-medium underline">
              View your contracts
            </Link>
          </Alert>
        </div>
      )}
      {actionError && (
        <div className="mt-4">
          <Alert>{actionError}</Alert>
        </div>
      )}
      {projectClosed && (
        <div className="mt-4">
          <Alert>This project is {statusLabel(project.status)} and no longer accepting proposals.</Alert>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No proposals yet"
            message="Freelancers haven't submitted proposals for this project yet."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.proposal_id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{proposal.freelancer_name}</h2>
                  <p className="text-sm text-gray-500">
                    Submitted {formatDate(proposal.created_at)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(proposal.status)}`}>
                  {statusLabel(proposal.status)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                  {formatMoney(proposal.proposed_price)}
                </span>
                <span className="text-gray-600">
                  Estimated duration: {proposal.estimated_duration} days
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                {proposal.cover_letter}
              </p>

              {proposal.status === 'pending' && !projectClosed && (
                <div className="mt-4">
                  <button
                    onClick={() => handleAccept(proposal)}
                    disabled={acceptingId !== null}
                    className={buttonPrimary}
                  >
                    {acceptingId === proposal.proposal_id ? 'Accepting...' : 'Accept Proposal'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}