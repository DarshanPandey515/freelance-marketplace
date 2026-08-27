import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { api, errorText } from '../lib/api'
import { formatDate, formatMoney, statusClass, statusLabel } from '../lib/format'

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.get('/contracts/')
      setContracts(data)
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
      <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
      <p className="mt-1 text-sm text-gray-500">Active work and contracts you are involved in.</p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : contracts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No contracts yet"
            message="Contracts are created when a client accepts a proposal."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Freelancer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{contract.project}</td>
                  <td className="px-4 py-3 text-gray-700">{contract.client}</td>
                  <td className="px-4 py-3 text-gray-700">{contract.freelancer}</td>
                  <td className="px-4 py-3 text-gray-700">{formatMoney(contract.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(contract.status)}`}
                    >
                      {statusLabel(contract.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(contract.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}