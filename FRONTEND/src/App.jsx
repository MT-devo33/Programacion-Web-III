import { useCallback, useRef, useState } from 'react'
import Login from './components/Login'
import Shell from './components/Shell'
import Toast from './components/Toast'
import Auditoria from './views/Auditoria'
import Citas from './views/Citas'
import Consultas from './views/Consultas'
import Dashboard from './views/Dashboard'
import Pacientes from './views/Pacientes'
import Reportes from './views/Reportes'
import { seedCit, seedCon, seedLog, seedPac, seedUsers } from './data/seed'
import { brw, now } from './data/utils'

const randomIp = () => '190.129.14.' + (10 + Math.floor(Math.random() * 200))

function App() {
  const [users, setUsers] = useState(seedUsers)
  const [pac, setPac] = useState(seedPac)
  const [cit, setCit] = useState(seedCit)
  const [con, setCon] = useState(seedCon)
  const [log, setLog] = useState(seedLog)
  const [auth, setAuth] = useState(null)
  const [view, setView] = useState('dash')
  const [selPac, setSelPac] = useState(1)
  const [toastMsg, setToastMsg] = useState('')
  const toastT = useRef(null)
  const [ip] = useState(() => randomIp())

  const toast = useCallback((t) => {
    setToastMsg(t)
    clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToastMsg(''), 2200)
  }, [])

  const addLog = useCallback(
    (ev, u) => {
      const who = u || auth?.user || '-'
      setLog((prev) => [[who, ip, ev, brw(), now()], ...prev])
    },
    [auth, ip],
  )

  const pn = (id) => pac.find((p) => p.id === id)

  const logout = () => {
    addLog('Salida')
    setAuth(null)
    setView('dash')
  }

  const renderContent = () => {
    if (auth) {
      const ctx = { toast, addLog }
      const views = {
        dash: <Dashboard pac={pac} cit={cit} pn={pn} />,
        pac: <Pacientes pac={pac} setPac={setPac} role={auth.role} {...ctx} />,
        cit: <Citas cit={cit} setCit={setCit} pac={pac} toast={toast} />,
        con: (
          <Consultas
            pac={pac}
            con={con}
            setCon={setCon}
            selPac={selPac}
            setSelPac={setSelPac}
            {...ctx}
          />
        ),
        rep: <Reportes pac={pac} con={con} user={auth.user} {...ctx} />,
        aud: <Auditoria log={log} />,
      }
      return (
        <Shell view={view} setView={setView} auth={auth} onLogout={logout}>
          {views[view] ?? views.dash}
        </Shell>
      )
    }
    return (
      <Login
        users={users}
        addLog={addLog}
        onLogin={(u) => {
          setAuth({ user: u.u, name: u.n, role: u.r })
          setView('dash')
        }}
        onRegister={(u) =>
          setUsers((prev) =>
            prev.some((x) => x.u === u.u) ? prev.map((x) => (x.u === u.u ? u : x)) : [...prev, u],
          )
        }
      />
    )
  }

  return (
    <>
      {renderContent()}
      <Toast text={toastMsg} />
    </>
  )
}

export default App
