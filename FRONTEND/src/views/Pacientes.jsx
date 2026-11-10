import { useState } from 'react'
import {
  FiActivity,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRotateCcw,
  FiTrash2,
} from 'react-icons/fi'
import Confirm from '../components/Confirm'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { TIPOS_SANGRE, formatearFecha, hoy, iniciales } from '../data/utils'

const vacio = {
  nom: '',
  ci: '',
  edad: '',
  tel: '',
  sangre: 'O+',
  medicoId: '',
  antecedentes: '',
}

const validar = (v, pacientesLista, actual) => ({
  nom: !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{3,60}$/.test(v.nom) && 'Solo letras y espacios, entre 3 y 60 caracteres.',
  ci:
    (!/^\d{5,9}( ?[A-Z]{2})?$/.test(v.ci) &&
      'Formato: 5 a 9 dígitos y, opcional, el departamento (ej. 1234567 LP).') ||
    (pacientesLista.some((x) => x.id !== actual?.id && x.ci === v.ci) && 'Ya existe un paciente con este CI.'),
  edad:
    !(v.edad !== '' && Number.isInteger(+v.edad) && +v.edad >= 0 && +v.edad <= 120) &&
    'Ingresa una edad entre 0 y 120.',
  tel: !/^([67]\d{7}|[2-4]\d{6})$/.test(v.tel) && 'Celular de 8 dígitos (empieza con 6 o 7) o fijo de 7 dígitos.',
  medicoId: !v.medicoId && 'Selecciona el médico responsable.',
})

