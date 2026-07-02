const FALLBACK_API_URL = 'http://127.0.0.1:5001/api'

const DEFAULT_API_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin.replace(/\/$/, '')}/api`
    : FALLBACK_API_URL

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL ?? DEFAULT_API_URL).replace(/\/$/, '')

const TOKEN_KEY = 'desafio_crud_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export type Usuario = {
  id: number
  nome: string
  cpf: string
  data_nascimento: string | null
}

export type UsuarioPayload = {
  nome: string
  cpf: string
  senha: string
  data_nascimento?: string
}

export type Escola = {
  id: number
  nome: string
  endereco: string
}

export type EscolaPayload = {
  nome: string
  endereco: string
}

export type Professor = {
  id: number
  usuario_id: number
  escola_id: number
  nome?: string
  cpf?: string
  data_nascimento?: string | null
  escola?: { id: number; nome: string }
}

export type ProfessorPayload = {
  nome: string
  cpf: string
  senha: string
  data_nascimento?: string
  escola_id: number
}

export type Aluno = {
  id: number
  nome: string
  cpf: string
  data_nascimento: string | null
  professor_id: number
  professor?: { id: number; nome?: string; escola?: string }
}

export type AlunoPayload = {
  nome: string
  cpf: string
  data_nascimento?: string
  professor_id: number
}

type RequestConfig = RequestInit & { skipJson?: boolean; auth?: boolean }

async function request<TResponse>(path: string, config: RequestConfig = {}): Promise<TResponse> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${API_BASE_URL}${normalizedPath}`

  const headers = new Headers(config.headers)
  if (!headers.has('Content-Type') && config.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (config.auth !== false) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...config,
    headers,
  })

  if (response.status === 401) {
    clearToken()
  }

  if (!response.ok) {
    const fallback = `Erro ${response.status}`
    let detail = fallback
    try {
      const data = await response.json()
      detail = typeof data?.error === 'string' ? data.error : fallback
    } catch {
      detail = fallback
    }
    throw new Error(detail)
  }

  if (config.skipJson || response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

// --- Autenticacao ---
export function login(cpf: string, senha: string) {
  return request<{ token: string; usuario: Usuario }>('/login', {
    method: 'POST',
    body: JSON.stringify({ cpf, senha }),
    auth: false,
  })
}

export function registrarUsuario(payload: UsuarioPayload) {
  return request<Usuario>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  })
}

// --- Escolas ---
export function listEscolas() {
  return request<Escola[]>('/schools')
}

export function createEscola(payload: EscolaPayload) {
  return request<Escola>('/schools', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateEscola(id: number, payload: Partial<EscolaPayload>) {
  return request<Escola>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteEscola(id: number) {
  return request<void>(`/schools/${id}`, { method: 'DELETE', skipJson: true })
}

// --- Professores ---
export function listProfessores() {
  return request<Professor[]>('/teachers')
}

export function createProfessor(payload: ProfessorPayload) {
  return request<Professor>('/teachers', { method: 'POST', body: JSON.stringify(payload), auth: false })
}

export function updateProfessor(id: number, payload: Partial<ProfessorPayload>) {
  return request<Professor>(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteProfessor(id: number) {
  return request<void>(`/teachers/${id}`, { method: 'DELETE', skipJson: true })
}

// --- Alunos ---
export function listAlunos() {
  return request<Aluno[]>('/students')
}

export function createAluno(payload: AlunoPayload) {
  return request<Aluno>('/students', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateAluno(id: number, payload: Partial<AlunoPayload>) {
  return request<Aluno>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteAluno(id: number) {
  return request<void>(`/students/${id}`, { method: 'DELETE', skipJson: true })
}
