import { FormEvent, useEffect, useRef, useState } from 'react'
import TableSimple from '../components/TableSimple'
import {
  createProfessor,
  deleteProfessor,
  listEscolas,
  listProfessores,
  type Escola,
  type Professor,
} from '../services/api'
import { brToIso, isoToBr, maskDateBR } from '../utils/date'

export default function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    void bootstrap()
  }, [])

  async function bootstrap() {
    setLoading(true)
    setError(null)
    try {
      const [professoresData, escolasData] = await Promise.all([listProfessores(), listEscolas()])
      setProfessores(professoresData)
      setEscolas(escolasData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os professores')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const formElement = formRef.current
    if (!formElement) return
    const form = new FormData(formElement)
    const nome = String(form.get('nome') || '').trim()
    const cpf = String(form.get('cpf') || '').trim()
    const senha = String(form.get('senha') || '').trim()
    const dataNascimentoBr = String(form.get('data_nascimento') || '').trim()
    const escola_id = Number(form.get('escola_id'))

    if (!nome || !cpf || !senha || !escola_id) {
      setError('Nome, CPF, senha e escola sao obrigatorios')
      return
    }

    let data_nascimento: string | undefined
    if (dataNascimentoBr) {
      data_nascimento = brToIso(dataNascimentoBr)
      if (!data_nascimento) {
        setError('Data de nascimento invalida. Use o formato dd/mm/aaaa')
        return
      }
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)
      await createProfessor({ nome, cpf, senha, escola_id, data_nascimento })
      formElement.reset()
      setIsModalOpen(false)
      setSuccessMessage(`Professor ${nome} cadastrado com sucesso.`)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel cadastrar o professor')
      setSuccessMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(row: Professor) {
    if (deletingId) return
    if (!window.confirm(`Excluir o professor ${row.nome ?? row.id}?`)) return

    try {
      setDeletingId(row.id)
      await deleteProfessor(row.id)
      setSuccessMessage('Professor excluido com sucesso.')
      setError(null)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel excluir o professor')
      setSuccessMessage(null)
    } finally {
      setDeletingId(null)
    }
  }

  const rows = professores.map((p) => ({
    id: p.id,
    nome: p.nome ?? '—',
    cpf: p.cpf ?? '—',
    nascimento: isoToBr(p.data_nascimento),
    escola: p.escola?.nome ?? '—',
  }))

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Professores</h2>
          <p className="subtitle">Cadastre professores e associe-os a uma escola</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={!escolas.length}>
          Novo professor
        </button>
      </div>

      {!escolas.length && !loading && (
        <p className="alert alert-warning">Cadastre ao menos uma escola antes de adicionar professores.</p>
      )}

      {error && <p className="alert alert-error">{error}</p>}
      {successMessage && !error && <p className="alert alert-success">{successMessage}</p>}

      {loading ? (
        <div className="empty-state">Carregando professores...</div>
      ) : (
        <TableSimple
          columns={[
            { key: 'nome', header: 'Nome' },
            { key: 'cpf', header: 'CPF' },
            { key: 'nascimento', header: 'Nascimento' },
            { key: 'escola', header: 'Escola' },
          ]}
          data={rows}
          renderActions={(row) => (
            <button
              onClick={() => handleDelete(professores.find((p) => p.id === row.id)!)}
              className="link-btn link-btn-danger"
              disabled={deletingId === row.id}
            >
              {deletingId === row.id ? 'Excluindo...' : 'Excluir'}
            </button>
          )}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Novo professor</h3>
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" name="nome" placeholder="Nome completo" />
              </div>
              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" placeholder="000.000.000-00" />
              </div>
              <div className="field">
                <label htmlFor="data_nascimento">Data de nascimento</label>
                <input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  onChange={(e) => {
                    e.target.value = maskDateBR(e.target.value)
                  }}
                />
              </div>
              <div className="field">
                <label htmlFor="senha">Senha</label>
                <input id="senha" name="senha" type="password" placeholder="Minimo 6 caracteres, com letras e numeros" />
              </div>
              <div className="field">
                <label htmlFor="escola_id">Escola</label>
                <select id="escola_id" name="escola_id" defaultValue="">
                  <option value="" disabled>
                    Selecione uma escola
                  </option>
                  {escolas.map((escola) => (
                    <option key={escola.id} value={escola.id}>
                      {escola.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
