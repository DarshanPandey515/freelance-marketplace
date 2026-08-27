import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { buttonPrimary, inputClass } from '../lib/classes'
import { api, errorText } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.success

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
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
      const data = await api.post('/auth/login/', {
        email: form.email.trim(),
        password: form.password,
      })
      login(data)
      navigate(data.user.role === 'client' ? '/my-projects' : '/projects')
    } catch (err) {
      setApiError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back!</p>

        {successMessage && (
          <div className="mt-4">
            <Alert kind="success">{successMessage}</Alert>
          </div>
        )}

        {apiError && (
          <div className="mt-4">
            <Alert>{apiError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update('email')}
              className={inputClass}
              placeholder="jane@example.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password}>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              className={inputClass}
            />
          </FormField>

          <button type="submit" disabled={loading} className={`${buttonPrimary} w-full`}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New here?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}