export default function Pacientes({
  pacientesLista,
  setPacientesLista,
  medicosLista = [],
  consultasLista = [],
  modo = 'recepcion',
  mostrarAviso,
  registrarEvento,
  alVerHistorial,
}) {
  const esMedico = modo === 'medico'
  const [filtro, setFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('activos')
  const [formulario, setFormulario] = useState(null)
  const [errores, setErrores] = useState({})
  const [detalle, setDetalle] = useState(null)
  const [confirmar, setConfirmar] = useState(null)

  const lista = [...pacientesLista]
    .filter((p) => {
      const coincide = (p.nom + p.ci + p.tel).toLowerCase().includes(filtro.toLowerCase())
      const estado =
        estadoFiltro === 'todos' ? true : estadoFiltro === 'activos' ? !!p.estado : !p.estado
      return coincide && estado
    })
    .sort((a, b) => a.nom.localeCompare(b.nom))

  const medicosActivos = medicosLista.filter((m) => m.estado)

  const abrir = (p) => {
    setErrores({})
    setFormulario(
      p
        ? { ...p, medicoId: String(p.medicoId ?? '') }
        : { ...vacio, medicoId: String(medicosActivos[0]?.id ?? '') },
    )
  }

  const guardar = () => {
    const v = {
      nom: formulario.nom.trim().replace(/\s+/g, ' '),
      ci: formulario.ci.trim().toUpperCase(),
      edad: formulario.edad,
      tel: formulario.tel.trim(),
      sangre: formulario.sangre,
      medicoId: formulario.medicoId,
      antecedentes: formulario.antecedentes?.trim() ?? '',
    }
    const e = validar(v, pacientesLista, pacientesLista.find((x) => x.id === formulario.id))
    setErrores(e)
    if (Object.values(e).some(Boolean)) return

    const datos = {
      nom: v.nom,
      ci: v.ci,
      edad: +v.edad,
      tel: v.tel,
      sangre: v.sangre,
      medicoId: +v.medicoId,
      antecedentes: v.antecedentes || 'Sin antecedentes registrados.',
    }
    if (formulario.id) {
      setPacientesLista((prev) => prev.map((p) => (p.id === formulario.id ? { ...p, ...datos } : p)))
      registrarEvento('Paciente editado')
      mostrarAviso('Paciente actualizado')
    } else {
      setPacientesLista((prev) => [
        ...prev,
        { id: Date.now(), estado: 1, fechaRegistro: hoy(), ...datos },
      ])
      registrarEvento('Paciente creado')
      mostrarAviso('Paciente registrado')
    }
    setFormulario(null)
  }

  const cambiarBaja = (id) => {
    const actual = pacientesLista.find((p) => p.id === id)
    if (!actual) return
    const siguiente = actual.estado ? 0 : 1
    setPacientesLista((prev) => prev.map((p) => (p.id === id ? { ...p, estado: siguiente } : p)))
    registrarEvento(siguiente ? 'Paciente reactivado' : 'Paciente dado de baja')
    mostrarAviso(siguiente ? 'Paciente reactivado' : 'Paciente dado de baja')
    setConfirmar(null)
  }

  const campo = (clave, etiqueta, extra = {}) => (
    <div>
      <label className="lbl" htmlFor={`f_${clave}`}>
        {etiqueta}
      </label>
      <input
        id={`f_${clave}`}
        className={`field ${errores[clave] ? 'border-bad-txt' : ''}`}
        value={formulario[clave]}
        onChange={(e) => setFormulario({ ...formulario, [clave]: e.target.value })}
        {...extra}
      />
      {errores[clave] && <small className="err">{errores[clave]}</small>}
    </div>
  )

  const consultasDetalle = detalle
    ? consultasLista
        .filter((c) => c.pac === detalle.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, 4)
    : []

  return (
    <>
      <Head
        titulo={esMedico ? 'Mis pacientes' : 'Pacientes'}
        subtitulo={
          esMedico
            ? `${lista.length} pacientes asignados o atendidos`
            : `${lista.length} registros en la clínica`
        }
      >
        {!esMedico && (
          <button className="btn btn-p" onClick={() => abrir(null)}>
            <FiPlus size={16} />
            Nuevo paciente
          </button>
        )}
      </Head>

      <div className="card">
        <div className="flex gap-2.5 flex-wrap mb-3.5 items-end">
          <div className="flex-1 min-w-[190px]">
            <label className="lbl" htmlFor="pac_buscar" style={{ marginTop: 0 }}>
              Buscar
            </label>
            <input
              id="pac_buscar"
              className="field"
              placeholder="Nombre, CI o teléfono"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="lbl" htmlFor="pac_estado" style={{ marginTop: 0 }}>
              Estado
            </label>
            <select
              id="pac_estado"
              className="field"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="activos">Solo activos</option>
              <option value="todos">Todos</option>
              <option value="bajas">Dados de baja</option>
            </select>
          </div>
          <span className="text-[12px] text-mut inline-flex items-center gap-1.5 pb-2.5">
            <FiFilter size={14} /> {lista.length} resultado(s)
          </span>
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
                <th>Médico</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const medico = medicosLista.find((m) => m.id === p.medicoId)
                return (
                  <tr key={p.id} style={p.estado ? undefined : { opacity: 0.6 }}>
                    <td>
                      <div className="flex items-center">
                        <span className="ava">{iniciales(p.nom)}</span>
                        <div className="min-w-0">
                          <b className="block text-[13px]">{p.nom}</b>
                          <small className="text-mut">Desde {formatearFecha(p.fechaRegistro)}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.ci}</td>
                    <td>{p.edad}</td>
                    <td>{p.tel}</td>
                    <td>{p.sangre}</td>
                    <td className="text-[13px]">{medico?.nom ?? '—'}</td>
                    <td>
                      <span className={`tag ${p.estado ? 't-ok' : 't-mut'}`}>
                        {p.estado ? 'Activo' : 'De baja'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap min-w-[190px]">
                        <button className="btn btn-s" onClick={() => setDetalle(p)}>
                          <FiEye size={14} />
                          Ver
                        </button>
                        {esMedico ? (
                          <button className="btn btn-s" onClick={() => alVerHistorial?.(p.id)}>
                            <FiFileText size={14} />
                            Historial
                          </button>
                        ) : (
                          <>
                            <button className="btn btn-s btn-edit" onClick={() => abrir(p)}>
                              <FiEdit2 size={14} />
                              Editar
                            </button>
                            <button
                              className={`btn btn-s ${p.estado ? 'btn-d' : ''}`}
                              onClick={() => setConfirmar(p)}
                            >
                              {p.estado ? <FiTrash2 size={14} /> : <FiRotateCcw size={14} />}
                              {p.estado ? 'Baja' : 'Reactivar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!lista.length && (
                <tr>
                  <td colSpan={8} className="text-mut">
                    No hay pacientes con ese criterio. Prueba otra búsqueda o registra uno nuevo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formulario && (
        <Modal
          titulo={formulario.id ? 'Editar paciente' : 'Nuevo paciente'}
          etiquetaGuardar="Guardar paciente"
          alCerrar={() => setFormulario(null)}
          alGuardar={guardar}
          ancho="max-w-[640px]"
        >
          {campo('nom', 'Nombre completo', { maxLength: 60 })}
          <div className="grid grid-cols-2 gap-3.5">
            {campo('ci', 'CI', { placeholder: '1234567 LP' })}
            {campo('edad', 'Edad', { type: 'number', min: 0, max: 120 })}
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {campo('tel', 'Teléfono', { inputMode: 'numeric', maxLength: 8 })}
            <div>
              <label className="lbl" htmlFor="f_sangre">
                Grupo sanguíneo
              </label>
              <select
                id="f_sangre"
                className="field"
                value={formulario.sangre}
                onChange={(e) => setFormulario({ ...formulario, sangre: e.target.value })}
              >
                {TIPOS_SANGRE.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="lbl" htmlFor="f_medico">
              Médico responsable
            </label>
            <select
              id="f_medico"
              className={`field ${errores.medicoId ? 'border-bad-txt' : ''}`}
              value={formulario.medicoId}
              onChange={(e) => setFormulario({ ...formulario, medicoId: e.target.value })}
            >
              <option value="">Selecciona un médico</option>
              {medicosActivos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom} · {m.especialidad}
                </option>
              ))}
            </select>
            {errores.medicoId && <small className="err">{errores.medicoId}</small>}
          </div>
          <div>
            <label className="lbl" htmlFor="f_antecedentes">
              Antecedentes clínicos
            </label>
            <textarea
              id="f_antecedentes"
              className="field min-h-[76px] resize-y"
              placeholder="Alergias, enfermedades crónicas, cirugías, etc."
              value={formulario.antecedentes}
              onChange={(e) => setFormulario({ ...formulario, antecedentes: e.target.value })}
            />
          </div>
        </Modal>
      )}

      {detalle && (
        <Modal
          titulo="Información del paciente"
          alCerrar={() => setDetalle(null)}
          ancho="max-w-[620px]"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <span className="ava" style={{ width: 48, height: 48, fontSize: 16 }}>
              {iniciales(detalle.nom)}
            </span>
            <div>
              <b className="block text-base">{detalle.nom}</b>
              <small className="text-mut">
                {detalle.edad} años · CI {detalle.ci}
              </small>
            </div>
            <span className={`tag ml-auto ${detalle.estado ? 't-ok' : 't-mut'}`}>
              {detalle.estado ? 'Activo' : 'De baja'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-[13px]">
            <div>
              <small className="text-mut block">Teléfono</small>
              <b>{detalle.tel}</b>
            </div>
            <div>
              <small className="text-mut block">Grupo sanguíneo</small>
              <b>{detalle.sangre}</b>
            </div>
            <div>
              <small className="text-mut block">Médico responsable</small>
              <b>{medicosLista.find((m) => m.id === detalle.medicoId)?.nom ?? '—'}</b>
            </div>
            <div>
              <small className="text-mut block">Fecha de registro</small>
              <b>{formatearFecha(detalle.fechaRegistro)}</b>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <FiActivity size={15} className="text-acc2" /> Antecedentes clínicos
            </h4>
            <p className="text-[13px] text-mut mt-1">
              {detalle.antecedentes || 'Sin antecedentes registrados.'}
            </p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <FiFileText size={15} className="text-acc2" /> Últimas consultas
            </h4>
            {consultasDetalle.length ? (
              <div className="mt-1.5 divide-y divide-line">
                {consultasDetalle.map((c) => (
                  <div key={c.id} className="py-2">
                    <small className="text-mut">{formatearFecha(c.fecha)}</small>
                    <b className="block text-[13px]">{c.diagnostico}</b>
                    <span className="text-[12px] text-mut">{c.tratamiento}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-mut mt-1">Sin consultas registradas.</p>
            )}
          </div>
        </Modal>
      )}

      {confirmar && (
        <Confirm
          titulo={confirmar.estado ? 'Dar de baja al paciente' : 'Reactivar paciente'}
          mensaje={
            confirmar.estado
              ? `${confirmar.nom} pasará a estado "De baja". El registro no se elimina y podrá reactivarse.`
              : `${confirmar.nom} volverá a estar activo en el sistema.`
          }
          etiqueta={confirmar.estado ? 'Dar de baja' : 'Reactivar'}
          peligro={!!confirmar.estado}
          alCerrar={() => setConfirmar(null)}
          alConfirmar={() => cambiarBaja(confirmar.id)}
        />
      )}
    </>
  )
}
