import { useState } from 'react'
import { FiCalendar, FiCheckCircle, FiClock, FiEdit2, FiPlus, FiTrash2, FiUser } from 'react-icons/fi'
import Confirm from '../components/Confirm'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { DIAS } from '../data/seed'
import { diaSemanaDeFecha, hoy } from '../data/utils'

const vacio = { dia: 'Lunes', inicio: '08:00', fin: '12:00', consultorio: '', estado: 1 }

export default function Agendas({
  medicosLista,
  agendasLista,
  setAgendasLista,
  citasLista = [],
  mostrarAviso,
  registrarEvento,
}) {
  const [medicoSel, setMedicoSel] = useState(String(medicosLista[0]?.id ?? ''))
  const [formulario, setFormulario] = useState(null)
  const [errores, setErrores] = useState({})
  const [confirmar, setConfirmar] = useState(null)

  const medico = medicosLista.find((m) => m.id === +medicoSel)
  const bloques = agendasLista
    .filter((a) => a.med === +medicoSel)
    .sort((a, b) => DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia) || a.inicio.localeCompare(b.inicio))

  const abrir = (bloque) => {
    setErrores({})
    setFormulario(
      bloque
        ? { ...bloque, inicio: bloque.inicio, fin: bloque.fin }
        : { ...vacio, consultorio: medico?.consultorio ?? '' },
    )
  }

  const validar = (v) => {
    const otros = agendasLista.filter((a) => a.med === +medicoSel && a.id !== formulario?.id)
    const seCruza = otros.some((a) => {
      if (a.dia !== v.dia) return false
      return v.inicio < a.fin && v.fin > a.inicio
    })
    return {
      inicio:
        (!v.inicio && 'Indica la hora de inicio.') ||
        (v.fin && v.inicio >= v.fin ? 'La hora de inicio debe ser menor que la de fin.' : '') ||
        (seCruza && 'Se superpone con otro bloque del mismo día.') ||
        '',
      fin: !v.fin && 'Indica la hora de fin.',
      consultorio: !/^[A-Za-z0-9-]{2,10}$/.test(v.consultorio) && 'Código de consultorio de 2 a 10 caracteres.',
    }
  }

  const guardar = () => {
    const v = {
      dia: formulario.dia,
      inicio: formulario.inicio,
      fin: formulario.fin,
      consultorio: formulario.consultorio.trim().toUpperCase(),
      estado: formulario.estado ? 1 : 0,
    }
    const e = validar(v)
    setErrores(e)
    if (Object.values(e).some(Boolean)) return

    if (formulario.id) {
      setAgendasLista((prev) => prev.map((a) => (a.id === formulario.id ? { ...a, ...v } : a)))
      registrarEvento('Horario de médico editado')
      mostrarAviso('Horario actualizado')
    } else {
      setAgendasLista((prev) => [...prev, { id: Date.now(), med: +medicoSel, ...v }])
      registrarEvento('Horario de médico asignado')
      mostrarAviso('Horario asignado')
    }
    setFormulario(null)
  }

  const alternarDisponibilidad = (bloque) => {
    setAgendasLista((prev) =>
      prev.map((a) => (a.id === bloque.id ? { ...a, estado: a.estado ? 0 : 1 } : a)),
    )
    mostrarAviso(bloque.estado ? 'Bloque marcado como no disponible' : 'Bloque habilitado')
    registrarEvento(bloque.estado ? 'Disponibilidad desactivada' : 'Disponibilidad activada')
  }

  const eliminar = () => {
    if (!confirmar) return
    setAgendasLista((prev) => prev.filter((a) => a.id !== confirmar.id))
    registrarEvento('Horario de médico eliminado')
    mostrarAviso('Horario eliminado')
    setConfirmar(null)
  }

  const citasDelBloque = (bloque) =>
    citasLista.filter(
      (c) =>
        c.med === +medicoSel &&
        c.fecha >= hoy() &&
        c.estado !== 'Cancelada' &&
        diaSemanaDeFecha(c.fecha) === bloque.dia,
    ).length

  return (
    <>
      <Head titulo="Agendas médicas" subtitulo="Organiza la disponibilidad y los horarios de atención.">
        <button className="btn btn-p" onClick={() => abrir(null)} disabled={!medico}>
          <FiPlus size={16} />
          Nuevo horario
        </button>
      </Head>

      <div className="card mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[230px] flex-1">
            <label className="lbl" htmlFor="ag_med" style={{ marginTop: 0 }}>
              Médico
            </label>
            <select
              id="ag_med"
              className="field"
              value={medicoSel}
              onChange={(e) => setMedicoSel(e.target.value)}
            >
              {medicosLista.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom} · {m.especialidad}
                </option>
              ))}
            </select>
          </div>
          {medico && (
            <div className="flex flex-wrap gap-2 pb-1">
              <span className="tag t-info inline-flex items-center gap-1.5 py-1.5">
                <FiUser size={13} /> {medico.especialidad}
              </span>
              <span className={`tag py-1.5 ${medico.estado ? 't-ok' : 't-mut'}`}>
                {medico.estado ? 'Médico activo' : 'Médico inactivo'}
              </span>
              <span className="tag t-mut py-1.5">{medico.consultorio}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h3 className="text-base mb-3">Horarios asignados</h3>
          <div className="overflow-x-auto">
            <table className="tbl w-full border-collapse">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Horario</th>
                  <th>Consultorio</th>
                  <th>Citas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bloques.map((b) => (
                  <tr key={b.id} style={b.estado ? undefined : { opacity: 0.6 }}>
                    <td>
                      <b className="text-[13px]">{b.dia}</b>
                    </td>
                    <td className="whitespace-nowrap">
                      {b.inicio} – {b.fin}
                    </td>
                    <td>{b.consultorio}</td>
                    <td>
                      <span className="tag t-info">{citasDelBloque(b)}</span>
                    </td>
                    <td>
                      <span className={`tag ${b.estado ? 't-ok' : 't-mut'}`}>
                        {b.estado ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap min-w-[210px]">
                        <button className="btn btn-s btn-edit" onClick={() => abrir(b)}>
                          <FiEdit2 size={13} /> Editar
                        </button>
                        <button
                          className={`btn btn-s ${b.estado ? 'btn-d' : ''}`}
                          onClick={() => alternarDisponibilidad(b)}
                        >
                          <FiCheckCircle size={13} />
                          {b.estado ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                        <button className="btn btn-s btn-d" onClick={() => setConfirmar(b)}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!bloques.length && (
                  <tr>
                    <td colSpan={6} className="text-mut">
                      Este médico aún no tiene horarios asignados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-base mb-3 flex items-center gap-1.5">
            <FiCalendar size={16} className="text-acc2" /> Semana de atención
          </h3>
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-7 gap-2">
              {DIAS.map((dia) => {
                const delDia = bloques.filter((b) => b.dia === dia)
                return (
                  <div key={dia} className="rounded-lg border border-line bg-surface p-1.5 min-h-[132px]">
                    <small className="block text-center text-[10px] uppercase text-mut mb-1.5">
                      {dia.slice(0, 3)}
                    </small>
                    <div className="space-y-1">
                      {delDia.map((b) => (
                        <span
                          key={b.id}
                          className={`block rounded px-1 py-1 text-[10px] leading-tight text-center font-semibold ${
                            b.estado ? 'bg-info text-info-txt' : 'bg-line text-mut line-through'
                          }`}
                          title={`${b.inicio}–${b.fin} · ${b.consultorio}`}
                        >
                          {b.inicio}
                          <br />
                          {b.fin}
                        </span>
                      ))}
                      {!delDia.length && <span className="block text-center text-[10px] text-mut">—</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-[11px] text-mut mt-3 flex items-center gap-1.5">
            <FiClock size={13} /> Los bloques tachados no están disponibles para agendar.
          </p>
        </div>
      </div>

      {formulario && (
        <Modal
          titulo={formulario.id ? 'Editar horario' : 'Asignar horario'}
          etiquetaGuardar="Guardar horario"
          alCerrar={() => setFormulario(null)}
          alGuardar={guardar}
        >
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lbl" htmlFor="ag_dia" style={{ marginTop: 0 }}>
                Día
              </label>
              <select
                id="ag_dia"
                className="field"
                value={formulario.dia}
                onChange={(e) => setFormulario({ ...formulario, dia: e.target.value })}
              >
                {DIAS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl" htmlFor="ag_cons" style={{ marginTop: 0 }}>
                Consultorio
              </label>
              <input
                id="ag_cons"
                className={`field ${errores.consultorio ? 'border-bad-txt' : ''}`}
                value={formulario.consultorio}
                onChange={(e) => setFormulario({ ...formulario, consultorio: e.target.value })}
              />
              {errores.consultorio && <small className="err">{errores.consultorio}</small>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lbl" htmlFor="ag_ini">
                Hora de inicio
              </label>
              <input
                id="ag_ini"
                type="time"
                className={`field ${errores.inicio ? 'border-bad-txt' : ''}`}
                value={formulario.inicio}
                onChange={(e) => setFormulario({ ...formulario, inicio: e.target.value })}
              />
              {errores.inicio && <small className="err">{errores.inicio}</small>}
            </div>
            <div>
              <label className="lbl" htmlFor="ag_fin">
                Hora de fin
              </label>
              <input
                id="ag_fin"
                type="time"
                className={`field ${errores.fin ? 'border-bad-txt' : ''}`}
                value={formulario.fin}
                onChange={(e) => setFormulario({ ...formulario, fin: e.target.value })}
              />
              {errores.fin && <small className="err">{errores.fin}</small>}
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 font-medium text-[13px]">
            <input
              type="checkbox"
              className="w-auto"
              checked={!!formulario.estado}
              onChange={(e) => setFormulario({ ...formulario, estado: e.target.checked ? 1 : 0 })}
            />
            Disponible para agendar citas
          </label>
        </Modal>
      )}

      {confirmar && (
        <Confirm
          titulo="Eliminar horario"
          mensaje={`Se eliminará el bloque de ${confirmar.dia} de ${confirmar.inicio} a ${confirmar.fin}. Las citas ya registradas no se modifican.`}
          etiqueta="Eliminar horario"
          alCerrar={() => setConfirmar(null)}
          alConfirmar={eliminar}
        />
      )}
    </>
  )
}
