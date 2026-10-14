import { useState } from 'react'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { ESTADOS, tagEst } from '../data/utils'

export default function Citas({ cit, setCit, pac, toast }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ pac: '', hora: '12:00', mot: '' })
  const [err, setErr] = useState('')

  const activos = pac.filter((p) => p.estado)

  const setEstado = (id, est) => {
    setCit((prev) => prev.map((c) => (c.id === id ? { ...c, est } : c)))
    toast('Estado actualizado')
  }

  const save = () => {
    const mot = form.mot.trim()
    const error = !form.hora
      ? 'Elige la hora.'
      : mot.length < 3
        ? 'Describe el motivo (mínimo 3 caracteres).'
        : ''
    setErr(error)
    if (error) return
    setCit((prev) =>
      [...prev, { id: Date.now(), pac: +form.pac, hora: form.hora, mot, est: 'Pendiente' }].sort(
        (a, b) => a.hora.localeCompare(b.hora),
      ),
    )
    toast('Cita agendada')
    setOpen(false)
    setForm({ pac: '', hora: '12:00', mot: '' })
  }

  return (
    <>
      <Head title="Citas" sub="Agenda del día.">
        <button
          className="btn btn-p"
          onClick={() => {
            setForm({ pac: String(activos[0]?.id ?? ''), hora: '12:00', mot: '' })
            setErr('')
            setOpen(true)
          }}
        >
          + Nueva cita
        </button>
      </Head>

      <div className="card overflow-x-auto">
        <table className="tbl w-full border-collapse">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cit.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.hora}</b>
                </td>
                <td>{pac.find((p) => p.id === c.pac)?.nom ?? '—'}</td>
                <td>{c.mot}</td>
                <td>
                  <span className={`tag ${tagEst[c.est]}`}>{c.est}</span>
                </td>
                <td>
                  <select
                    className="inp-sm"
                    value={c.est}
                    onChange={(e) => setEstado(c.id, e.target.value)}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Nueva cita" saveLabel="Agendar cita" onClose={() => setOpen(false)} onSave={save}>
          <label className="lbl" htmlFor="c_pac" style={{ marginTop: 0 }}>
            Paciente
          </label>
          <select
            id="c_pac"
            className="field"
            value={form.pac}
            onChange={(e) => setForm({ ...form, pac: e.target.value })}
          >
            {activos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lbl" htmlFor="c_hora">
                Hora
              </label>
              <input
                id="c_hora"
                className="field"
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              />
            </div>
            <div>
              <label className="lbl" htmlFor="c_mot">
                Motivo
              </label>
              <input
                id="c_mot"
                className={`field ${err ? 'border-bad' : ''}`}
                value={form.mot}
                onChange={(e) => setForm({ ...form, mot: e.target.value })}
              />
              {err && <small className="err">{err}</small>}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
