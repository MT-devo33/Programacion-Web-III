import { useState } from 'react'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { SANGRE, ini } from '../data/utils'

const empty = { nom: '', ci: '', edad: '', tel: '', sangre: 'O+' }

const validate = (v, pac, current) => ({
  nom: !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{3,60}$/.test(v.nom) && 'Solo letras y espacios, entre 3 y 60 caracteres.',
  ci:
    (!/^\d{5,9}( ?[A-Z]{2})?$/.test(v.ci) &&
      'Formato: 5 a 9 dígitos y, opcional, el departamento (ej. 1234567 LP).') ||
    (pac.some((x) => x !== current && x.ci === v.ci) && 'Ya existe un paciente con este CI.'),
  edad:
    !(v.edad !== '' && Number.isInteger(+v.edad) && +v.edad >= 0 && +v.edad <= 120) &&
    'Ingresa una edad entre 0 y 120.',
  tel: !/^([67]\d{7}|[2-4]\d{6})$/.test(v.tel) && 'Celular de 8 dígitos (empieza con 6 o 7) o fijo de 7 dígitos.',
})

export default function Pacientes({ pac, setPac, role, toast, addLog }) {
  const [filtro, setFiltro] = useState('')
  const [verBajas, setVerBajas] = useState(false)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})

  const list = pac.filter(
    (p) =>
      (verBajas || p.estado) &&
      (p.nom + p.ci).toLowerCase().includes(filtro.toLowerCase()),
  )

  const open = (p) => {
    setErrors({})
    setForm(p ? { ...p } : { ...empty, id: null, estado: 1 })
  }

  const save = () => {
    const v = {
      nom: form.nom.trim().replace(/\s+/g, ' '),
      ci: form.ci.trim().toUpperCase(),
      edad: form.edad,
      tel: form.tel.trim(),
      sangre: form.sangre,
    }
    const e = validate(v, pac, pac.find((x) => x.id === form.id))
    const bad = Object.values(e).some(Boolean)
    setErrors(e)
    if (bad) return

    const data = { nom: v.nom, ci: v.ci, edad: +v.edad, tel: v.tel, sangre: v.sangre }
    if (form.id) {
      setPac((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...data } : p)))
      addLog('Paciente editado')
    } else {
      setPac((prev) => [...prev, { id: Date.now(), estado: 1, ...data }])
      addLog('Paciente creado')
    }
    toast('Paciente guardado')
    setForm(null)
  }

  const toggleBaja = (id) => {
    const current = pac.find((p) => p.id === id)
    const next = current.estado ? 0 : 1
    setPac((prev) => prev.map((p) => (p.id === id ? { ...p, estado: next } : p)))
    addLog(next ? 'Paciente reactivado' : 'Paciente dado de baja')
    toast(next ? 'Paciente reactivado' : 'Paciente dado de baja')
  }

  const f = (key, label, extra = {}) => (
    <div>
      <label className="lbl" htmlFor={`f_${key}`}>
        {label}
      </label>
      <input
        id={`f_${key}`}
        className={`field ${errors[key] ? 'border-bad' : ''}`}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...extra}
      />
      {errors[key] && <small className="err">{errors[key]}</small>}
    </div>
  )

  return (
    <>
      <Head title="Pacientes" sub={`${list.length} registros`}>
        <button className="btn btn-p" onClick={() => open(null)}>
          + Nuevo paciente
        </button>
      </Head>

      <div className="card">
        <div className="flex gap-2.5 flex-wrap mb-3.5">
          <input
            className="field flex-1 min-w-[150px] w-auto"
            placeholder="Buscar por nombre o CI"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <label className="flex items-center gap-1.5 font-medium m-0">
            <input
              type="checkbox"
              className="w-auto"
              checked={verBajas}
              onChange={(e) => setVerBajas(e.target.checked)}
            />
            Mostrar dados de baja
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="tbl w-full border-collapse">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CI</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th>Sangre</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} style={p.estado ? undefined : { opacity: 0.55 }}>
                  <td>
                    <span className="ava">{ini(p.nom)}</span>
                    {p.nom}
                  </td>
                  <td>{p.ci}</td>
                  <td>{p.edad}</td>
                  <td>{p.tel}</td>
                  <td>{p.sangre}</td>
                  <td>
                    <span className={`tag ${p.estado ? 't-ok' : 't-mut'}`}>
                      {p.estado ? 'Activo' : 'De baja'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn btn-s" onClick={() => open(p)}>
                        Editar
                      </button>
                      {role !== 'recep' && (
                        <button
                          className={`btn btn-s ${p.estado ? 'btn-d' : ''}`}
                          onClick={() => toggleBaja(p.id)}
                        >
                          {p.estado ? 'Dar de baja' : 'Reactivar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={7} className="text-mut">
                    No hay pacientes con ese criterio. Prueba otra búsqueda o registra uno nuevo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title={form.id ? 'Editar paciente' : 'Nuevo paciente'}
          saveLabel="Guardar paciente"
          onClose={() => setForm(null)}
          onSave={save}
        >
          {f('nom', 'Nombre completo', { maxLength: 60 })}
          <div className="grid grid-cols-2 gap-3.5">
            {f('ci', 'CI', { placeholder: '1234567 LP' })}
            {f('edad', 'Edad', { type: 'number', min: 0, max: 120 })}
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {f('tel', 'Teléfono', { inputMode: 'numeric', maxLength: 8 })}
            <div>
              <label className="lbl" htmlFor="f_sangre">
                Grupo sanguíneo
              </label>
              <select
                id="f_sangre"
                className="field"
                value={form.sangre}
                onChange={(e) => setForm({ ...form, sangre: e.target.value })}
              >
                {SANGRE.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
