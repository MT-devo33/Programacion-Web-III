import { useState } from 'react'
import Head from '../components/Head'
import { today } from '../data/utils'

export default function Consultas({ pac, con, setCon, selPac, setSelPac, toast, addLog }) {
  const [dx, setDx] = useState('')
  const [tx, setTx] = useState('')

  const activos = pac.filter((p) => p.estado)
  const actual = pac.find((p) => p.id === selPac) ?? activos[0]
  const hist = con.filter((c) => c.pac === actual?.id)

  const save = () => {
    if (dx.trim().length < 5) return toast('El diagnóstico debe tener al menos 5 caracteres')
    setCon((prev) => [
      { pac: actual.id, fecha: today(), dx: dx.trim(), tx: tx || 'Sin tratamiento indicado' },
      ...prev,
    ])
    addLog('Consulta registrada')
    toast('Consulta guardada')
    setDx('')
    setTx('')
  }

  return (
    <>
      <Head title="Consultas médicas" sub="Registra el diagnóstico y revisa el historial." />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <h3 className="text-base mb-3">Nueva consulta</h3>
          <label className="lbl mt-0" htmlFor="con_pac">
            Paciente
          </label>
          <select
            id="con_pac"
            className="field"
            value={actual?.id ?? ''}
            onChange={(e) => setSelPac(+e.target.value)}
          >
            {activos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
          <label className="lbl" htmlFor="con_dx">
            Diagnóstico
          </label>
          <textarea
            id="con_dx"
            className="field min-h-[84px] resize-y"
            value={dx}
            onChange={(e) => setDx(e.target.value)}
          />
          <label className="lbl" htmlFor="con_tx">
            Tratamiento
          </label>
          <textarea
            id="con_tx"
            className="field min-h-[84px] resize-y"
            value={tx}
            onChange={(e) => setTx(e.target.value)}
          />
          <button className="btn btn-p mt-4" onClick={save}>
            Guardar consulta
          </button>
        </div>

        <div className="card">
          <h3 className="text-base mb-3">Historial de {actual?.nom.split(' ')[0]}</h3>
          <div className="border-l-2 border-line ml-1.5 pl-4">
            {hist.length ? (
              hist.map((h, i) => (
                <div key={i} className="relative pb-4">
                  <span className="absolute -left-[23px] top-[5px] w-[10px] h-[10px] rounded-full bg-acc" />
                  <small className="text-mut">{h.fecha}</small>
                  <br />
                  <b>{h.dx}</b>
                  <br />
                  {h.tx}
                </div>
              ))
            ) : (
              <p className="text-mut">Este paciente aún no tiene consultas registradas.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
