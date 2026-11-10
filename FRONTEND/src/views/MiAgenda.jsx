import { useState } from 'react'
import { FiCalendar, FiCheckCircle, FiClock, FiPlay, FiUser } from 'react-icons/fi'
import Calendario from '../components/Calendario'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { etiquetaEstado, formatearFecha, hoy, iniciales, ordenarCitas } from '../data/utils'

export default function MiAgenda({
  citasLista,
  setCitasLista,
  pacientesLista,
  agendasLista,
  medicoId,
  medico,
  alAtender,
  mostrarAviso,
  registrarEvento,
}) {
  const propias = citasLista.filter((c) => c.med === medicoId)
  const delDia = ordenarCitas(propias.filter((c) => c.fecha === hoy()))
  const bloques = agendasLista.filter((a) => a.med === medicoId)
  const [citaSel, setCitaSel] = useState(null)

  const marcarAtendida = (cita) => {
    setCitasLista((prev) => prev.map((c) => (c.id === cita.id ? { ...c, estado: 'Atendida' } : c)))
    registrarEvento('Cita marcada como atendida')
    mostrarAviso('Cita marcada como atendida')
    setCitaSel(null)
  }

  const iniciar = (cita) => {
    setCitaSel(null)
    alAtender(cita.pac)
  }

  const pacienteDe = (id) => pacientesLista.find((p) => p.id === id)

  return (
    <>
      <Head
        titulo="Mi agenda"
        subtitulo={`${medico?.nom ?? 'Médico'} · ${medico?.especialidad ?? ''}`}
      >
        <span className="tag t-info">{delDia.length} citas hoy</span>
      </Head>

      <div className="card mb-4">
        <Calendario
          citas={propias}
          pacientes={pacientesLista}
          medicoId={medicoId}
          alSeleccionar={setCitaSel}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card">
          <h3 className="text-base mb-3 flex items-center gap-1.5">
            <FiClock size={16} className="text-acc2" /> Atenciones de hoy
          </h3>
          {delDia.length ? (
            <div className="divide-y divide-line">
              {delDia.map((c) => {
                const p = pacienteDe(c.pac)
                const activa = c.estado !== 'Atendida' && c.estado !== 'Cancelada'
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 flex-wrap sm:flex-nowrap">
                    <span className="w-12 shrink-0 text-center">
                      <b className="block text-sm text-acc2">{c.hora}</b>
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[13px] truncate">{p?.nom ?? 'Paciente'}</b>
                      <small className="text-mut block truncate">{c.motivo}</small>
                    </span>
                    <span className={`tag shrink-0 ${etiquetaEstado[c.estado]}`}>{c.estado}</span>
                    <button className="btn btn-s shrink-0" disabled={!activa} onClick={() => iniciar(c)}>
                      <FiPlay size={13} /> Atender
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-mut py-4">No tienes atenciones programadas para hoy.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-base mb-3 flex items-center gap-1.5">
            <FiCalendar size={16} className="text-acc2" /> Horarios de atención
          </h3>
          {bloques.length ? (
            <div className="space-y-2">
              {bloques
                .sort((a, b) => a.dia.localeCompare(b.dia) || a.inicio.localeCompare(b.inicio))
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-[12px]"
                  >
                    <span>
                      <b>{b.dia}</b>
                      <small className="block text-mut">
                        {b.inicio} – {b.fin} · {b.consultorio}
                      </small>
                    </span>
                    <span className={`tag ${b.estado ? 't-ok' : 't-mut'}`}>
                      {b.estado ? 'Disponible' : 'No disp.'}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-mut">Recepción aún no asignó horarios.</p>
          )}
          <p className="text-[11px] text-mut mt-3">
            Para modificar tu disponibilidad, contacta a Recepción.
          </p>
        </div>
      </div>

      {citaSel && (
        <Modal titulo="Detalle de la cita" alCerrar={() => setCitaSel(null)} ancho="max-w-[520px]">
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <span className="ava" style={{ width: 46, height: 46, fontSize: 15 }}>
              {iniciales(pacienteDe(citaSel.pac)?.nom ?? 'P')}
            </span>
            <div className="min-w-0">
              <b className="block">{pacienteDe(citaSel.pac)?.nom ?? 'Paciente'}</b>
              <small className="text-mut">
                {formatearFecha(citaSel.fecha)} · {citaSel.hora}
              </small>
            </div>
            <span className={`tag ml-auto ${etiquetaEstado[citaSel.estado]}`}>{citaSel.estado}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 text-[13px]">
            <div>
              <small className="text-mut block">Motivo</small>
              <b>{citaSel.motivo}</b>
            </div>
            <div>
              <small className="text-mut block">Paciente</small>
              <b className="inline-flex items-center gap-1">
                <FiUser size={13} /> {pacienteDe(citaSel.pac)?.tel ?? '—'}
              </b>
            </div>
            <div>
              <small className="text-mut block">Edad</small>
              <b>{pacienteDe(citaSel.pac)?.edad ?? '—'} años</b>
            </div>
            <div>
              <small className="text-mut block">Grupo sanguíneo</small>
              <b>{pacienteDe(citaSel.pac)?.sangre ?? '—'}</b>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              className="btn btn-p"
              disabled={citaSel.estado === 'Cancelada' || citaSel.estado === 'Atendida'}
              onClick={() => iniciar(citaSel)}
            >
              <FiPlay size={15} /> Iniciar consulta
            </button>
            <button
              className="btn"
              disabled={citaSel.estado === 'Cancelada' || citaSel.estado === 'Atendida'}
              onClick={() => marcarAtendida(citaSel)}
            >
              <FiCheckCircle size={15} /> Marcar atendida
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
