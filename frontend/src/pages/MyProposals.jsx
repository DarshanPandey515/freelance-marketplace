import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { api, errorText } from '../lib/api'
import { formatDate, formatMoney, statusClass, statusLabel } from '../lib/format'

export default function MyProposals() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.get('/proposals/mine/')
      setProposals(data)
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
      <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
      <p className="mt-1 text-sm text-gray-500">Proposals you have submitted.</p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : proposals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No proposals yet"
            message="Browse open projects and submit a proposal to get started."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.proposal_id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/projects/${proposal.project_id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {proposal.project_title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    Project status: {statusLabel(proposal.project_status)} · Submitted{' '}
                    {formatDate(proposal.created_at)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}