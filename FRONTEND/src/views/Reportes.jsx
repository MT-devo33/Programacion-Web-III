import { useState, useMemo } from 'react'
import {
  FiClipboard,
  FiDownload,
  FiFileText,
  FiUsers,
} from 'react-icons/fi'
import Head from '../components/Head'
import { agruparPor, formatearFecha, hoy, iniciales } from '../data/utils'

const documentoPDF = (titulo, usuario, mostrarAviso) => {
  if (!window.jspdf) {
    mostrarAviso('No se pudo cargar la librería de PDF. Revisa tu conexión.', 'error')
    return null
  }
  const d = new window.jspdf.jsPDF()
  d.setFontSize(16)
  d.text('SGP - ' + titulo, 14, 18)
  d.setFontSize(9)
  d.setTextColor(110)
  d.text('Generado el ' + new Date().toLocaleString('es-BO') + ' por ' + usuario, 14, 25)
  d.setTextColor(0)
  d.setFontSize(11)
  return d
}

const lineasPDF = (d, arr, y) => {
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

export default function Reportes({
  pacientesLista,
  medicosLista,
  citasLista,
  consultasLista,
  usuario,
  medicoId,
  mostrarAviso,
  registrarEvento,
}) {
  const esMedico = !!medicoId

  // Filtrar datos según el rol
  const misPacientes = useMemo(() => {
    if (!esMedico) return pacientesLista
    return pacientesLista.filter((p) => p.medicoId === medicoId)
  }, [pacientesLista, esMedico, medicoId])

  const misCitas = useMemo(() => {
    if (!esMedico) return citasLista
    return citasLista.filter((c) => c.med === medicoId)
  }, [citasLista, esMedico, medicoId])

  const misConsultas = useMemo(() => {
    if (!esMedico) return consultasLista
    return consultasLista.filter((c) => c.med === medicoId)
  }, [consultasLista, esMedico, medicoId])

  const [pacienteId, setPacienteId] = useState(String(misPacientes[0]?.id ?? ''))
  const [fechaDesde, setFechaDesde] = useState('2026-08-01')
  const [fechaHasta, setFechaHasta] = useState(hoy())
  const [error, setError] = useState('')

  const activos = misPacientes.filter((p) => p.estado)
  const citasHoy = misCitas.filter((c) => c.fecha === hoy())

  const porEspecialidad = useMemo(() =>
    agruparPor(
      activos,
      (p) => medicosLista.find((m) => m.id === p.medicoId)?.especialidad ?? 'Sin asignar',
    ),
    [activos, medicosLista],
  )

  const miMedico = useMemo(() => medicosLista.find((m) => m.id === medicoId), [medicosLista, medicoId])

  const generarReporteGeneral = () => {
    const d = documentoPDF(
      esMedico ? 'Reporte de mi actividad médica' : 'Reporte general de la clínica',
      usuario,
      mostrarAviso,
    )
    if (!d) return

    const estados = agruparPor(misCitas, (c) => c.estado)

    let y = lineasPDF(
      d,
      [
        esMedico ? 'Resumen de mi actividad médica' : 'Resumen de actividad',
        `Pacientes: ${misPacientes.length} (${activos.length} activos)`,
        esMedico
          ? `Médico: ${miMedico?.nom ?? '—'} · ${miMedico?.especialidad ?? ''}`
          : `Médicos registrados: ${medicosLista.length} (${medicosLista.filter((m) => m.estado).length} activos)`,
        `Citas: ${misCitas.length} · Citas de hoy: ${citasHoy.length}`,
        `Consultas registradas: ${misConsultas.length}`,
        '',
        'Citas por estado',
        ...(estados.length ? estados.map(([estado, cantidad]) => `   ${estado}: ${cantidad}`) : ['   Sin citas']),
        '',
      ],
      36,
    )

    if (!esMedico) {
      y = lineasPDF(
        d,
        [
          'Médicos y especialidades',
          ...medicosLista.map(
            (m) =>
              `   ${m.nom} - ${m.especialidad} - ${m.estado ? 'Activo' : 'Inactivo'} - ${
                citasLista.filter((c) => c.med === m.id).length
              } cita(s)`,
          ),
          '',
          'Últimos pacientes registrados',
          ...[...pacientesLista]
            .sort((a, b) => (b.fechaRegistro ?? '').localeCompare(a.fechaRegistro ?? '') || b.id - a.id)
            .slice(0, 8)
            .map((p) => `   ${p.nom} - CI ${p.ci} - ${formatearFecha(p.fechaRegistro)}`),
        ],
        y + 4,
      )
    } else {
      y = lineasPDF(
        d,
        [
          'Mis pacientes',
          ...misPacientes
            .sort((a, b) => (b.fechaRegistro ?? '').localeCompare(a.fechaRegistro ?? '') || b.id - a.id)
            .slice(0, 12)
            .map((p) => `   ${p.nom} - CI ${p.ci} - ${formatearFecha(p.fechaRegistro)}`),
        ],
        y + 4,
      )
    }

    y = lineasPDF(d, ['', esMedico ? 'Mis pacientes por especialidad' : 'Distribución de pacientes por especialidad'], y + 4)
    lineasPDF(
      d,
      porEspecialidad.length
        ? porEspecialidad.map(([especialidad, cantidad]) => `   ${especialidad}: ${cantidad}`)
        : ['   Sin pacientes'],
      y,
    )
    d.save(esMedico ? 'reporte_mi_actividad.pdf' : 'reporte_general_sgp.pdf')
    registrarEvento(esMedico ? 'Reporte médico exportado' : 'Reporte general exportado')
    mostrarAviso(esMedico ? 'Reporte médico descargado' : 'Reporte general descargado')
  }

  const generarFicha = () => {
    const p = misPacientes.find((x) => x.id === +pacienteId)
    const d = documentoPDF('Ficha clínica', usuario, mostrarAviso)
    if (!d || !p) return
    let y = lineasPDF(
      d,
      [
        'Paciente: ' + p.nom,
        'CI: ' + p.ci + '   Edad: ' + p.edad + '   Sangre: ' + p.sangre,
        'Teléfono: ' + p.tel,
        'Médico responsable: ' + (medicosLista.find((m) => m.id === p.medicoId)?.nom ?? 'Sin asignar'),
        'Estado: ' + (p.estado ? 'Activo' : 'De baja'),
        '',
        'Antecedentes clínicos',
        p.antecedentes || 'Sin antecedentes registrados.',
        '',
        'Historial de consultas',
      ],
      36,
    )
    const h = misConsultas.filter((c) => c.pac === p.id)
    lineasPDF(
      d,
      h.length
        ? h.flatMap((c) => [
            `${c.fecha} - ${c.motivo ?? 'Consulta'}`,
            '   Dx: ' + c.diagnostico,
            '   Tx: ' + c.tratamiento,
            '',
          ])
        : ['Sin consultas registradas.'],
      y + 2,
    )
    d.save('ficha_' + p.nom.split(' ')[0].toLowerCase() + '.pdf')
    registrarEvento('Ficha clínica exportada')
    mostrarAviso('Ficha descargada')
  }

  const generarReporteRango = () => {
    if (!fechaDesde || !fechaHasta || fechaDesde > fechaHasta) {
      setError('Elige un rango válido: "Desde" no puede ser posterior a "Hasta".')
      return
    }
    const resultados = misConsultas
      .filter((c) => c.fecha >= fechaDesde && c.fecha <= fechaHasta)
      .sort((x, y) => x.fecha.localeCompare(y.fecha))
    if (!resultados.length) {
      setError('No hay consultas en ese rango.')
      return
    }
    setError('')
    const d = documentoPDF(
      esMedico ? 'Mis consultas del ' + fechaDesde + ' al ' + fechaHasta : 'Consultas del ' + fechaDesde + ' al ' + fechaHasta,
      usuario,
      mostrarAviso,
    )
    if (!d) return
    lineasPDF(
      d,
      ['Total: ' + resultados.length + ' consultas', ''].concat(
        resultados.flatMap((c) => [
          c.fecha + ' | ' + (pacientesLista.find((p) => p.id === c.pac)?.nom ?? '—'),
          '   Médico: ' + (medicosLista.find((m) => m.id === c.med)?.nom ?? '—'),
          '   Motivo: ' + (c.motivo ?? '—'),
          '   Dx: ' + c.diagnostico,
          '   Tx: ' + c.tratamiento,
          '',
        ]),
      ),
      36,
    )
    d.save('consultas_' + fechaDesde + '_' + fechaHasta + '.pdf')
    registrarEvento('Reporte de consultas exportado')
    mostrarAviso('Reporte descargado')
  }

  const titulo = esMedico ? 'Mis reportes' : 'Reportes'
  const subtitulo = esMedico
    ? `Estadísticas de mi actividad · ${miMedico?.especialidad ?? ''}`
    : 'Estadísticas de la clínica y documentos PDF para archivar.'

  return (
    <>
      <Head titulo={titulo} subtitulo={subtitulo}>
        <span className="tag t-info">Hoy · {formatearFecha(hoy())}</span>
      </Head>

      <h3 className="text-base mt-2 mb-2">Documentos PDF</h3>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col">
          <h4 className="text-base mb-1 flex items-center gap-1.5">
            <FiFileText size={15} className="text-acc2" />
            {esMedico ? 'Reporte de mi actividad' : 'Reporte general'}
          </h4>
          <p className="text-[12px] text-mut flex-1">
            {esMedico
              ? 'Resumen de mis pacientes, citas, consultas y actividad médica personal.'
              : 'Totales, citas por estado, médicos y especialidades, últimos pacientes y actividad general de la clínica.'}
          </p>
          <button className="btn btn-p mt-4" onClick={generarReporteGeneral}>
            <FiDownload size={16} /> Descargar reporte
          </button>
        </div>

        {misPacientes.length > 0 && (
          <div className="card flex flex-col">
            <h4 className="text-base mb-1 flex items-center gap-1.5">
              <FiUsers size={15} className="text-acc2" /> Ficha clínica
            </h4>
            <label className="lbl" htmlFor="rpac">
              Paciente
            </label>
            <select id="rpac" className="field" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
              {misPacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
            <button className="btn btn-p mt-4" onClick={generarFicha}>
              <FiDownload size={16} /> Descargar ficha
            </button>
          </div>
        )}

        <div className="card flex flex-col">
          <h4 className="text-base mb-1 flex items-center gap-1.5">
            <FiClipboard size={15} className="text-acc2" /> Consultas por rango
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="lbl" htmlFor="d1">
                Desde
              </label>
              <input id="d1" className="field" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
            <div>
              <label className="lbl" htmlFor="d2">
                Hasta
              </label>
              <input id="d2" className="field" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>
          </div>
          {error && <small className="err">{error}</small>}
          <button className="btn btn-p mt-4" onClick={generarReporteRango}>
            <FiDownload size={16} /> Generar PDF
          </button>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="text-base mb-2">{esMedico ? 'Mis pacientes recientes' : 'Actividad reciente'}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[...misPacientes]
            .sort((a, b) => (b.fechaRegistro ?? '').localeCompare(a.fechaRegistro ?? '') || b.id - a.id)
            .slice(0, 4)
            .map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
                <span className="ava mb-0 mr-0">{iniciales(p.nom)}</span>
                <span className="min-w-0 flex-1">
                  <b className="block text-[13px] truncate">{p.nom}</b>
                  <small className="text-mut">Registrado el {formatearFecha(p.fechaRegistro)}</small>
                </span>
                <span className={`tag ${p.estado ? 't-ok' : 't-mut'}`}>{p.estado ? 'Activo' : 'Baja'}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}