import { useEffect, useRef, useState } from 'react'
import { mailOk, passColor, passLevel, passText } from '../data/utils'

const LOCK_S = 60 // demo: 60 s. El backend decide el tiempo real (ej. 5 min)

const randomCaptcha = () => [1 + Math.floor(Math.random() * 9), 1 + Math.floor(Math.random() * 9)]

function Meter({ value }) {
  const lvl = value ? passLevel(value) : 0
  return (
    <>
      <div className="flex gap-1 mt-[7px]">
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            className="flex-1 h-[5px] rounded-[3px] bg-line transition-colors"
            style={{ background: i < lvl ? passColor[lvl] : undefined }}
          />
        ))}
      </div>
      <div className="text-xs text-mut mt-1 min-h-4">{value ? passText[lvl] : ''}</div>
    </>
  )
}

function Pulse() {
  return (
    <svg
      className="w-full max-w-[420px] h-[60px]"
      viewBox="0 0 420 60"
      fill="none"
      stroke="#3fb8c3"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 32h120l14-26 22 50 18-38 10 14h236" />
    </svg>
  )
}

export default function Login({ users, onLogin, onRegister, addLog }) {
  const [tab, setTab] = useState('vLogin')
  const [cap, setCap] = useState(randomCaptcha)
  const [capAns, setCapAns] = useState('')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [msg, setMsg] = useState(null)
  const [fails, setFails] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)
  const [left, setLeft] = useState(0)
  const lockT = useRef(null)

  const [reg, setReg] = useState({ n: '', u: '', c: '', p: '', p2: '' })
  const [rec, setRec] = useState({ step: 1, c: '', code: '', p: '' })
  const [recUser, setRecUser] = useState(null)
  const [recMsg, setRecMsg] = useState(null)

  const newCap = () => {
    setCap(randomCaptcha())
    setCapAns('')
  }

  useEffect(() => {
    if (!lockUntil) return
    const tick = () => {
      const s = Math.ceil((lockUntil - Date.now()) / 1000)
      if (s <= 0) {
        setLockUntil(0)
        setFails(0)
        setLeft(0)
        setMsg(null)
        newCap()
      } else setLeft(s)
    }
    tick()
    lockT.current = setInterval(tick, 1000)
    return () => clearInterval(lockT.current)
  }, [lockUntil])

  const go = (v) => {
    setTab(v)
    setMsg(null)
    setRecMsg(null)
  }

  const tryLogin = () => {
    if (!u || !p) return setMsg({ t: 'Completa usuario y contraseña.' })
    if (+capAns !== cap[0] + cap[1]) {
      newCap()
      return setMsg({ t: 'La verificación es incorrecta. Resuelve el nuevo cálculo.' })
    }
    const found = users.find((x) => x.u === u && x.pw === p)
    if (!found) {
      const f = fails + 1
      setFails(f)
      newCap()
      addLog(`Intento fallido (${f}/3)`, u)
      if (f >= 3) {
        setLockUntil(Date.now() + LOCK_S * 1000)
        addLog('Cuenta bloqueada', u)
        return
      }
      return setMsg({ t: `Usuario o contraseña incorrectos. Intento ${f} de 3.` })
    }
    setFails(0)
    setP('')
    setMsg(null)
    addLog('Ingreso', found.u)
    onLogin(found)
  }

  const createAccount = () => {
    const { n, u: gu, c, p: gp, p2 } = reg
    const err = !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{3,60}$/.test(n)
      ? 'Escribe tu nombre completo, solo con letras.'
      : !/^[a-z0-9._]{4,20}$/.test(gu)
        ? 'El usuario usa de 4 a 20 caracteres: minúsculas, números, punto o guion bajo.'
        : users.some((x) => x.u === gu)
          ? 'Ese usuario ya existe.'
          : !mailOk(c)
            ? 'Escribe un correo válido.'
            : passLevel(gp) < 2
              ? 'La contraseña es débil. Debe ser al menos intermedia.'
              : gp !== p2
                ? 'Las contraseñas no coinciden.'
                : ''
    if (err) return setMsg({ t: err })
    onRegister({ u: gu, n, c, pw: gp, r: 'recep' }) // backend: guardar con bcrypt
    addLog('Usuario registrado', gu)
    setReg({ n: '', u: '', c: '', p: '', p2: '' })
    setTab('vLogin')
    setU(gu)
    setMsg({ t: 'Cuenta creada. Ya puedes iniciar sesión.', ok: true })
  }

  const sendCode = () => {
    if (!mailOk(rec.c)) return setRecMsg({ t: 'Escribe un correo válido.' })
    const found = users.find((x) => x.c === rec.c)
    setRecUser(found || null)
    addLog('Recuperación solicitada', found ? found.u : rec.c)
    setRec((r) => ({ ...r, step: 2 }))
    setRecMsg(null)
  }

  const resetPass = () => {
    if (rec.code !== '123456') return setRecMsg({ t: 'El código es incorrecto o venció.' })
    if (passLevel(rec.p) < 2) return setRecMsg({ t: 'La contraseña es débil. Debe ser al menos intermedia.' })
    if (recUser) onRegister({ ...recUser, pw: rec.p })
    setRec({ step: 1, c: '', code: '', p: '' })
    setRecMsg(null)
    setTab('vLogin')
    setMsg({ t: 'Contraseña actualizada. Inicia sesión.', ok: true })
  }

  const btnLogin = lockUntil ? (
    <button className="btn btn-p btn-w" disabled>
      Entrar
    </button>
  ) : (
    <button className="btn btn-p btn-w" onClick={tryLogin}>
      Entrar
    </button>
  )

  return (
    <section className="min-h-full grid md:grid-cols-[1.1fr_1fr]">
      <div className="hidden md:flex bg-ink text-[#d8e8ec] p-14 flex-col justify-between">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg">
          <span className="bg-acc w-[30px] h-[30px] rounded-lg grid place-items-center text-base">✚</span>
          SGP
        </div>
        <div>
          <Pulse />
          <h1 className="text-[38px] leading-[1.15] text-white max-w-[14ch] mt-6">
            Todo el historial del paciente, en un solo lugar.
          </h1>
          <p className="max-w-[38ch] text-[#9fbac2] mt-3.5">
            Registra pacientes, agenda citas y consulta diagnósticos sin buscar entre papeles.
          </p>
        </div>
        <small className="text-[#6f8e97]">Acceso restringido a personal autorizado.</small>
      </div>

      <div className="grid place-items-center p-8">
        <div className="w-full max-w-[380px]">
          {tab === 'vLogin' && (
            <>
              <h2 className="text-2xl mb-1">Iniciar sesión</h2>
              <p className="text-mut mb-5">Ingresa con tu usuario del consultorio.</p>
              <label className="lbl" htmlFor="u">
                Usuario
              </label>
              <input
                id="u"
                className="field"
                autoComplete="username"
                placeholder="dra.ramirez"
                value={u}
                onChange={(e) => setU(e.target.value)}
              />
              <label className="lbl" htmlFor="p">
                Contraseña
              </label>
              <input
                id="p"
                className="field"
                type="password"
                autoComplete="current-password"
                value={p}
                onChange={(e) => setP(e.target.value)}
              />
              <label className="lbl" htmlFor="cap">
                Verificación
              </label>
              <div className="flex gap-2.5 items-center">
                <b className="bg-surface border border-dashed border-mut px-3.5 py-[9px] rounded-lg tracking-[2px] whitespace-nowrap select-none">
                  {cap[0]} + {cap[1]}
                </b>
                <button
                  className="btn btn-s"
                  type="button"
                  onClick={newCap}
                  title="Nuevo cálculo"
                  aria-label="Nuevo cálculo"
                >
                  ↻
                </button>
                <input
                  id="cap"
                  className="field"
                  inputMode="numeric"
                  placeholder="Resultado"
                  value={capAns}
                  onChange={(e) => setCapAns(e.target.value)}
                />
              </div>
              {msg && <div className={`msg ${msg.ok ? 'msg-ok' : ''}`}>{msg.t}</div>}
              {lockUntil > 0 && left > 0 && (
                <div className="msg">
                  Cuenta bloqueada por 3 intentos fallidos. Podrás volver a intentar en {left} s.
                </div>
              )}
              {btnLogin}
              <div className="flex justify-between flex-wrap gap-2 mt-3.5">
                <button className="link" onClick={() => go('vRec')}>
                  ¿Olvidaste tu contraseña?
                </button>
                <button className="link" onClick={() => go('vReg')}>
                  Crear cuenta
                </button>
              </div>
              <p className="text-xs text-mut mt-3">
                Demo: usuarios <b>admin</b>, <b>dra.ramirez</b> o <b>recepcion</b>, contraseña{' '}
                <b>Demo1234!</b>. Tras 3 intentos fallidos la cuenta se bloquea 60 segundos.
              </p>
            </>
          )}

          {tab === 'vReg' && (
            <>
              <h2 className="text-2xl mb-1">Crear cuenta</h2>
              <p className="text-mut mb-5">Las cuentas nuevas empiezan con permisos de Recepción.</p>
              <label className="lbl" htmlFor="g_n">
                Nombre completo
              </label>
              <input
                id="g_n"
                className="field"
                autoComplete="name"
                value={reg.n}
                onChange={(e) => setReg({ ...reg, n: e.target.value })}
              />
              <label className="lbl" htmlFor="g_u">
                Usuario
              </label>
              <input
                id="g_u"
                className="field"
                autoComplete="username"
                placeholder="minúsculas, números, . o _"
                value={reg.u}
                onChange={(e) => setReg({ ...reg, u: e.target.value })}
              />
              <label className="lbl" htmlFor="g_c">
                Correo
              </label>
              <input
                id="g_c"
                className="field"
                type="email"
                autoComplete="email"
                value={reg.c}
                onChange={(e) => setReg({ ...reg, c: e.target.value })}
              />
              <label className="lbl" htmlFor="g_p">
                Contraseña
              </label>
              <input
                id="g_p"
                className="field"
                type="password"
                autoComplete="new-password"
                value={reg.p}
                onChange={(e) => setReg({ ...reg, p: e.target.value })}
              />
              <Meter value={reg.p} />
              <label className="lbl" htmlFor="g_p2">
                Repetir contraseña
              </label>
              <input
                id="g_p2"
                className="field"
                type="password"
                autoComplete="new-password"
                value={reg.p2}
                onChange={(e) => setReg({ ...reg, p2: e.target.value })}
              />
              {msg && <div className={`msg ${msg.ok ? 'msg-ok' : ''}`}>{msg.t}</div>}
              <button className="btn btn-p btn-w" onClick={createAccount}>
                Crear cuenta
              </button>
              <button className="link mt-3.5 block" onClick={() => go('vLogin')}>
                Volver a iniciar sesión
              </button>
            </>
          )}

          {tab === 'vRec' && (
            <>
              <h2 className="text-2xl mb-1">Recuperar contraseña</h2>
              {rec.step === 1 ? (
                <>
                  <p className="text-mut mb-5">
                    Te enviaremos un código de 6 dígitos al correo de tu cuenta.
                  </p>
                  <label className="lbl" htmlFor="r_c">
                    Correo
                  </label>
                  <input
                    id="r_c"
                    className="field"
                    type="email"
                    placeholder="correo@clinica.bo"
                    value={rec.c}
                    onChange={(e) => setRec({ ...rec, c: e.target.value })}
                  />
                  <button className="btn btn-p btn-w" onClick={sendCode}>
                    Enviar código
                  </button>
                </>
              ) : (
                <>
                  <p className="text-mut mb-5">
                    Si el correo está registrado, recibirás el código. Demo: usa <b>123456</b>.
                  </p>
                  <label className="lbl" htmlFor="r_code">
                    Código
                  </label>
                  <input
                    id="r_code"
                    className="field"
                    inputMode="numeric"
                    maxLength={6}
                    value={rec.code}
                    onChange={(e) => setRec({ ...rec, code: e.target.value })}
                  />
                  <label className="lbl" htmlFor="r_p">
                    Nueva contraseña
                  </label>
                  <input
                    id="r_p"
                    className="field"
                    type="password"
                    autoComplete="new-password"
                    value={rec.p}
                    onChange={(e) => setRec({ ...rec, p: e.target.value })}
                  />
                  <Meter value={rec.p} />
                  <button className="btn btn-p btn-w" onClick={resetPass}>
                    Cambiar contraseña
                  </button>
                </>
              )}
              {recMsg && <div className="msg">{recMsg.t}</div>}
              <button
                className="link mt-3.5 block"
                onClick={() => {
                  setRec({ step: 1, c: '', code: '', p: '' })
                  go('vLogin')
                }}
              >
                Volver a iniciar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
