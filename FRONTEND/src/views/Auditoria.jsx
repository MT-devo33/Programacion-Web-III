import { useState } from 'react'
import { FiFilter, FiShield } from 'react-icons/fi'
import Head from '../components/Head'

const tipoEvento = (evento) => {
  if (/fallido|bloqueada/i.test(evento)) return 't-bad'
  if (/salida/i.test(evento)) return 't-warn'
  if (/ingreso/i.test(evento)) return 't-ok'
  return 't-mut'
}

export default function Auditoria({ logs }) {
  const [filtro, setFiltro] = useState('')
  const [tipo, setTipo] = useState('todos')

  const lista = logs.filter((evento) => {
    const texto = evento.join(' ').toLowerCase()
    const coincide = texto.includes(filtro.toLowerCase())
    const clase = tipoEvento(evento[2])
    const categoria =
      tipo === 'todos'
        ? true
        : tipo === 'accesos'
          ? clase === 't-ok' || clase === 't-warn'
          : tipo === 'fallidos'
            ? clase === 't-bad'
            : clase === 't-mut'
    return coincide && categoria
  })

  return (
    <>
      <Head titulo="Auditoría" subtitulo="Registro de accesos y eventos del sistema.">
        <span className="tag t-info inline-flex items-center gap-1.5">
          <FiShield size={13} /> {logs.length} eventos
        </span>
      </Head>

      <div className="card">
        <div className="flex gap-2.5 flex-wrap mb-3.5 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="lbl" htmlFor="aud_buscar" style={{ marginTop: 0 }}>
              Buscar
            </label>
            <input
              id="aud_buscar"
              className="field"
              placeholder="Usuario, IP o evento"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="lbl" htmlFor="aud_tipo" style={{ marginTop: 0 }}>
              Tipo de evento
            </label>
            <select id="aud_tipo" className="field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="accesos">Ingresos y salidas</option>
              <option value="operaciones">Operaciones</option>
              <option value="fallidos">Intentos fallidos</option>
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
                <th>Usuario</th>
                <th>IP</th>
                <th>Evento</th>
                <th>Navegador</th>
                <th>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((evento, i) => (
                <tr key={`${evento[4]}-${i}`}>
                  <td className="text-[13px]">
                    <b>{evento[0]}</b>
                  </td>
                  <td className="text-[13px]">{evento[1]}</td>
                  <td>
                    <span className={`tag ${tipoEvento(evento[2])}`}>{evento[2]}</span>
                  </td>
                  <td className="text-[13px]">{evento[3]}</td>
                  <td className="text-[13px] whitespace-nowrap">{evento[4]}</td>
                </tr>
              ))}
              {!lista.length && (
                <tr>
                  <td colSpan={5} className="text-mut">
                    No hay eventos que coincidan con el filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-mut mt-3">
        El registro incluye usuario, IP, evento, navegador y fecha/hora. En esta demostración se almacena
        en memoria del navegador.
      </p>
    </>
  )
}
