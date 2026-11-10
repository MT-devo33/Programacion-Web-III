import { FiCalendar, FiClock, FiUserCheck, FiUsers } from 'react-icons/fi'
import Bars from '../components/Bars'
import Head from '../components/Head'
import Stat from '../components/Stat'
import {
  agruparPor,
  etiquetaEstado,
  formatearFecha,
  hoy,
  iniciales,
  ordenarCitas,
} from '../data/utils'

export default function Dashboard({ pac, cit, med }) {
  const fechaHoy = hoy()
  const citasHoy = cit.filter((c) => c.fecha === fechaHoy)
  const pendientes = cit.filter(
    (c) => c.fecha >= fechaHoy && (c.estado === 'Pendiente' || c.estado === 'Confirmada' || c.estado === 'En espera'),
  )
  const proximas = ordenarCitas(
    cit.filter((c) => c.estado !== 'Cancelada' && c.estado !== 'Atendida' && c.fecha >= fechaHoy),
  ).slice(0, 6)
  const ultimos = [...pac]
    .sort((a, b) => (b.fechaRegistro ?? '').localeCompare(a.fechaRegistro ?? '') || b.id - a.id)
    .slice(0, 5)
  const activos = pac.filter((p) => p.estado)
  const medicosActivos = med.filter((m) => m.estado)

  const citasPorMedico = medicosActivos.map((m) => [
    m.nom.replace('Dra. ', '').replace('Dr. ', '').split(' ')[0],
    cit.filter((c) => c.med === m.id).length,
  ])

  return (
    <>
      <Head titulo="Panel de Recepción" subtitulo="Resumen operativo de la clínica.">
        <span className="tag t-info">Hoy · {formatearFecha(fechaHoy)}</span>
      </Head>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          icono={FiUsers}
          etiqueta="Pacientes registrados"
          valor={pac.length}
          detalle={`${activos.length} activos`}
          tono="acc"
        />
        <Stat
          icono={FiUserCheck}
          etiqueta="Médicos"
          valor={med.length}
          detalle={`${medicosActivos.length} disponibles`}
          tono="info"
        />
        <Stat
          icono={FiCalendar}
          etiqueta="Citas de hoy"
          valor={citasHoy.length}
          detalle={`${citasHoy.filter((c) => c.estado === 'Atendida').length} atendidas`}
          tono="warn"
        />
        <Stat
          icono={FiClock}
          etiqueta="Citas pendientes"
          valor={pendientes.length}
          detalle="Pendientes y confirmadas"
          tono="ok"
        />
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base">Próximas citas</h3>
            <span className="text-[11px] text-mut">{proximas.length} por atender</span>
          </div>
          {proximas.length ? (
            <div className="divide-y divide-line">
              {proximas.map((c) => {
                const p = pac.find((x) => x.id === c.pac)
                const m = med.find((x) => x.id === c.med)
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-12 shrink-0 text-center">
                      <b className="block text-sm text-acc2">{c.hora}</b>
                      <small className="text-[10px] text-mut">{formatearFecha(c.fecha)}</small>
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[13px] truncate">{p?.nom ?? 'Paciente'}</b>
                      <small className="text-mut block truncate">
                        {c.motivo} · {m?.nom ?? 'Sin médico'}
                      </small>
                    </span>
                    <span className={`tag shrink-0 ${etiquetaEstado[c.estado]}`}>{c.estado}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-mut py-4">No hay citas próximas registradas.</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base">Últimos pacientes</h3>
            <span className="text-[11px] text-mut">Registros recientes</span>
          </div>
          {ultimos.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 py-2 border-b border-line last:border-0">
              <span className="ava">{iniciales(p.nom)}</span>
              <span className="min-w-0 flex-1">
                <b className="block text-[13px] truncate">{p.nom}</b>
                <small className="text-mut block">
                  CI {p.ci} · {formatearFecha(p.fechaRegistro)}
                </small>
              </span>
              <span className={`tag ${p.estado ? 't-ok' : 't-mut'}`}>{p.estado ? 'Activo' : 'De baja'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-base mb-3">Citas por estado</h3>
          <Bars datos={agruparPor(cit, (c) => c.estado)} />
        </div>
        <div className="card">
          <h3 className="text-base mb-3">Citas por médico</h3>
          <Bars datos={citasPorMedico.length ? citasPorMedico : [['Sin médicos', 0]]} />
        </div>
      </div>
    </>
  )
}
