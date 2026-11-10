import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi'

const estilos = {
  ok: { icono: FiCheckCircle, color: 'text-ok' },
  error: { icono: FiAlertCircle, color: 'text-bad' },
  info: { icono: FiInfo, color: 'text-info' },
}

export default function Toast({ texto, tipo = 'ok' }) {
  const { icono: Icono, color } = estilos[tipo] ?? estilos.ok
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 max-w-[calc(100vw-2.5rem)] bg-txt text-white px-4 py-3 rounded-lg z-20 transition-all duration-300 pointer-events-none flex items-center gap-2 shadow-lg ${
        texto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      }`}
    >
      {texto && <Icono size={17} className={color} />}
      {texto}
    </div>
  )
}
