import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../services/api'
import { brToIso, maskDateBR } from '../utils/date'

export default function CadastroUsuario() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!nome.trim() || !cpf.trim() || !senha.trim()) {
      setError('Nome, CPF e senha sao obrigatorios')
      return
    }

    let data_nascimento: string | undefined
    if (dataNascimento) {
      data_nascimento = brToIso(dataNascimento)
      if (!data_nascimento) {
        setError('Data de nascimento invalida. Use o formato dd/mm/aaaa')
        return
      }
    }

    try {
      setIsLoading(true)
      await registrarUsuario({
        nome: nome.trim(),
        cpf: cpf.trim(),
        senha,
        data_nascimento,
      })
      setSuccessMessage('Usuario cadastrado com sucesso! Redirecionando para o login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel cadastrar o usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Criar conta</h1>
        <p className="subtitle">Cadastre-se para acessar o sistema de gestao escolar.</p>

        {error && <p className="alert alert-error">{error}</p>}
        {successMessage && <p className="alert alert-success">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label htmlFor="nome">Nome completo</label>
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
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
            <label htmlFor="data_nascimento">Data de nascimento</label>
            <input
              id="data_nascimento"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={dataNascimento}
              onChange={(e) => setDataNascimento(maskDateBR(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Minimo 6 caracteres, com letras e numeros"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-footer">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
