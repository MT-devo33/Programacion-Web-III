import { useState } from 'react'
import {
  FiCalendar,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiXCircle,
} from 'react-icons/fi'
import Confirm from '../components/Confirm'
import Head from '../components/Head'
import Modal from '../components/Modal'
import {
  ESTADOS_CITA,
  etiquetaEstado,
  formatearFecha,
  hoy,
  ordenarCitas,
} from '../data/utils'

const vacio = () => ({ pac: '', med: '', fecha: hoy(), hora: '09:00', motivo: '' })

export default function Citas({
  citasLista,
  setCitasLista,
  pacientesLista,
  medicosLista,
  mostrarAviso,
  registrarEvento,
}) {
  const [filtro, setFiltro] = useState('')
  const [fechaFiltro, setFechaFiltro] = useState('')
  const [medicoFiltro, setMedicoFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [modal, setModal] = useState(null)
  const [formulario, setFormulario] = useState(vacio())
  const [errores, setErrores] = useState({})
  const [confirmar, setConfirmar] = useState(null)

  const activos = pacientesLista.filter((p) => p.estado)
  const medicosActivos = medicosLista.filter((m) => m.estado)

  const lista = ordenarCitas(
    citasLista.filter((c) => {
      const p = pacientesLista.find((x) => x.id === c.pac)
      const m = medicosLista.find((x) => x.id === c.med)
      const coincide = `${p?.nom ?? ''} ${m?.nom ?? ''} ${c.motivo}`
        .toLowerCase()
        .includes(filtro.toLowerCase())
      return (
        coincide &&
        (!fechaFiltro || c.fecha === fechaFiltro) &&
        (!medicoFiltro || c.med === +medicoFiltro) &&
        (!estadoFiltro || c.estado === estadoFiltro)
      )
    }),
  )

  const abrirNueva = () => {
    const p = activos[0]
    const med = medicosActivos.find((m) => m.id === p?.medicoId) ?? medicosActivos[0]
    setErrores({})
    setFormulario({ ...vacio(), pac: String(p?.id ?? ''), med: String(med?.id ?? '') })
    setModal('nueva')
  }

  const abrirReprogramar = (c) => {
    setErrores({})
    setFormulario({ pac: String(c.pac), med: String(c.med), fecha: c.fecha, hora: c.hora, motivo: c.motivo })
    setModal(c)
  }

  const cambiarPaciente = (id) => {
    const p = pacientesLista.find((x) => x.id === +id)
    const med = medicosActivos.find((m) => m.id === p?.medicoId)
    setFormulario({ ...formulario, pac: id, med: med ? String(med.id) : formulario.med })
  }

  const validar = (v, idActual) => {
    const conflicto = citasLista.some(
      (c) =>
        c.id !== idActual &&
        c.med === +v.med &&
        c.fecha === v.fecha &&
        c.hora === v.hora &&
        c.estado !== 'Cancelada',
    )
    return {
      pac: !v.pac && 'Selecciona un paciente.',
      med: !v.med && 'Selecciona un médico.',
      fecha:
        (!v.fecha && 'Indica la fecha.') ||
        (v.fecha < hoy() && 'La fecha no puede ser anterior a hoy.') ||
        '',
      hora:
        (!v.hora && 'Indica la hora.') ||
        (conflicto && 'Ese médico ya tiene una cita en la misma fecha y hora.') ||
        '',
      motivo:
        (!v.motivo.trim() && 'Describe el motivo de la consulta.') ||
        (v.motivo.trim().length < 3 && 'El motivo debe tener al menos 3 caracteres.') ||
        '',
    }
  }

  const guardar = () => {
    const v = {
      pac: formulario.pac,
      med: formulario.med,
      fecha: formulario.fecha,
      hora: formulario.hora,
      motivo: formulario.motivo.trim(),
    }
    const e = validar(v, modal?.id)
    setErrores(e)
    if (Object.values(e).some(Boolean)) return

    if (modal === 'nueva') {
      setCitasLista((prev) => [
        ...prev,
        { id: Date.now(), pac: +v.pac, med: +v.med, fecha: v.fecha, hora: v.hora, motivo: v.motivo, estado: 'Pendiente' },
      ])
      registrarEvento('Cita registrada')
      mostrarAviso('Cita agendada correctamente')
    } else {
      setCitasLista((prev) =>
        prev.map((c) =>
          c.id === modal.id
            ? { ...c, pac: +v.pac, med: +v.med, fecha: v.fecha, hora: v.hora, motivo: v.motivo, estado: 'Pendiente' }
            : c,
        ),
      )
      registrarEvento('Cita reprogramada')
      mostrarAviso('Cita reprogramada')
    }
    setModal(null)
  }

  const cambiarEstado = (id, estado) => {
    setCitasLista((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)))
    registrarEvento(`Cita marcada como ${estado}`)
    mostrarAviso('Estado de la cita actualizado')
  }

  const cancelarCita = () => {
    if (!confirmar) return
    setCitasLista((prev) => prev.map((c) => (c.id === confirmar.id ? { ...c, estado: 'Cancelada' } : c)))
    registrarEvento('Cita cancelada')
    mostrarAviso('Cita cancelada')
    setConfirmar(null)
  }

  const limpiar = () => {
    setFiltro('')
    setFechaFiltro('')
    setMedicoFiltro('')
    setEstadoFiltro('')
  }

  const nombrePaciente = (id) => pacientesLista.find((p) => p.id === id)?.nom ?? '—'

  return (
    <>
      <Head titulo="Citas" subtitulo={`${lista.length} citas en el listado`}>
        <button className="btn btn-p" onClick={abrirNueva} disabled={!activos.length || !medicosActivos.length}>
          <FiPlus size={16} />
          Nueva cita
        </button>
      </Head>

      <div className="card">
        <div className="flex gap-2.5 flex-wrap mb-3.5 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="lbl" htmlFor="cit_buscar" style={{ marginTop: 0 }}>
              Buscar
            </label>
            <input
              id="cit_buscar"
              className="field"
              placeholder="Paciente, médico o motivo"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="min-w-[145px]">
            <label className="lbl" htmlFor="cit_fecha" style={{ marginTop: 0 }}>
              Fecha
            </label>
            <input
              id="cit_fecha"
              type="date"
              className="field"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </div>
          <div className="min-w-[155px]">
            <label className="lbl" htmlFor="cit_med" style={{ marginTop: 0 }}>
              Médico
            </label>
            <select
              id="cit_med"
              className="field"
              value={medicoFiltro}
              onChange={(e) => setMedicoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {medicosLista.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[135px]">
            <label className="lbl" htmlFor="cit_estado" style={{ marginTop: 0 }}>
              Estado
            </label>
            <select
              id="cit_estado"
              className="field"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTADOS_CITA.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 pb-0.5">
            <button className="btn btn-s" onClick={() => setFechaFiltro(hoy())}>
              <FiCalendar size={14} /> Hoy
            </button>
            <button className="btn btn-s" onClick={limpiar}>
              <FiRefreshCw size={14} /> Limpiar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-mut mb-2">
          <FiFilter size={14} /> {lista.length} cita(s) encontrada(s)
        </div>

        <div className="overflow-x-auto">
          <table className="tbl w-full border-collapse">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const p = pacientesLista.find((x) => x.id === c.pac)
                const m = medicosLista.find((x) => x.id === c.med)
                const finalizada = c.estado === 'Cancelada' || c.estado === 'Atendida'
                return (
                  <tr key={c.id} style={c.estado === 'Cancelada' ? { opacity: 0.65 } : undefined}>
                    <td className="whitespace-nowrap">
                      <b className="block text-[13px]">{formatearFecha(c.fecha)}</b>
                      <small className="text-mut">{c.hora}</small>
                    </td>
                    <td className="text-[13px]">{p?.nom ?? '—'}</td>
                    <td className="text-[13px]">
                      <span className="block">{m?.nom ?? '—'}</span>
                      <small className="text-mut">{m?.especialidad}</small>
                    </td>
                    <td className="text-[13px] max-w-[220px]">{c.motivo}</td>
                    <td>
                      <span className={`tag ${etiquetaEstado[c.estado]}`}>{c.estado}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap min-w-[250px]">
                        <button
                          className="btn btn-s btn-edit"
                          onClick={() => abrirReprogramar(c)}
                          disabled={finalizada}
                          title="Reprogramar cita"
                        >
                          <FiEdit2 size={13} />
                          Reprogramar
                        </button>
                        <button
                          className="btn btn-s btn-d"
                          onClick={() => setConfirmar(c)}
                          disabled={finalizada}
                        >
                          <FiXCircle size={13} />
                          Cancelar
                        </button>
                        <select
                          className="inp-sm"
                          value={c.estado}
                          onChange={(e) => {
                            if (e.target.value === 'Cancelada') setConfirmar(c)
                            else cambiarEstado(c.id, e.target.value)
                          }}
                          aria-label={`Estado de la cita de ${nombrePaciente(c.pac)}`}
                        >
                          {ESTADOS_CITA.map((e) => (
                            <option key={e}>{e}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!lista.length && (
                <tr>
                  <td colSpan={6} className="text-mut">
                    No hay citas que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          titulo={modal === 'nueva' ? 'Nueva cita' : 'Reprogramar cita'}
          etiquetaGuardar={modal === 'nueva' ? 'Agendar cita' : 'Guardar cambios'}
          alCerrar={() => setModal(null)}
          alGuardar={guardar}
          ancho="max-w-[620px]"
        >
          {modal !== 'nueva' && (
            <div className="msg msg-ok mb-2">
              Reprogramando la cita de <b>{nombrePaciente(modal.pac)}</b> del{' '}
              {formatearFecha(modal.fecha)} a las {modal.hora}.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="lbl" htmlFor="cit_pac" style={{ marginTop: 0 }}>
                Paciente
              </label>
              <select
                id="cit_pac"
                className={`field ${errores.pac ? 'border-bad-txt' : ''}`}
                value={formulario.pac}
                onChange={(e) => cambiarPaciente(e.target.value)}
              >
                <option value="">Selecciona un paciente</option>
                {activos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
              {errores.pac && <small className="err">{errores.pac}</small>}
            </div>
            <div>
              <label className="lbl" htmlFor="cit_medico" style={{ marginTop: 0 }}>
                Médico
              </label>
              <select
                id="cit_medico"
                className={`field ${errores.med ? 'border-bad-txt' : ''}`}
                value={formulario.med}
                onChange={(e) => setFormulario({ ...formulario, med: e.target.value })}
              >
                <option value="">Selecciona un médico</option>
                {medicosActivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} · {m.especialidad}
                  </option>
                ))}
              </select>
              {errores.med && <small className="err">{errores.med}</small>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lbl" htmlFor="cit_f">
                Fecha
              </label>
              <input
                id="cit_f"
                type="date"
                min={hoy()}
                className={`field ${errores.fecha ? 'border-bad-txt' : ''}`}
                value={formulario.fecha}
                onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
              />
              {errores.fecha && <small className="err">{errores.fecha}</small>}
            </div>
            <div>
              <label className="lbl" htmlFor="cit_h">
                Hora
              </label>
              <input
                id="cit_h"
                type="time"
                className={`field ${errores.hora ? 'border-bad-txt' : ''}`}
                value={formulario.hora}
                onChange={(e) => setFormulario({ ...formulario, hora: e.target.value })}
              />
              {errores.hora && <small className="err">{errores.hora}</small>}
            </div>
          </div>
          <div>
            <label className="lbl" htmlFor="cit_mot">
              Motivo de la consulta
            </label>
            <input
              id="cit_mot"
              className={`field ${errores.motivo ? 'border-bad-txt' : ''}`}
              placeholder="Ej. Control de presión"
              value={formulario.motivo}
              onChange={(e) => setFormulario({ ...formulario, motivo: e.target.value })}
            />
            {errores.motivo && <small className="err">{errores.motivo}</small>}
          </div>
        </Modal>
      )}

      {confirmar && (
        <Confirm
          titulo="Cancelar cita"
          mensaje={`La cita de ${nombrePaciente(confirmar.pac)} del ${formatearFecha(confirmar.fecha)} a las ${confirmar.hora} pasará a estado "Cancelada".`}
          etiqueta="Cancelar cita"
          alCerrar={() => setConfirmar(null)}
          alConfirmar={cancelarCita}
        />
      )}
    </>
  )
}
