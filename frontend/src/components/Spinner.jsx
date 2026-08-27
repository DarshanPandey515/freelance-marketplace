export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 py-8 text-gray-600">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <span>{text}</span>
    </div>
  )
}