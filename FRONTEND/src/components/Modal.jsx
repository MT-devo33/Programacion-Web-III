import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({
  titulo,
  children,
  alCerrar,
  alGuardar,
  etiquetaGuardar = 'Guardar',
  etiquetaCancelar = 'Cancelar',
  peligro = false,
  ancho = 'max-w-[560px]',
}) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && alCerrar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [alCerrar])

  return (
    <div
      className="fixed inset-0 bg-[rgba(52,70,74,.45)] grid place-items-center p-4 md:p-5 z-[9]"
      onClick={(e) => e.target === e.currentTarget && alCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`bg-white rounded-xl w-full ${ancho} p-5 md:p-6 max-h-[92vh] overflow-auto shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-xl">{titulo}</h3>
          <button className="btn btn-s" onClick={alCerrar} aria-label="Cerrar">
            <FiX size={16} />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-2 mt-5 flex-wrap">
          <button className="btn" onClick={alCerrar}>
            {alGuardar ? etiquetaCancelar : 'Cerrar'}
          </button>
          {alGuardar && (
            <button className={`btn ${peligro ? 'btn-d' : 'btn-p'}`} onClick={alGuardar}>
              {etiquetaGuardar}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
