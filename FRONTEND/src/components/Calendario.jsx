import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { etiquetaEstado, fechaSemana, hoy, inicioSemana, isoFecha } from '../data/utils'

const borde = {
  Atendida: 'border-l-ok-txt',
  Confirmada: 'border-l-acc2',
  'En espera': 'border-l-warn-txt',
  Pendiente: 'border-l-line',
  Cancelada: 'border-l-bad-txt',
}

const punto = {
  Atendida: 'bg-ok-txt',
  Confirmada: 'bg-acc2',
  'En espera': 'bg-warn-txt',
  Pendiente: 'bg-mut',
  Cancelada: 'bg-bad-txt',
}

const nombresCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Calendario({
  citas,
  pacientes,
  medicos = [],
  medicoId = null,
  alSeleccionar,
  altura = 'min-h-[150px]',
}) {
  const [base, setBase] = useState(new Date())
  const inicio = inicioSemana(base)
  const dias = Array.from({ length: 7 }, (_, i) => fechaSemana(inicio, i))
  const mesInicio = inicio.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })
  const fin = dias[6]
  const mesFin = fin.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })
  const rango = mesInicio === mesFin ? mesInicio : `${mesInicio} – ${mesFin}`

  const mover = (diasMovidos) => {
    const d = new Date(base)
    d.setDate(d.getDate() + diasMovidos)
    setBase(d)
  }

  const buscarPaciente = (id) => pacientes.find((p) => p.id === id)
  const buscarMedico = (id) => medicos.find((m) => m.id === id)

  return (
    <div>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div>
          <h3 className="text-base capitalize">{rango}</h3>
          <small className="text-mut">Vista semanal de citas</small>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="btn btn-s" onClick={() => mover(-7)} aria-label="Semana anterior">
            <FiChevronLeft size={15} />
          </button>
          <button className="btn btn-s" onClick={() => setBase(new Date())}>
            Hoy
          </button>
          <button className="btn btn-s" onClick={() => mover(7)} aria-label="Semana siguiente">
            <FiChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-7 gap-2 min-w-[780px]">
          {dias.map((dia, i) => {
            const clave = isoFecha(dia)
            const esHoy = clave === hoy()
            const delDia = citas
              .filter((c) => c.fecha === clave && (!medicoId || c.med === medicoId))
              .sort((a, b) => a.hora.localeCompare(b.hora))
            return (
              <div
                key={clave}
                className={`rounded-xl border p-2 ${altura} ${
                  esHoy ? 'border-acc bg-info/30' : 'border-line bg-surface'
                }`}
              >
                <div className="flex items-baseline justify-between mb-2 px-1">
                  <span className="text-[11px] uppercase tracking-wide text-mut">{nombresCortos[i]}</span>
                  <span className={`text-lg font-bold ${esHoy ? 'text-acc2' : 'text-txt'}`}>
                    {dia.getDate()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {delDia.map((c) => {
                    const p = buscarPaciente(c.pac)
                    const m = buscarMedico(c.med)
                    return (
                      <button
                        key={c.id}
                        className={`w-full text-left rounded-lg border border-line border-l-4 ${
                          borde[c.estado] ?? 'border-l-line'
                        } bg-white px-2 py-1.5 hover:shadow-sm transition-shadow`}
                        onClick={() => alSeleccionar?.(c)}
                      >
                        <span className="block text-[11px] font-bold text-acc2">{c.hora}</span>
                        <span className="block text-[11px] leading-tight font-semibold truncate">
                          {p?.nom ?? 'Paciente'}
                        </span>
                        {!medicoId && <span className="block text-[10px] text-mut truncate">{m?.nom}</span>}
                        <span className={`tag mt-1 ${etiquetaEstado[c.estado]}`}>{c.estado}</span>
                      </button>
                    )
                  })}
                  {!delDia.length && <p className="text-[11px] text-mut text-center pt-4">Sin citas</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-mut">
        {Object.entries(etiquetaEstado).map(([estado]) => (
          <span key={estado} className="inline-flex items-center gap-1.5">
            <i className={`w-2.5 h-2.5 rounded-full ${punto[estado] ?? 'bg-mut'}`} />
            {estado}
          </span>
        ))}
      </div>
    </div>
  )
}
