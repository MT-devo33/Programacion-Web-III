export const etiquetaEstado = {
  Atendida: 't-ok',
  Confirmada: 't-info',
  'En espera': 't-warn',
  Pendiente: 't-mut',
  Cancelada: 't-bad',
}

export const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'En espera', 'Atendida', 'Cancelada']

export const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const iniciales = (n = '') =>
  n
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase()

export const correoValido = (c = '') => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)

export const nivelContrasena = (p = '') => {
  const c = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length
  return p.length < 8 || c < 3 ? 1 : p.length >= 10 && c === 4 ? 3 : 2
}

export const textoContrasena = [
  '',
  'Débil: usa 8 o más caracteres con mayúsculas, minúsculas y números.',
  'Intermedia: añade un símbolo y más longitud para hacerla fuerte.',
  'Fuerte',
]

export const colorContrasena = ['', '#8B3A3A', '#8B7326', '#2D6B4A']

export const navegador = () => {
  const u = navigator.userAgent
  return /Edg\//.test(u)
    ? 'Edge'
    : /OPR\//.test(u)
      ? 'Opera'
      : /Chrome\//.test(u)
        ? 'Chrome'
        : /Firefox\//.test(u)
          ? 'Firefox'
          : /Safari\//.test(u)
            ? 'Safari'
            : 'Otro'
}

export const ahora = () => new Date().toLocaleString('es-BO')

export const hoy = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const fechaRel = (dias = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatearFecha = (f) => {
  if (!f) return '—'
  const [a, m, d] = f.split('-')
  return `${d}/${m}/${a}`
}

export const agruparPor = (arr, fn) =>
  Object.entries(
    arr.reduce((m, x) => {
      const k = fn(x)
      m[k] = (m[k] || 0) + 1
      return m
    }, {}),
  )

export const pacientesDelMedico = (pacientes, citas, consultas, medicoId) => {
  const ids = new Set()
  pacientes.filter((p) => p.medicoId === medicoId).forEach((p) => ids.add(p.id))
  citas.filter((c) => c.med === medicoId).forEach((c) => ids.add(c.pac))
  consultas.filter((c) => c.med === medicoId).forEach((c) => ids.add(c.pac))
  return pacientes.filter((p) => ids.has(p.id))
}

export const fechaSemana = (base, indice) => {
  const d = new Date(base)
  d.setDate(d.getDate() + indice)
  return d
}

export const inicioSemana = (fecha) => {
  const d = new Date(fecha)
  const dia = d.getDay()
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia))
  d.setHours(0, 0, 0, 0)
  return d
}

export const isoFecha = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const diaSemanaDeFecha = (f) => {
  const [a, m, d] = f.split('-').map(Number)
  const indice = new Date(a, m - 1, d).getDay()
  return DIAS[(indice + 6) % 7]
}

export const ordenarCitas = (citas) =>
  [...citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))

