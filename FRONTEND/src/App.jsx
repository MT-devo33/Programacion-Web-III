import { useCallback, useRef, useState } from 'react'
import Login from './components/Login'
import Shell from './components/Shell'
import Toast from './components/Toast'
import Auditoria from './views/Auditoria'
import Citas from './views/Citas'
import Consultas from './views/Consultas'
import Dashboard from './views/Dashboard'
import DashboardMedico from './views/DashboardMedico'
import Pacientes from './views/Pacientes'
import Medicos from './views/Medicos'
import Agendas from './views/Agendas'
import MiAgenda from './views/MiAgenda'
import Historial from './views/Historial'
import Reportes from './views/Reportes'
import {
  usuarios,
  pacientes,
  medicos,
  agendas,
  citas,
  consultas,
  logs,
  MENU,
} from './data/seed'
import { ahora, navegador, pacientesDelMedico } from './data/utils'

const ipAleatoria = () => '190.129.14.' + (10 + Math.floor(Math.random() * 200))

function App() {
  const [usuariosLista, setUsuariosLista] = useState(usuarios)
  const [pacientesLista, setPacientesLista] = useState(pacientes)
  const [medicosLista, setMedicosLista] = useState(medicos)
  const [agendasLista, setAgendasLista] = useState(agendas)
  const [citasLista, setCitasLista] = useState(citas)
  const [consultasLista, setConsultasLista] = useState(consultas)
  const [logsLista, setLogsLista] = useState(logs)
  const [sesion, setSesion] = useState(null)
  const [vista, setVista] = useState('dash')
  const [pacienteSel, setPacienteSel] = useState(1)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'ok' })
  const temporizadorAviso = useRef(null)
  const [ip] = useState(() => ipAleatoria())

  const mostrarAviso = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo })
    clearTimeout(temporizadorAviso.current)
    temporizadorAviso.current = setTimeout(() => setAviso({ texto: '', tipo: 'ok' }), 2600)
  }, [])

  const registrarEvento = useCallback(
    (ev, u) => {
      const quien = u || sesion?.usuario || '-'
      setLogsLista((prev) => [[quien, ip, ev, navegador(), ahora()], ...prev])
    },
    [sesion, ip],
  )

  const iniciarSesion = (u) => {
    setSesion({
      usuario: u.usuario,
      nombre: u.nombre,
      rol: u.rol,
      medicoId: u.medicoId ?? null,
    })
    setVista('dash')
  }

  const cerrarSesion = () => {
    registrarEvento('Salida')
    setSesion(null)
    setVista('dash')
    setPacienteSel(1)
  }

  const alVerHistorial = (pacId) => {
    setPacienteSel(pacId)
    setVista('his')
  }

  const alAtenderPaciente = (pacId) => {
    setPacienteSel(pacId)
    setVista('con')
  }

  const renderizarContenido = () => {
    if (sesion) {
      const permitidas = MENU.filter((m) => m[3].includes(sesion.rol)).map((m) => m[0])
      const vistaActual = permitidas.includes(vista) ? vista : 'dash'
      const contexto = { mostrarAviso, registrarEvento }
      const propioMedico = medicosLista.find((m) => m.id === sesion.medicoId)
      const misPacientes =
        sesion.rol === 'medico'
          ? pacientesDelMedico(pacientesLista, citasLista, consultasLista, sesion.medicoId)
          : pacientesLista

      const vistas = {
        dash:
          sesion.rol === 'medico' ? (
            <DashboardMedico
              citas={citasLista}
              pacientes={misPacientes}
              consultas={consultasLista}
              medicoId={sesion.medicoId}
              medico={propioMedico}
              alAtender={alAtenderPaciente}
              setVista={setVista}
            />
          ) : (
            <Dashboard
              pac={pacientesLista}
              cit={citasLista}
              med={medicosLista}
              consultas={consultasLista}
            />
          ),
        pac: (
          <Pacientes
            pacientesLista={pacientesLista}
            setPacientesLista={setPacientesLista}
            medicosLista={medicosLista}
            consultasLista={consultasLista}
            modo="recepcion"
            {...contexto}
          />
        ),
        med: (
          <Medicos
            medicosLista={medicosLista}
            setMedicosLista={setMedicosLista}
            agendasLista={agendasLista}
            citasLista={citasLista}
            {...contexto}
          />
        ),
        age: (
          <Agendas
            medicosLista={medicosLista}
            agendasLista={agendasLista}
            setAgendasLista={setAgendasLista}
            citasLista={citasLista}
            {...contexto}
          />
        ),
        cit: (
          <Citas
            citasLista={citasLista}
            setCitasLista={setCitasLista}
            pacientesLista={pacientesLista}
            medicosLista={medicosLista}
            {...contexto}
          />
        ),
        rep: (
          <Reportes
            pacientesLista={pacientesLista}
            medicosLista={medicosLista}
            citasLista={citasLista}
            consultasLista={consultasLista}
            usuario={sesion.usuario}
            medicoId={sesion.rol === 'medico' ? sesion.medicoId : null}
            {...contexto}
          />
        ),
        aud: <Auditoria logs={logsLista} />,
        agm: (
          <MiAgenda
            citasLista={citasLista}
            setCitasLista={setCitasLista}
            pacientesLista={misPacientes}
            agendasLista={agendasLista}
            medicoId={sesion.medicoId}
            medico={propioMedico}
            alAtender={alAtenderPaciente}
            {...contexto}
          />
        ),
        misp: (
          <Pacientes
            pacientesLista={misPacientes}
            setPacientesLista={setPacientesLista}
            medicosLista={medicosLista}
            consultasLista={consultasLista}
            modo="medico"
            alVerHistorial={alVerHistorial}
            {...contexto}
          />
        ),
        con: (
          <Consultas
            pacientesLista={misPacientes}
            consultasLista={consultasLista}
            setConsultasLista={setConsultasLista}
            medicoId={sesion.medicoId}
            pacienteSel={pacienteSel}
            setPacienteSel={setPacienteSel}
            {...contexto}
          />
        ),
        his: (
          <Historial
            pacientesLista={misPacientes}
            consultasLista={consultasLista}
            medicoId={sesion.medicoId}
            pacienteSel={pacienteSel}
            setPacienteSel={setPacienteSel}
          />
        ),
      }

      return (
        <Shell
          vista={vistaActual}
          setVista={setVista}
          sesion={sesion}
          alCerrarSesion={cerrarSesion}
          hijos={vistas[vistaActual] ?? vistas.dash}
        />
      )
    }
    return (
      <Login
        usuarios={usuariosLista}
        registrarEvento={registrarEvento}
        alIniciarSesion={iniciarSesion}
        alRegistrar={(u) =>
          setUsuariosLista((prev) =>
            prev.some((x) => x.usuario === u.usuario)
              ? prev.map((x) => (x.usuario === u.usuario ? u : x))
              : [...prev, u],
          )
        }
      />
    )
  }

  return (
    <>
      {renderizarContenido()}
      <Toast texto={aviso.texto} tipo={aviso.tipo} />
    </>
  )
}

export default App
