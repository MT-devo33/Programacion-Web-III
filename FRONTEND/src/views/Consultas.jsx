import { useState } from 'react'
import { FiActivity, FiClipboard, FiSave, FiUser } from 'react-icons/fi'
import Head from '../components/Head'
import { formatearFecha, hoy } from '../data/utils'

const inicial = { motivo: '', diagnostico: '', tratamiento: '', observaciones: '' }

export default function Consultas({
  pacientesLista,
  consultasLista,
  setConsultasLista,
  medicoId,
  pacienteSel,
  setPacienteSel,
  mostrarAviso,
  registrarEvento,
}) {
  const activos = pacientesLista.filter((p) => p.estado)
  const pacienteActual = activos.find((p) => p.id === pacienteSel) ?? activos[0]
  const historial = consultasLista
    .filter((c) => c.pac === pacienteActual?.id && c.med === medicoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  const [formulario, setFormulario] = useState(inicial)
  const [errores, setErrores] = useState({})

  const guardar = () => {
    const v = {
      motivo: formulario.motivo.trim(),
      diagnostico: formulario.diagnostico.trim(),
      tratamiento: formulario.tratamiento.trim(),
      observaciones: formulario.observaciones.trim(),
    }
    const e = {
      motivo:
        (!v.motivo && 'Indica el motivo de la consulta.') ||
        (v.motivo.length < 3 && 'El motivo debe tener al menos 3 caracteres.') ||
        '',
      diagnostico:
        (!v.diagnostico && 'Registra el diagnóstico.') ||
        (v.diagnostico.length < 5 && 'El diagnóstico debe tener al menos 5 caracteres.') ||
        '',
      tratamiento:
        (!v.tratamiento && 'Indica el tratamiento o la indicación médica.') ||
        (v.tratamiento.length < 5 && 'El tratamiento debe tener al menos 5 caracteres.') ||
        '',
    }
    setErrores(e)
    if (!pacienteActual) return mostrarAviso('No hay pacientes disponibles.', 'error')
    if (Object.values(e).some(Boolean)) return

    setConsultasLista((prev) => [
      {
        id: Date.now(),
        pac: pacienteActual.id,
        med: medicoId,
        fecha: hoy(),
        motivo: v.motivo,
        diagnostico: v.diagnostico,
        tratamiento: v.tratamiento,
        observaciones: v.observaciones || 'Sin observaciones adicionales.',
      },
      ...prev,
    ])
    registrarEvento('Consulta médica registrada')
    mostrarAviso('Consulta guardada correctamente')
    setFormulario(inicial)
    setErrores({})
  }

  const campoTexto = (clave, etiqueta, placeholder, minAltura = '') => (
    <div>
      <label className="lbl" htmlFor={`con_${clave}`}>
        {etiqueta}
      </label>
      <textarea
        id={`con_${clave}`}
        className={`field ${minAltura} resize-y ${errores[clave] ? 'border-bad-txt' : ''}`}
        placeholder={placeholder}
        value={formulario[clave]}
        onChange={(e) => setFormulario({ ...formulario, [clave]: e.target.value })}
      />
      {errores[clave] && <small className="err">{errores[clave]}</small>}
    </div>
  )

  return (
    <>
      <Head titulo="Consultas médicas" subtitulo="Registra la atención y revisa las consultas anteriores.">
        {pacienteActual && <span className="tag t-info">{historial.length} consulta(s) previas</span>}
      </Head>

      {!activos.length ? (
        <div className="card">
          <p className="text-mut">No tienes pacientes asignados. Recepción debe asignarte un paciente.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="card">
            <h3 className="text-base mb-3 flex items-center gap-1.5">
              <FiClipboard size={16} className="text-acc2" /> Nueva consulta
            </h3>

            <label className="lbl" htmlFor="con_pac" style={{ marginTop: 0 }}>
              Paciente
            </label>
            <select
              id="con_pac"
              className="field"
              value={pacienteActual?.id ?? ''}
              onChange={(e) => {
                setPacienteSel(+e.target.value)
                setErrores({})
              }}
            >
              {activos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} · {p.edad} años
                </option>
              ))}
            </select>

            <div>
              <label className="lbl" htmlFor="con_motivo">
                Motivo de consulta
              </label>
              <input
                id="con_motivo"
                className={`field ${errores.motivo ? 'border-bad-txt' : ''}`}
                placeholder="Ej. Dolor abdominal de tres días"
                value={formulario.motivo}
                onChange={(e) => setFormulario({ ...formulario, motivo: e.target.value })}
              />
              {errores.motivo && <small className="err">{errores.motivo}</small>}
            </div>

            {campoTexto('diagnostico', 'Diagnóstico', 'Descripción del diagnóstico', 'min-h-[80px]')}
            {campoTexto('tratamiento', 'Tratamiento', 'Medicación, indicaciones y seguimiento', 'min-h-[80px]')}
            {campoTexto(
              'observaciones',
              'Observaciones médicas',
              'Signos vitales, evolución u otras notas (opcional)',
              'min-h-[64px]',
            )}

            <div className="flex gap-2 mt-4 flex-wrap">
              <button className="btn btn-p" onClick={guardar}>
                <FiSave size={15} /> Guardar consulta
              </button>
              <button
                className="btn"
                onClick={() => {
                  setFormulario(inicial)
                  setErrores({})
                }}
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 pb-3 border-b border-line">
              <span className="ava">
                <FiUser size={15} />
              </span>
              <div className="min-w-0">
                <b className="block text-[14px] truncate">{pacienteActual?.nom}</b>
                <small className="text-mut">
                  {pacienteActual?.edad} años · {pacienteActual?.sangre} · CI {pacienteActual?.ci}
                </small>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <FiActivity size={15} className="text-acc2" /> Antecedentes
              </h4>
              <p className="text-[12px] text-mut mt-1">
                {pacienteActual?.antecedentes || 'Sin antecedentes registrados.'}
              </p>
            </div>

            <h4 className="text-sm font-bold mt-4 mb-2">Consultas anteriores</h4>
            <div className="border-l-2 border-line ml-1.5 pl-4 max-h-[440px] overflow-y-auto pr-1">
              {historial.length ? (
                historial.map((h) => (
                  <div key={h.id ?? `${h.fecha}-${h.diagnostico}`} className="relative pb-4">
                    <span className="absolute -left-[23px] top-[5px] w-[10px] h-[10px] rounded-full bg-acc2" />
                    <small className="text-mut">{formatearFecha(h.fecha)}</small>
                    <b className="block text-[13px]">{h.diagnostico}</b>
                    <span className="text-[12px] text-mut block">
                      <b>Motivo:</b> {h.motivo ?? 'No registrado'}
                    </span>
                    <span className="text-[12px] text-mut block">
                      <b>Tratamiento:</b> {h.tratamiento}
                    </span>
                    {h.observaciones && (
                      <span className="text-[12px] text-mut block">
                        <b>Observaciones:</b> {h.observaciones}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-mut text-[13px]">Este paciente aún no tiene consultas registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
