import { useState } from 'react'
import {
  FiAward,
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMail,
  FiMapPin,
  FiPlus,
  FiPower,
  FiPhone,
  FiSearch,
} from 'react-icons/fi'
import Confirm from '../components/Confirm'
import Head from '../components/Head'
import Modal from '../components/Modal'
import { ESPECIALIDADES } from '../data/seed'
import { correoValido, formatearFecha, iniciales } from '../data/utils'

const vacio = {
  nom: '',
  ci: '',
  especialidad: 'Medicina General',
  registro: '',
  tel: '',
  correo: '',
  consultorio: '',
}

const validar = (v, medicosLista, actual) => ({
  nom: !/^[A-Za-zÁÉÍÓÚÑáéíóúñ.\s]{3,60}$/.test(v.nom) && 'Escribe el nombre profesional (mínimo 3 letras).',
  ci:
    (!/^\d{5,9}( ?[A-Z]{2})?$/.test(v.ci) &&
      'Formato: 5 a 9 dígitos y, opcional, el departamento (ej. 1234567 LP).') ||
    (medicosLista.some((x) => x.id !== actual?.id && x.ci === v.ci) && 'Ya existe un médico con este CI.'),
  registro:
    (!/^[A-Za-z0-9-]{4,15}$/.test(v.registro) && 'Matrícula de 4 a 15 caracteres (letras, números o guion).') ||
    (medicosLista.some((x) => x.id !== actual?.id && x.registro === v.registro) &&
      'Ya existe un médico con esta matrícula.'),
  tel: !/^([67]\d{7}|[2-4]\d{6})$/.test(v.tel) && 'Celular de 8 dígitos (empieza con 6 o 7) o fijo de 7 dígitos.',
  correo: !correoValido(v.correo) && 'Escribe un correo válido.',
  consultorio: !/^[A-Za-z0-9-]{2,10}$/.test(v.consultorio) && 'Código de consultorio de 2 a 10 caracteres.',
})

