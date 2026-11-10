import { FiAlertTriangle } from 'react-icons/fi'
import Modal from './Modal'

export default function Confirm({
  titulo = 'Confirmar acción',
  mensaje = '¿Deseas continuar?',
  etiqueta = 'Confirmar',
  peligro = true,
  alCerrar,
  alConfirmar,
}) {
  return (
    <Modal
      titulo={titulo}
      alCerrar={alCerrar}
      alGuardar={alConfirmar}
      etiquetaGuardar={etiqueta}
      etiquetaCancelar="Cancelar"
      peligro={peligro}
      ancho="max-w-[430px]"
    >
      <div className="flex gap-3 items-start">
        <span
          className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
            peligro ? 'bg-bad text-bad-txt' : 'bg-info text-info-txt'
          }`}
        >
          <FiAlertTriangle size={19} />
        </span>
        <p className="text-mut pt-1.5">{mensaje}</p>
      </div>
    </Modal>
  )
}
