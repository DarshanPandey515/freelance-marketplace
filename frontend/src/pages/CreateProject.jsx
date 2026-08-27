import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { buttonPrimary, inputClass } from '../lib/classes'
import { api, errorText } from '../lib/api'

const emptyForm = {
  title: '',
  description: '',
  category: '',
  budget_min: '',
  budget_max: '',
  deadline: '',
}

export default function CreateProject() {
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
    if (!form.title.trim()) e.title = 'Title is required.'
    else if (form.title.trim().length > 200) e.title = 'Title must be 200 characters or fewer.'
    if (!form.description.trim()) e.description = 'Description is required.'
    else if (form.description.trim().length > 2000)
      e.description = 'Description must be 2000 characters or fewer.'
    if (!form.category.trim()) e.category = 'Category is required.'
    if (!form.budget_min) e.budget_min = 'Minimum budget is required.'
    else if (Number(form.budget_min) <= 0) e.budget_min = 'Minimum budget must be greater than zero.'
    if (!form.budget_max) e.budget_max = 'Maximum budget is required.'
    else if (Number(form.budget_max) <= 0) e.budget_max = 'Maximum budget must be greater than zero.'
    if (form.budget_min && form.budget_max && Number(form.budget_max) < Number(form.budget_min)) {
      e.budget_max = 'Maximum budget must be greater than or equal to minimum budget.'
    }
    if (!form.deadline) e.deadline = 'Deadline is required.'
    else if (new Date(form.deadline) <= new Date(new Date().toDateString()))
      e.deadline = 'Deadline must be in the future.'
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
      const data = await api.post('/projects/', {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        budget_min: form.budget_min,
        budget_max: form.budget_max,
        deadline: form.deadline,
      })
      navigate(`/projects/${data.id}`)
    } catch (err) {
      setApiError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Create a Project</h1>
      <p className="mt-1 text-sm text-gray-500">Post a project and receive proposals from freelancers.</p>

      {apiError && (
        <div className="mt-4">
          <Alert>{apiError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <FormField label="Title" htmlFor="title" error={errors.title}>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={update('title')}
            className={inputClass}
            placeholder="Build a landing page for my startup"
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={errors.description}>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={update('description')}
            className={inputClass}
            placeholder="Describe the scope, requirements, and deliverables..."
          />
        </FormField>

        <FormField label="Category" htmlFor="category" error={errors.category}>
          <input
            id="category"
            type="text"
            value={form.category}
            onChange={update('category')}
            className={inputClass}
            placeholder="e.g. Web Development"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Minimum Budget (USD)" htmlFor="budget_min" error={errors.budget_min}>
            <input
              id="budget_min"
              type="number"
              min="0"
              step="0.01"
              value={form.budget_min}
              onChange={update('budget_min')}
              className={inputClass}
              placeholder="500"
            />
          </FormField>

          <FormField label="Maximum Budget (USD)" htmlFor="budget_max" error={errors.budget_max}>
            <input
              id="budget_max"
              type="number"
              min="0"
              step="0.01"
              value={form.budget_max}
              onChange={update('budget_max')}
              className={inputClass}
              placeholder="2000"
            />
          </FormField>
        </div>

        <FormField label="Deadline" htmlFor="deadline" error={errors.deadline}>
          <input
            id="deadline"
            type="date"
            value={form.deadline}
            onChange={update('deadline')}
            className={inputClass}
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className={buttonPrimary}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            to="/my-projects"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}