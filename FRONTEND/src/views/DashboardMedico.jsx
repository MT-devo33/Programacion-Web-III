import { FiClipboard, FiClock, FiUsers, FiActivity } from 'react-icons/fi'
import Bars from '../components/Bars'
import Head from '../components/Head'
import Stat from '../components/Stat'
import { agruparPor, etiquetaEstado, formatearFecha, hoy, iniciales, ordenarCitas } from '../data/utils'

export default function DashboardMedico({
  citas,
  pacientes,
  consultas,
  medicoId,
  medico,
  alAtender,
  setVista,
}) {
  const fechaHoy = hoy()
  const propias = citas.filter((c) => c.med === medicoId)
  const hoyCitas = ordenarCitas(propias.filter((c) => c.fecha === fechaHoy))
  const proximas = ordenarCitas(
    propias.filter(
      (c) =>
        c.fecha >= fechaHoy &&
        (c.estado === 'Pendiente' || c.estado === 'Confirmada' || c.estado === 'En espera'),
    ),
  )
  const atendidos = new Set(consultas.filter((c) => c.med === medicoId).map((c) => c.pac))
  const misConsultas = consultas
    .filter((c) => c.med === medicoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 4)
  const consultasHoy = consultas.filter((c) => c.med === medicoId && c.fecha === fechaHoy).length

  return (
    <>
      <Head
        titulo={`Hola, ${medico?.nom?.replace('Dra. ', '').replace('Dr. ', '') ?? 'doctor'}`}
        subtitulo={`${medico?.especialidad ?? 'Atención médica'} · ${medico?.consultorio ?? 'Consultorio'}`}
      >
        <span className="tag t-info">Hoy · {formatearFecha(fechaHoy)}</span>
      </Head>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icono={FiClock}
          etiqueta="Citas de hoy"
          valor={hoyCitas.length}
          detalle={`${hoyCitas.filter((c) => c.estado === 'Atendida').length} atendidas`}
          tono="warn"
        />
        <Stat
          icono={FiActivity}
          etiqueta="Próximas atenciones"
          valor={proximas.length}
          detalle="Pendientes o confirmadas"
          tono="acc"
        />
        <Stat
          icono={FiUsers}
          etiqueta="Pacientes atendidos"
          valor={atendidos.size}
          detalle={`${pacientes.length} pacientes asignados`}
          tono="ok"
        />
        <Stat
          icono={FiClipboard}
          etiqueta="Consultas registradas"
          valor={consultas.filter((c) => c.med === medicoId).length}
          detalle={`${consultasHoy} hoy`}
          tono="info"
        />
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base">Agenda de hoy</h3>
            <button className="link text-[12px]" onClick={() => setVista('agm')}>
              Ver semana
            </button>
          </div>
          {hoyCitas.length ? (
            <div className="divide-y divide-line">
              {hoyCitas.map((c) => {
                const p = pacientes.find((x) => x.id === c.pac)
                const atendible = c.estado !== 'Atendida' && c.estado !== 'Cancelada'
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
                    <button
                      className="btn btn-s shrink-0"
                      disabled={!atendible}
                      onClick={() => alAtender(c.pac)}
                    >
                      Atender
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-mut py-4">No tienes citas programadas para hoy.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-base mb-3">Resumen de actividad</h3>
          <Bars datos={agruparPor(propias, (c) => c.estado)} />
          <p className="text-[11px] text-mut mt-3">
            Distribución de tus citas registradas en el sistema.
          </p>
        </div>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base">Consultas recientes</h3>
            <button className="link text-[12px]" onClick={() => setVista('con')}>
              Registrar consulta
            </button>
          </div>
          {misConsultas.length ? (
            misConsultas.map((c) => {
              const p = pacientes.find((x) => x.id === c.pac)
              return (
                <div key={c.id} className="flex items-start gap-2.5 py-2 border-b border-line last:border-0">
                  <span className="ava">{iniciales(p?.nom ?? 'P')}</span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[13px] truncate">{p?.nom ?? 'Paciente'}</b>
                    <small className="text-mut block truncate">{c.diagnostico}</small>
                    <small className="text-[10px] text-mut">{formatearFecha(c.fecha)}</small>
                  </span>
                </div>
              )
            })
          ) : (
            <p className="text-mut py-4">Aún no registraste consultas.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-base mb-3">Accesos rápidos</h3>
          <div className="grid gap-2">
            <button className="btn justify-start" onClick={() => setVista('agm')}>
              <FiClock size={16} /> Mi agenda semanal
            </button>
            <button className="btn justify-start" onClick={() => setVista('misp')}>
              <FiUsers size={16} /> Mis pacientes
            </button>
            <button className="btn justify-start" onClick={() => setVista('his')}>
              <FiClipboard size={16} /> Historial clínico
            </button>
          </div>
          <p className="text-[11px] text-mut mt-3">
            Solo se muestran los pacientes y citas asociados a tu usuario.
          </p>
        </div>
      </div>
    </>
  )
}
