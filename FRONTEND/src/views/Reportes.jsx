import { useState } from 'react'
import Head from '../components/Head'
import { today } from '../data/utils'

const pdfDoc = (title, user, toast) => {
  if (!window.jspdf) {
    toast('No se pudo cargar la librería de PDF. Revisa tu conexión.')
    return null
  }
  const d = new window.jspdf.jsPDF()
  d.setFontSize(16)
  d.text('SGP - ' + title, 14, 18)
  d.setFontSize(9)
  d.setTextColor(110)
  d.text('Generado el ' + new Date().toLocaleString('es-BO') + ' por ' + user, 14, 25)
  d.setTextColor(0)
  d.setFontSize(11)
  return d
}

const pdfLines = (d, arr, y) => {
  for (const t of arr) {
    const w = d.splitTextToSize(t, 180)
    if (y + w.length * 6 > 280) {
      d.addPage()
      y = 20
    }
    d.text(w, 14, y)
    y += w.length * 6 + 1
  }
  return y
}

export default function Reportes({ pac, con, user, toast, addLog }) {
  const [pacId, setPacId] = useState(String(pac[0]?.id ?? ''))
  const [d1, setD1] = useState('2026-08-01')
  const [d2, setD2] = useState(today())
  const [err, setErr] = useState('')

  const ficha = () => {
    const p = pac.find((x) => x.id === +pacId)
    const d = pdfDoc('Ficha clínica', user, toast)
    if (!d || !p) return
    let y = pdfLines(
      d,
      [
        'Paciente: ' + p.nom,
        'CI: ' + p.ci + '   Edad: ' + p.edad + '   Sangre: ' + p.sangre,
        'Teléfono: ' + p.tel,
        'Estado: ' + (p.estado ? 'Activo' : 'De baja'),
        '',
        'Historial de consultas',
      ],
      36,
    )
    const h = con.filter((c) => c.pac === p.id)
    pdfLines(
      d,
      h.length
        ? h.flatMap((c) => [c.fecha + ' - ' + c.dx, '   Tratamiento: ' + c.tx])
        : ['Sin consultas registradas.'],
      y + 2,
    )
    d.save('ficha_' + p.nom.split(' ')[0].toLowerCase() + '.pdf')
    addLog('Ficha clínica exportada')
    toast('Ficha descargada')
  }

  const porRango = () => {
    if (!d1 || !d2 || d1 > d2) {
      setErr('Elige un rango válido: "Desde" no puede ser posterior a "Hasta".')
      return
    }
    const r = con
      .filter((c) => c.fecha >= d1 && c.fecha <= d2)
      .sort((x, y) => x.fecha.localeCompare(y.fecha))
    if (!r.length) {
      setErr('No hay consultas en ese rango.')
      return
    }
    setErr('')
    const d = pdfDoc('Consultas del ' + d1 + ' al ' + d2, user, toast)
    if (!d) return
    pdfLines(
      d,
      ['Total: ' + r.length + ' consultas', ''].concat(
        r.flatMap((c) => [
          c.fecha + ' | ' + (pac.find((p) => p.id === c.pac)?.nom ?? '—'),
          '   Dx: ' + c.dx,
          '   Tx: ' + c.tx,
          '',
        ]),
      ),
      36,
    )
    d.save('consultas_' + d1 + '_' + d2 + '.pdf')
    addLog('Reporte de consultas exportado')
    toast('Reporte descargado')
  }

  return (
    <>
      <Head title="Reportes" sub="Genera PDF para imprimir o archivar." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-base mb-3">Ficha clínica del paciente</h3>
          <label className="lbl mt-0" htmlFor="rpac">
            Paciente
          </label>
          <select id="rpac" className="field" value={pacId} onChange={(e) => setPacId(e.target.value)}>
            {pac.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
          <button className="btn btn-p mt-4" onClick={ficha}>
            Descargar PDF
          </button>
        </div>

        <div className="card">
          <h3 className="text-base mb-3">Consultas por rango de fechas</h3>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lbl mt-0" htmlFor="d1">
                Desde
              </label>
              <input id="d1" className="field" type="date" value={d1} onChange={(e) => setD1(e.target.value)} />
            </div>
            <div>
              <label className="lbl mt-0" htmlFor="d2">
                Hasta
              </label>
              <input id="d2" className="field" type="date" value={d2} onChange={(e) => setD2(e.target.value)} />
            </div>
          </div>
          {err && <small className="err">{err}</small>}
          <button className="btn btn-p mt-4" onClick={porRango}>
            Generar PDF
          </button>
        </div>
      </div>
    </>
  )
}
