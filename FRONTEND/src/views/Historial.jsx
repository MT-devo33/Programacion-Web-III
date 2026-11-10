import { FiActivity, FiAlertCircle, FiClipboard, FiFileText, FiHeart } from 'react-icons/fi'
import Head from '../components/Head'
import { formatearFecha, iniciales } from '../data/utils'

export default function Historial({
  pacientesLista,
  consultasLista,
  medicoId,
  pacienteSel,
  setPacienteSel,
}) {
  const paciente = pacientesLista.find((p) => p.id === pacienteSel) ?? pacientesLista[0]
  const historial = consultasLista
    .filter((c) => c.pac === paciente?.id && c.med === medicoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <>
      <Head titulo="Historial clínico" subtitulo="Antecedentes, diagnósticos y tratamientos del paciente.">
        <span className="tag t-info">{historial.length} consulta(s) registradas</span>
      </Head>

      {!pacientesLista.length ? (
        <div className="card">
          <p className="text-mut">No tienes pacientes asignados para consultar.</p>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1">
                <label className="lbl" htmlFor="his_pac" style={{ marginTop: 0 }}>
                  Seleccionar paciente
                </label>
                <select
                  id="his_pac"
                  className="field"
                  value={paciente?.id ?? ''}
                  onChange={(e) => setPacienteSel(+e.target.value)}
                >
                  {pacientesLista.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} · CI {p.ci}
                    </option>
                  ))}
                </select>
              </div>
              {paciente && (
                <span className={`tag py-1.5 ${paciente.estado ? 't-ok' : 't-mut'}`}>
                  {paciente.estado ? 'Paciente activo' : 'Paciente de baja'}
                </span>
              )}
            </div>

            {paciente && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line">
                <span className="ava" style={{ width: 48, height: 48, fontSize: 16 }}>
                  {iniciales(paciente.nom)}
                </span>
                <div className="min-w-0">
                  <b className="block text-base">{paciente.nom}</b>
                  <small className="text-mut">
                    {paciente.edad} años · CI {paciente.ci} · {paciente.tel}
                  </small>
                </div>
                <span className="ml-auto tag t-info">{paciente.sangre}</span>
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-base mb-2 flex items-center gap-1.5">
                  <FiHeart size={16} className="text-bad" /> Antecedentes
                </h3>
                <p className="text-[13px] text-mut">
                  {paciente?.antecedentes || 'Sin antecedentes registrados.'}
                </p>
              </div>

              <div className="card">
                <h3 className="text-base mb-3 flex items-center gap-1.5">
                  <FiActivity size={16} className="text-acc2" /> Resumen del paciente
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="rounded-lg bg-surface px-3 py-2">
                    <small className="text-mut block">Consultas</small>
                    <b className="text-lg">{historial.length}</b>
                  </div>
                  <div className="rounded-lg bg-surface px-3 py-2">
                    <small className="text-mut block">Última atención</small>
                    <b>{historial[0] ? formatearFecha(historial[0].fecha) : '—'}</b>
                  </div>
                  <div className="rounded-lg bg-surface px-3 py-2">
                    <small className="text-mut block">Edad</small>
                    <b>{paciente?.edad} años</b>
                  </div>
                  <div className="rounded-lg bg-surface px-3 py-2">
                    <small className="text-mut block">Grupo sanguíneo</small>
                    <b>{paciente?.sangre}</b>
                  </div>
                </div>
                <p className="text-[11px] text-mut mt-3 flex items-start gap-1.5">
                  <FiAlertCircle size={13} className="mt-[2px] shrink-0" />
                  Verifica las alergias antes de indicar cualquier tratamiento.
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-base mb-3 flex items-center gap-1.5">
                <FiFileText size={16} className="text-acc2" /> Consultas y tratamientos
              </h3>
              {historial.length ? (
                <div className="border-l-2 border-line ml-1.5 pl-4">
                  {historial.map((h) => (
                    <div key={h.id ?? `${h.fecha}-${h.diagnostico}`} className="relative pb-5">
                      <span className="absolute -left-[23px] top-[5px] w-[10px] h-[10px] rounded-full bg-acc2" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <small className="text-mut">{formatearFecha(h.fecha)}</small>
                        <span className="tag t-mut">{h.motivo ?? 'Consulta'}</span>
                      </div>
                      <b className="block text-[14px] mt-0.5">{h.diagnostico}</b>
                      <span className="text-[12px] text-mut block">
                        <b>Tratamiento:</b> {h.tratamiento}
                      </span>
                      {h.observaciones && (
                        <span className="text-[12px] text-mut block">
                          <b>Observaciones:</b> {h.observaciones}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiClipboard size={28} className="text-mut mx-auto mb-2" />
                  <p className="text-mut text-[13px]">
                    Este paciente aún no tiene consultas registradas contigo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
