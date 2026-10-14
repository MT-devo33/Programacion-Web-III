import { useEffect } from 'react'

export default function Modal({ title, children, onClose, onSave, saveLabel = 'Guardar' }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,42,51,.5)] grid place-items-center p-5 z-[9]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-[560px] p-6 max-h-[92vh] overflow-auto">
        <h3 className="text-xl mb-4">{title}</h3>
        {children}
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-p" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
