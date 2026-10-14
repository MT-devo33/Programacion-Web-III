export const tagEst = {
  Atendida: 't-ok',
  'En espera': 't-warn',
  Pendiente: 't-mut',
  Cancelada: 't-bad',
}

export const ESTADOS = Object.keys(tagEst)

export const SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export const ini = (n) =>
  n
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')

export const mailOk = (c) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)

export const passLevel = (p) => {
  const c = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length
  return p.length < 8 || c < 3 ? 1 : p.length >= 10 && c === 4 ? 3 : 2
}

export const passText = [
  '',
  'Débil: usa 8 o más caracteres con mayúsculas, minúsculas y números.',
  'Intermedia: añade un símbolo y más longitud para hacerla fuerte.',
  'Fuerte',
]

export const passColor = ['', '#c0392b', '#c77d0a', '#2e8b57']

export const brw = () => {
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

export const now = () => new Date().toLocaleString('es-BO')

export const today = () => new Date().toISOString().slice(0, 10)

export const groupBy = (arr, fn) =>
  Object.entries(
    arr.reduce((m, x) => {
      const k = fn(x)
      m[k] = (m[k] || 0) + 1
      return m
    }, {}),
  )
