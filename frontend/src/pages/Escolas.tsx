import { FormEvent, useEffect, useRef, useState } from 'react'
import TableSimple from '../components/TableSimple'
import { createEscola, deleteEscola, listEscolas, updateEscola, type Escola } from '../services/api'

export default function Escolas() {
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editing, setEditing] = useState<Escola | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    void bootstrap()
  }, [])

  async function bootstrap() {
    setLoading(true)
    setError(null)
    try {
      const data = await listEscolas()
      setEscolas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar as escolas')
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
    const endereco = String(form.get('endereco') || '').trim()

    if (!nome || !endereco) {
      setError('Nome e endereco sao obrigatorios')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)
      if (editing) {
        await updateEscola(editing.id, { nome, endereco })
      } else {
        await createEscola({ nome, endereco })
      }
      formElement.reset()
      setEditing(null)
      setIsModalOpen(false)
      setSuccessMessage(`Escola ${nome} ${editing ? 'atualizada' : 'criada'} com sucesso.`)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar a escola')
      setSuccessMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(row: Escola) {
    if (deletingId) return
    if (!window.confirm(`Excluir a escola ${row.nome}?`)) return

    try {
      setDeletingId(row.id)
      await deleteEscola(row.id)
      setSuccessMessage(`Escola ${row.nome} excluida com sucesso.`)
      setError(null)
      await bootstrap()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel excluir a escola')
      setSuccessMessage(null)
    } finally {
      setDeletingId(null)
    }
  }

  function openModal(target?: Escola) {
    setError(null)
    setSuccessMessage(null)
    setEditing(target ?? null)
    setIsModalOpen(true)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Escolas</h2>
          <p className="subtitle">Cadastre e gerencie as escolas do sistema</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          Nova escola
        </button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {successMessage && !error && <p className="alert alert-success">{successMessage}</p>}

      {loading ? (
        <div className="empty-state">Carregando escolas...</div>
      ) : (
        <TableSimple<Escola>
          columns={[
            { key: 'nome', header: 'Nome' },
            { key: 'endereco', header: 'Endereco' },
          ]}
          data={escolas}
          renderActions={(row) => (
            <>
              <button onClick={() => openModal(row)} className="link-btn">
                Editar
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="link-btn link-btn-danger"
                disabled={deletingId === row.id}
              >
                {deletingId === row.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </>
          )}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editing ? 'Editar escola' : 'Nova escola'}</h3>
            <form ref={formRef} onSubmit={handleSubmit} key={editing ? editing.id : 'new-escola'}>
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" name="nome" defaultValue={editing?.nome ?? ''} placeholder="Nome da escola" />
              </div>
              <div className="field">
                <label htmlFor="endereco">Endereco</label>
                <input
                  id="endereco"
                  name="endereco"
                  defaultValue={editing?.endereco ?? ''}
                  placeholder="Rua, numero, bairro"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditing(null)
                  }}
                  className="btn btn-ghost"
                >
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
