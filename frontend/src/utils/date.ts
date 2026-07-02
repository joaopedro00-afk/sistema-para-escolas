// Utilitarios para trabalhar com datas no padrao brasileiro (dd/mm/aaaa)
// enquanto a API continua recebendo/enviando o padrao ISO (aaaa-mm-dd)

/** Aplica a mascara dd/mm/aaaa enquanto o usuario digita */
export function maskDateBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

/** Converte dd/mm/aaaa -> aaaa-mm-dd. Retorna undefined se o valor estiver incompleto/invalido */
export function brToIso(value: string): string | undefined {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return undefined

  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const isValid =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)
  if (!isValid) return undefined

  return `${yyyy}-${mm}-${dd}`
}

/** Converte aaaa-mm-dd (ou uma data ISO completa) -> dd/mm/aaaa para exibicao */
export function isoToBr(value?: string | null): string {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const [, yyyy, mm, dd] = match
  return `${dd}/${mm}/${yyyy}`
}

/** true se o texto ja esta completo no formato dd/mm/aaaa (nao valida se e uma data real) */
export function isCompleteBrDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())
}