export default function Medicos({
  medicosLista,
  setMedicosLista,
  agendasLista = [],
  citasLista = [],
  mostrarAviso,
  registrarEvento,
}) {
  const [filtro, setFiltro] = useState('')
  const [especialidadFiltro, setEspecialidadFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [formulario, setFormulario] = useState(null)
  const [errores, setErrores] = useState({})
  const [detalle, setDetalle] = useState(null)
  const [confirmar, setConfirmar] = useState(null)

  const especialidades = [...new Set(medicosLista.map((m) => m.especialidad))].sort()

  const lista = medicosLista
    .filter((m) => {
      const coincide = (m.nom + m.especialidad + m.registro).toLowerCase().includes(filtro.toLowerCase())
      const especialidad = !especialidadFiltro || m.especialidad === especialidadFiltro
      const estado = estadoFiltro === 'todos' ? true : estadoFiltro === 'activos' ? !!m.estado : !m.estado
      return coincide && especialidad && estado
    })
    .sort((a, b) => a.nom.localeCompare(b.nom))

  const horariosDe = (id) => agendasLista.filter((a) => a.med === id && a.estado)

  const abrir = (m) => {
    setErrores({})
    setFormulario(m ? { ...m } : { ...vacio })
  }

  const guardar = () => {
    const v = {
      nom: formulario.nom.trim().replace(/\s+/g, ' '),
      ci: formulario.ci.trim().toUpperCase(),
      especialidad: formulario.especialidad,
      registro: formulario.registro.trim().toUpperCase(),
      tel: formulario.tel.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      consultorio: formulario.consultorio.trim().toUpperCase(),
    }
    const e = validar(v, medicosLista, medicosLista.find((x) => x.id === formulario.id))
    setErrores(e)
    if (Object.values(e).some(Boolean)) return

    if (formulario.id) {
      setMedicosLista((prev) => prev.map((m) => (m.id === formulario.id ? { ...m, ...v } : m)))
      registrarEvento('Médico editado')
      mostrarAviso('Médico actualizado')
    } else {
      setMedicosLista((prev) => [...prev, { id: Date.now(), estado: 1, ...v }])
      registrarEvento('Médico registrado')
      mostrarAviso('Médico registrado')
    }
    setFormulario(null)
  }

  const cambiarEstado = () => {
    if (!confirmar) return
    const siguiente = confirmar.estado ? 0 : 1
    setMedicosLista((prev) => prev.map((m) => (m.id === confirmar.id ? { ...m, estado: siguiente } : m)))
    registrarEvento(siguiente ? 'Médico activado' : 'Médico desactivado')
    mostrarAviso(siguiente ? 'Médico activado' : 'Médico desactivado')
    setConfirmar(null)
  }

  const campo = (clave, etiqueta, extra = {}) => (
    <div>
      <label className="lbl" htmlFor={`m_${clave}`}>
        {etiqueta}
      </label>
      <input
        id={`m_${clave}`}
        className={`field ${errores[clave] ? 'border-bad-txt' : ''}`}
        value={formulario[clave]}
        onChange={(e) => setFormulario({ ...formulario, [clave]: e.target.value })}
        {...extra}
      />
      {errores[clave] && <small className="err">{errores[clave]}</small>}
    </div>
  )

  const horariosDetalle = detalle ? agendasLista.filter((a) => a.med === detalle.id) : []
  const citasDetalle = detalle ? citasLista.filter((c) => c.med === detalle.id) : []

  return (
    <>
      <Head titulo="Médicos" subtitulo={`${lista.length} profesionales en el listado`}>
        <button className="btn btn-p" onClick={() => abrir(null)}>
          <FiPlus size={16} />
          Nuevo médico
        </button>
      </Head>

      <div className="card">
        <div className="flex gap-2.5 flex-wrap mb-3.5 items-end">
          <div className="flex-1 min-w-[190px]">
            <label className="lbl" htmlFor="med_buscar" style={{ marginTop: 0 }}>
              Buscar
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" size={15} />
              <input
                id="med_buscar"
                className="field"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Nombre, especialidad o matrícula"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
          <div className="min-w-[165px]">
            <label className="lbl" htmlFor="med_esp" style={{ marginTop: 0 }}>
              Especialidad
            </label>
            <select
              id="med_esp"
              className="field"
              value={especialidadFiltro}
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
            >
              <option value="">Todas</option>
              {especialidades.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[135px]">
            <label className="lbl" htmlFor="med_estado" style={{ marginTop: 0 }}>
              Estado
            </label>
            <select
              id="med_estado"
              className="field"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="tbl w-full border-collapse">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Matrícula</th>
                <th>Contacto</th>
                <th>Horarios</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((m) => {
                const horarios = horariosDe(m.id)
                return (
                  <tr key={m.id} style={m.estado ? undefined : { opacity: 0.6 }}>
                    <td>
                      <div className="flex items-center">
                        <span className="ava">{iniciales(m.nom.replace('Dra. ', '').replace('Dr. ', ''))}</span>
                        <div>
                          <b className="block text-[13px]">{m.nom}</b>
                          <small className="text-mut">{m.consultorio}</small>
                        </div>
                      </div>
                    </td>
                    <td>{m.especialidad}</td>
                    <td>{m.registro}</td>
                    <td className="text-[13px]">
                      <span className="block">{m.tel}</span>
                      <small className="text-mut">{m.correo}</small>
                    </td>
                    <td className="text-[13px]">
                      {horarios.length ? (
                        <span>
                          {horarios.map((h) => h.dia.slice(0, 3)).join(', ')}
                          <small className="block text-mut">{horarios.length} bloque(s)</small>
                        </span>
                      ) : (
                        <span className="text-mut">Sin horario</span>
                      )}
                    </td>
                    <td>
                      <span className={`tag ${m.estado ? 't-ok' : 't-mut'}`}>
                        {m.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap min-w-[180px]">
                        <button className="btn btn-s" onClick={() => setDetalle(m)}>
                          <FiEye size={14} />
                          Ver
                        </button>
                        <button className="btn btn-s btn-edit" onClick={() => abrir(m)}>
                          <FiEdit2 size={14} />
                          Editar
                        </button>
                        <button
                          className={`btn btn-s ${m.estado ? 'btn-d' : ''}`}
                          onClick={() => setConfirmar(m)}
                        >
                          <FiPower size={14} />
                          {m.estado ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!lista.length && (
                <tr>
                  <td colSpan={7} className="text-mut">
                    No hay médicos con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formulario && (
        <Modal
          titulo={formulario.id ? 'Editar médico' : 'Nuevo médico'}
          etiquetaGuardar="Guardar médico"
          alCerrar={() => setFormulario(null)}
          alGuardar={guardar}
          ancho="max-w-[640px]"
        >
          {campo('nom', 'Nombre profesional', { placeholder: 'Dra. Elena Ramírez', maxLength: 60 })}
          <div className="grid grid-cols-2 gap-3.5">
            {campo('ci', 'CI', { placeholder: '4567890 LP' })}
            <div>
              <label className="lbl" htmlFor="m_especialidad">
                Especialidad
              </label>
              <select
                id="m_especialidad"
                className="field"
                value={formulario.especialidad}
                onChange={(e) => setFormulario({ ...formulario, especialidad: e.target.value })}
              >
                {ESPECIALIDADES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {campo('registro', 'Matrícula profesional', { placeholder: 'MAT-12845' })}
            {campo('consultorio', 'Consultorio', { placeholder: 'C-101' })}
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {campo('tel', 'Teléfono', { inputMode: 'numeric', maxLength: 8 })}
            {campo('correo', 'Correo', { type: 'email', placeholder: 'medico@sgp.bo' })}
          </div>
        </Modal>
      )}

      {detalle && (
        <Modal titulo="Ficha del médico" alCerrar={() => setDetalle(null)} ancho="max-w-[620px]">
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <span className="ava" style={{ width: 48, height: 48, fontSize: 16 }}>
              {iniciales(detalle.nom.replace('Dra. ', '').replace('Dr. ', ''))}
            </span>
            <div className="min-w-0">
              <b className="block text-base">{detalle.nom}</b>
              <small className="text-mut">{detalle.especialidad}</small>
            </div>
            <span className={`tag ml-auto ${detalle.estado ? 't-ok' : 't-mut'}`}>
              {detalle.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-[13px]">
            <span className="inline-flex items-center gap-1.5">
              <FiAward size={14} className="text-acc2" /> <b>{detalle.registro}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiMapPin size={14} className="text-acc2" /> {detalle.consultorio}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiPhone size={14} className="text-acc2" /> {detalle.tel}
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <FiMail size={14} className="text-acc2 shrink-0" />
              <span className="truncate">{detalle.correo}</span>
            </span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <FiCalendar size={15} className="text-acc2" /> Horarios de atención
            </h4>
            {horariosDetalle.length ? (
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {horariosDetalle.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-[12px]"
                  >
                    <span>
                      <b>{h.dia}</b>
                      <small className="block text-mut">
                        {h.inicio} – {h.fin} · {h.consultorio}
                      </small>
                    </span>
                    <span className={`tag ${h.estado ? 't-ok' : 't-mut'}`}>
                      {h.estado ? 'Disponible' : 'No disp.'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-mut mt-1">Sin horarios asignados.</p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-lg bg-surface px-3 py-2">
              <small className="text-mut block">Citas registradas</small>
              <b>{citasDetalle.length}</b>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2">
              <small className="text-mut block">Última cita</small>
              <b>
                {citasDetalle.length
                  ? formatearFecha([...citasDetalle].sort((a, b) => b.fecha.localeCompare(a.fecha))[0].fecha)
                  : '—'}
              </b>
            </div>
          </div>
        </Modal>
      )}

      {confirmar && (
        <Confirm
          titulo={confirmar.estado ? 'Desactivar médico' : 'Activar médico'}
          mensaje={
            confirmar.estado
              ? `${confirmar.nom} quedará inactivo para nuevas asignaciones. Sus citas e historial se conservan.`
              : `${confirmar.nom} volverá a estar disponible para asignar pacientes y citas.`
          }
          etiqueta={confirmar.estado ? 'Desactivar' : 'Activar'}
          peligro={!!confirmar.estado}
          alCerrar={() => setConfirmar(null)}
          alConfirmar={cambiarEstado}
        />
      )}
    </>
  )
}
