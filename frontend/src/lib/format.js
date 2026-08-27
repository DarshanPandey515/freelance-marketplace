export function formatMoney(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function statusLabel(status) {
  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    active: 'Active',
  }
  return labels[status] || status
}

export function statusClass(status) {
  const classes = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}