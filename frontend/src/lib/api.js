export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function getToken() {
  return localStorage.getItem('access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export class ApiError extends Error {
  constructor(status, data) {
    super(typeof data === 'string' ? data : data?.message || `Request failed (${status})`)
    this.status = status
    this.data = data
  }
}

export function errorText(err) {
  if (!err) return 'Something went wrong'
  if (err instanceof ApiError) {
    const data = err.data
    if (!data) return err.message
    if (typeof data === 'string') return data
    if (data.message) return data.message
    const parts = []
    for (const [field, value] of Object.entries(data)) {
      if (Array.isArray(value)) parts.push(`${field}: ${value.join(', ')}`)
      else if (value && typeof value === 'object') parts.push(`${field}: ${JSON.stringify(value)}`)
      else parts.push(`${field}: ${value}`)
    }
    return parts.join(' · ') || err.message
  }
  return err.message || 'Something went wrong'
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, { message: 'Network error. Is the backend running?' })
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }

  if (res.status === 401 && auth && token) {
    clearAuth()
    window.dispatchEvent(new Event('auth:logout'))
  }

  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
}