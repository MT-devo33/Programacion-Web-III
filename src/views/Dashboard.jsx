import Bars from '../components/Bars'
import Head from '../components/Head'
import { groupBy, tagEst } from '../data/utils'

export default function Dashboard({ pac, cit, pn }) {
  const activos = pac.filter((p) => p.estado)
  const proximas = cit.filter((c) => c.est === 'Pendiente' || c.est === 'En espera')

  return (
    <>
      <Head title="Dashboard" sub="Resumen de actividad del consultorio." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card kpi border-l-4 border-l-acc">
          <small className="block text-mut">Pacientes activos</small>
          <strong className="text-[30px] font-bold">{activos.length}</strong>
        </div>
        <div className="card kpi border-l-4 border-l-warn">
          <small className="block text-mut">Citas de hoy</small>
          <strong className="text-[30px] font-bold">{cit.length}</strong>
        </div>
        <div className="card kpi border-l-4 border-l-ok">
          <small className="block text-mut">Atendidas</small>
          <strong className="text-[30px] font-bold">{cit.filter((c) => c.est === 'Atendida').length}</strong>
        </div>
        <div className="card kpi border-l-4 border-l-bad">
          <small className="block text-mut">Canceladas</small>
          <strong className="text-[30px] font-bold">{cit.filter((c) => c.est === 'Cancelada').length}</strong>
        </div>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <h3 className="text-base mb-3">Citas por estado</h3>
          <Bars data={groupBy(cit, (c) => c.est)} />
        </div>
        <div className="card">
          <h3 className="text-base mb-3">Próximas citas</h3>
          {proximas.length ? (
            proximas.map((c) => (
              <div
                key={c.id}
                className="flex justify-between gap-2 py-2 border-b border-line last:border-0"
              >
                <span>
                  <b>{c.hora}</b> {pn(c.pac)?.nom}
                </span>
                <span className={`tag ${tagEst[c.est]}`}>{c.est}</span>
              </div>
            ))
          ) : (
            <p className="text-mut">No quedan citas pendientes hoy.</p>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="text-base mb-3">Pacientes activos por grupo sanguíneo</h3>
        <Bars data={groupBy(activos, (p) => p.sangre)} />
      </div>
    </>
  )
}
