import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(cpf, senha)
      navigate('/escolas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CPF ou senha invalidos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Bem-vindo</h1>
        <p className="subtitle">Entre com seu CPF e senha para gerenciar escolas, professores e alunos.</p>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Ainda nao tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
