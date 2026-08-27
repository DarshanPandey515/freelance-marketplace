export default function Alert({ kind = 'error', children }) {
  const styles =
    kind === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-800'
  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${styles}`} role="alert">
      {children}
    </div>
  )
}