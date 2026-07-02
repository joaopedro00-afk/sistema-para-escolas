import { FormEvent, useEffect, useRef, useState } from 'react'
import TableSimple from '../components/TableSimple'
import {
  createAluno,
  deleteAluno,
  listAlunos,
  listProfessores,
  type Aluno,
  type Professor,
} from '../services/api'
import { brToIso, isoToBr, maskDateBR } from '../utils/date'

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
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
      const [alunosData, professoresData] = await Promise.all([listAlunos(), listProfessores()])
      setAlunos(alunosData)
      setProfessores(professoresData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os alunos')
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
    const dataNascimentoBr = String(form.get('data_nascimento') || '').trim()
    const professor_id = Number(form.get('professor_id'))

    if (!nome || !cpf || !professor_id) {
      setError('Nome, CPF e professor sao obrigatorios')
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
      await createAluno({ nome, cpf, professor_id, data_nascimento })
      formElement.reset()
      setIsModalOpen(false)
      setSuccessMessage(`Aluno ${nome} cadastrado com sucesso.`)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel cadastrar o aluno')
      setSuccessMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(row: Aluno) {
    if (deletingId) return
    if (!window.confirm(`Excluir o aluno ${row.nome}?`)) return

    try {
      setDeletingId(row.id)
      await deleteAluno(row.id)
      setSuccessMessage(`Aluno ${row.nome} excluido com sucesso.`)
      setError(null)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel excluir o aluno')
      setSuccessMessage(null)
    } finally {
      setDeletingId(null)
    }
  }

  const rows = alunos.map((a) => ({
    id: a.id,
    nome: a.nome,
    cpf: a.cpf,
    nascimento: isoToBr(a.data_nascimento),
    professor: a.professor?.nome ?? '—',
    escola: a.professor?.escola ?? '—',
  }))

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Alunos</h2>
          <p className="subtitle">Cadastre alunos e associe-os a um professor</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={!professores.length}>
          Novo aluno
        </button>
      </div>

      {!professores.length && !loading && (
        <p className="alert alert-warning">Cadastre ao menos um professor antes de adicionar alunos.</p>
      )}

      {error && <p className="alert alert-error">{error}</p>}
      {successMessage && !error && <p className="alert alert-success">{successMessage}</p>}

      {loading ? (
        <div className="empty-state">Carregando alunos...</div>
      ) : (
        <TableSimple
          columns={[
            { key: 'nome', header: 'Nome' },
            { key: 'cpf', header: 'CPF' },
            { key: 'nascimento', header: 'Nascimento' },
            { key: 'professor', header: 'Professor' },
            { key: 'escola', header: 'Escola' },
          ]}
          data={rows}
          renderActions={(row) => (
            <button
              onClick={() => handleDelete(alunos.find((a) => a.id === row.id)!)}
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
            <h3>Novo aluno</h3>
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
                <label htmlFor="professor_id">Professor</label>
                <select id="professor_id" name="professor_id" defaultValue="">
                  <option value="" disabled>
                    Selecione um professor
                  </option>
                  {professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome} ({professor.escola?.nome})
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
