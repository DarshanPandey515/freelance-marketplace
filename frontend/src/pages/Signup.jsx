import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { buttonPrimary, inputClass } from '../lib/classes'
import { api, errorText } from '../lib/api'

const emptyForm = { name: '', email: '', password: '', role: 'freelancer' }

export default function Signup() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!form.role) e.role = 'Select a role.'
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
      await api.post('/auth/signup/', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      navigate('/login', { state: { success: 'Account created! Please log in.' } })
    } catch (err) {
      setApiError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">Join the freelance marketplace.</p>

        {apiError && (
          <div className="mt-4">
            <Alert>{apiError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <FormField label="Name" htmlFor="name" error={errors.name}>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={update('name')}
              className={inputClass}
              placeholder="Jane Doe"
            />
          </FormField>

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

          <FormField label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              className={inputClass}
            />
          </FormField>

          <FormField label="Role" htmlFor="role" error={errors.role}>
            <select id="role" value={form.role} onChange={update('role')} className={inputClass}>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </FormField>

          <button type="submit" disabled={loading} className={`${buttonPrimary} w-full`}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}