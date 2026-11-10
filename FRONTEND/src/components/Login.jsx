import { useEffect, useRef, useState } from 'react'
import { FiActivity, FiHeart, FiLock, FiRefreshCw, FiUser, FiUsers } from 'react-icons/fi'
import { correoValido, nivelContrasena, textoContrasena, colorContrasena } from '../data/utils'

const TIEMPO_BLOQUEO = 60 // demo: 60 s. El backend decide el tiempo real (ej. 5 min)

const captchaAleatorio = () => [1 + Math.floor(Math.random() * 9), 1 + Math.floor(Math.random() * 9)]

function Meter({ value }) {
  const lvl = value ? nivelContrasena(value) : 0
  return (
    <>
      <div className="flex gap-1 mt-[7px]">
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            className="flex-1 h-[5px] rounded-[3px] bg-line transition-colors"
            style={{ background: i < lvl ? colorContrasena[lvl] : undefined }}
          />
        ))}
      </div>
      <div className="text-xs text-mut mt-1 min-h-4">{value ? textoContrasena[lvl] : ''}</div>
    </>
  )
}

function Pulse() {
  return (
    <svg
      className="w-full max-w-[420px] h-[60px]"
      viewBox="0 0 420 60"
      fill="none"
      stroke="#4F7E85"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 32h120l14-26 22 50 18-38 10 14h236" />
    </svg>
  )
}

export default function Login({ usuarios, alIniciarSesion, alRegistrar, registrarEvento }) {
  const [pestana, setPestana] = useState('vLogin')
  const [captcha, setCaptcha] = useState(captchaAleatorio)
  const [resCaptcha, setResCaptcha] = useState('')
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState(0)
  const [segRestantes, setSegRestantes] = useState(0)
  const tempBloqueo = useRef(null)

  const [registro, setRegistro] = useState({ nombre: '', usuario: '', correo: '', contrasena: '', contrasena2: '' })
  const [recuperacion, setRecuperacion] = useState({ paso: 1, correo: '', codigo: '', contrasena: '' })
  const [usuarioRec, setUsuarioRec] = useState(null)
  const [msgRec, setMsgRec] = useState(null)

  const nuevoCaptcha = () => {
    setCaptcha(captchaAleatorio())
    setResCaptcha('')
  }

  useEffect(() => {
    if (!bloqueadoHasta) return
    const tick = () => {
      const s = Math.ceil((bloqueadoHasta - Date.now()) / 1000)
      if (s <= 0) {
        setBloqueadoHasta(0)
        setIntentos(0)
        setSegRestantes(0)
        setMensaje(null)
        nuevoCaptcha()
      } else setSegRestantes(s)
    }
    tick()
    tempBloqueo.current = setInterval(tick, 1000)
    return () => clearInterval(tempBloqueo.current)
  }, [bloqueadoHasta])

  const irAA = (v) => {
    setPestana(v)
    setMensaje(null)
    setMsgRec(null)
  }

  const intentarIngresar = () => {
    if (!usuario || !contrasena) return setMensaje({ t: 'Completa usuario y contraseña.' })
    if (+resCaptcha !== captcha[0] + captcha[1]) {
      nuevoCaptcha()
      return setMensaje({ t: 'La verificación es incorrecta. Resuelve el nuevo cálculo.' })
    }
    const encontrado = usuarios.find((x) => x.usuario === usuario && x.contrasena === contrasena)
    if (!encontrado) {
      const f = intentos + 1
      setIntentos(f)
      nuevoCaptcha()
      registrarEvento(`Intento fallido (${f}/3)`, usuario)
      if (f >= 3) {
        setBloqueadoHasta(Date.now() + TIEMPO_BLOQUEO * 1000)
        registrarEvento('Cuenta bloqueada', usuario)
        return
      }
      return setMensaje({ t: `Usuario o contraseña incorrectos. Intento ${f} de 3.` })
    }
    setIntentos(0)
    setContrasena('')
    setMensaje(null)
    registrarEvento('Ingreso', encontrado.usuario)
    alIniciarSesion(encontrado)
  }

  const accesoDemo = (rol) => {
    const demo = usuarios.find((x) => x.rol === rol)
    if (!demo) return setMensaje({ t: 'No hay un usuario de demostración para este rol.' })
    setIntentos(0)
    setMensaje(null)
    registrarEvento('Ingreso (demostración)', demo.usuario)
    alIniciarSesion(demo)
  }

  const crearCuenta = () => {
    const { nombre, usuario: gu, correo, contrasena: gp, contrasena2 } = registro
    const err = !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{3,60}$/.test(nombre)
      ? 'Escribe tu nombre completo, solo con letras.'
      : !/^[a-z0-9._]{4,20}$/.test(gu)
        ? 'El usuario usa de 4 a 20 caracteres: minúsculas, números, punto o guion bajo.'
        : usuarios.some((x) => x.usuario === gu)
          ? 'Ese usuario ya existe.'
          : !correoValido(correo)
            ? 'Escribe un correo válido.'
            : nivelContrasena(gp) < 2
              ? 'La contraseña es débil. Debe ser al menos intermedia.'
              : gp !== contrasena2
                ? 'Las contraseñas no coinciden.'
                : ''
    if (err) return setMensaje({ t: err })
    alRegistrar({ usuario: gu, nombre, correo, contrasena: gp, rol: 'recep' })
    registrarEvento('Usuario registrado', gu)
    setRegistro({ nombre: '', usuario: '', correo: '', contrasena: '', contrasena2: '' })
    setPestana('vLogin')
    setUsuario(gu)
    setMensaje({ t: 'Cuenta creada. Ya puedes iniciar sesión.', ok: true })
  }

  const enviarCodigo = () => {
    if (!correoValido(recuperacion.correo)) return setMsgRec({ t: 'Escribe un correo válido.' })
    const encontrado = usuarios.find((x) => x.correo === recuperacion.correo)
    setUsuarioRec(encontrado || null)
    registrarEvento('Recuperación solicitada', encontrado ? encontrado.usuario : recuperacion.correo)
    setRecuperacion((r) => ({ ...r, paso: 2 }))
    setMsgRec(null)
  }

  const restablecerContrasena = () => {
    if (recuperacion.codigo !== '123456') return setMsgRec({ t: 'El código es incorrecto o venció.' })
    if (nivelContrasena(recuperacion.contrasena) < 2) return setMsgRec({ t: 'La contraseña es débil. Debe ser al menos intermedia.' })
    if (usuarioRec) alRegistrar({ ...usuarioRec, contrasena: recuperacion.contrasena })
    setRecuperacion({ paso: 1, correo: '', codigo: '', contrasena: '' })
    setMsgRec(null)
    setPestana('vLogin')
    setMensaje({ t: 'Contraseña actualizada. Inicia sesión.', ok: true })
  }

  const botonIngresar = bloqueadoHasta ? (
    <button className="btn btn-p btn-w" disabled>
      Entrar
    </button>
  ) : (
    <button className="btn btn-p btn-w" onClick={intentarIngresar}>
      Entrar
    </button>
  )

  return (
    <section className="min-h-full grid md:grid-cols-[1.1fr_1fr] overflow-x-hidden">
      <div className="hidden md:flex bg-ink p-14 flex-col justify-between">
        <div className="flex items-center gap-2.5 text-txt font-bold text-lg">
          <span className="bg-acc w-[30px] h-[30px] rounded-lg grid place-items-center text-base text-txt">
            <FiHeart size={18} />
          </span>
          SGP
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Pulse />
          <h1 className="text-[38px] leading-[1.15] text-txt max-w-[14ch] mt-6">
            Sistema de Gestión de Pacientes
          </h1>
          <p className="max-w-[40ch] text-mut mt-3.5 text-lg">
            Organización clínica eficiente y segura.
          </p>
        </div>
        <small className="text-mut max-w-[38ch] text-center">
          Ingresa con tu usuario y contraseña
        </small>
      </div>

      <div className="grid place-items-center p-4 sm:p-6 md:p-8 w-full min-w-0">
        <div className="w-full max-w-[400px] min-w-0 bg-card border border-line rounded-card shadow-sm p-5 sm:p-6">
          <div className="md:hidden flex items-center gap-2.5 mb-5">
            <span className="bg-acc w-[34px] h-[34px] rounded-xl grid place-items-center text-txt">
              <FiHeart size={19} />
            </span>
            <span className="leading-tight">
              <b className="block text-txt">SGP</b>
              <small className="block text-[10px] uppercase tracking-wide text-mut">
                Gestión de pacientes
              </small>
            </span>
          </div>
          {pestana === 'vLogin' && (
            <>
              <h2 className="text-2xl mb-1">Acceso al sistema</h2>
              <p className="text-mut mb-4">Selecciona tu perfil para continuar.</p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => accesoDemo('recep')}
                  className="text-left rounded-xl border border-line bg-white p-3 hover:border-acc hover:shadow-sm transition"
                >
                  <span className="w-9 h-9 rounded-lg bg-warn text-warn-txt grid place-items-center mb-2">
                    <FiUsers size={17} />
                  </span>
                  <b className="block text-sm">Recepción</b>
                  <small className="block text-[11px] text-mut leading-tight">
                    Pacientes, médicos, agendas y citas
                  </small>
                </button>
                <button
                  type="button"
                  onClick={() => accesoDemo('medico')}
                  className="text-left rounded-xl border border-line bg-white p-3 hover:border-acc hover:shadow-sm transition"
                >
                  <span className="w-9 h-9 rounded-lg bg-sec text-txt grid place-items-center mb-2">
                    <FiActivity size={17} />
                  </span>
                  <b className="block text-sm">Médico</b>
                  <small className="block text-[11px] text-mut leading-tight">
                    Agenda, consultas e historial clínico
                  </small>
                </button>
              </div>
              <div className="flex items-center gap-2.5 my-4 text-[10px] text-mut uppercase tracking-wide">
                <span className="h-px bg-line flex-1" />
                o usa tu usuario y contraseña
                <span className="h-px bg-line flex-1" />
              </div>

              <label className="lbl" htmlFor="u" style={{ marginTop: 0 }}>
                Usuario
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" size={16} />
                <input
                  id="u"
                  className="field"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="username"
                  placeholder="dra.ramirez"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
              <label className="lbl" htmlFor="p">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" size={16} />
                <input
                  id="p"
                  className="field"
                  style={{ paddingLeft: '2.5rem' }}
                  type="password"
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
              <label className="lbl" htmlFor="cap">
                Verificación
              </label>
              <div className="flex gap-2.5 items-center">
                <b className="bg-surface border border-dashed border-mut px-3.5 py-[9px] rounded-lg tracking-[2px] whitespace-nowrap select-none">
                  {captcha[0]} + {captcha[1]}
                </b>
                <button
                  className="btn btn-s"
                  type="button"
                  onClick={nuevoCaptcha}
                  title="Nuevo cálculo"
                  aria-label="Nuevo cálculo"
                >
                  <FiRefreshCw size={15} />
                </button>
                <input
                  id="cap"
                  className="field"
                  inputMode="numeric"
                  placeholder="Resultado"
                  value={resCaptcha}
                  onChange={(e) => setResCaptcha(e.target.value)}
                />
              </div>
              {mensaje && <div className={`msg ${mensaje.ok ? 'msg-ok' : ''}`}>{mensaje.t}</div>}
              {bloqueadoHasta > 0 && segRestantes > 0 && (
                <div className="msg">
                  Cuenta bloqueada por 3 intentos fallidos. Podrás volver a intentar en {segRestantes} s.
                </div>
              )}
              {botonIngresar}
              <div className="flex justify-between flex-wrap gap-2 mt-3.5">
                <button className="link" onClick={() => irAA('vRec')}>
                  ¿Olvidaste tu contraseña?
                </button>
                <button className="link" onClick={() => irAA('vReg')}>
                  Crear cuenta
                </button>
              </div>
              <p className="text-xs text-mut mt-3">
                Credenciales demo: <b>recepcion</b> o <b>dra.ramirez</b>, contraseña <b>Demo1234!</b>. Tras
                3 intentos fallidos la cuenta se bloquea 60 segundos.
              </p>
            </>
          )}

          {pestana === 'vReg' && (
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
                value={registro.nombre}
                onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
              />
              <label className="lbl" htmlFor="g_u">
                Usuario
              </label>
              <input
                id="g_u"
                className="field"
                autoComplete="username"
                placeholder="minúsculas, números, . o _"
                value={registro.usuario}
                onChange={(e) => setRegistro({ ...registro, usuario: e.target.value })}
              />
              <label className="lbl" htmlFor="g_c">
                Correo
              </label>
              <input
                id="g_c"
                className="field"
                type="email"
                autoComplete="email"
                value={registro.correo}
                onChange={(e) => setRegistro({ ...registro, correo: e.target.value })}
              />
              <label className="lbl" htmlFor="g_p">
                Contraseña
              </label>
              <input
                id="g_p"
                className="field"
                type="password"
                autoComplete="new-password"
                value={registro.contrasena}
                onChange={(e) => setRegistro({ ...registro, contrasena: e.target.value })}
              />
              <Meter value={registro.contrasena} />
              <label className="lbl" htmlFor="g_p2">
                Repetir contraseña
              </label>
              <input
                id="g_p2"
                className="field"
                type="password"
                autoComplete="new-password"
                value={registro.contrasena2}
                onChange={(e) => setRegistro({ ...registro, contrasena2: e.target.value })}
              />
              {mensaje && <div className={`msg ${mensaje.ok ? 'msg-ok' : ''}`}>{mensaje.t}</div>}
              <button className="btn btn-p btn-w" onClick={crearCuenta}>
                Crear cuenta
              </button>
              <button className="link mt-3.5 block" onClick={() => irAA('vLogin')}>
                Volver a iniciar sesión
              </button>
            </>
          )}

          {pestana === 'vRec' && (
            <>
              <h2 className="text-2xl mb-1">Recuperar contraseña</h2>
              {recuperacion.paso === 1 ? (
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
                    value={recuperacion.correo}
                    onChange={(e) => setRecuperacion({ ...recuperacion, correo: e.target.value })}
                  />
                  <button className="btn btn-p btn-w" onClick={enviarCodigo}>
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
                    value={recuperacion.codigo}
                    onChange={(e) => setRecuperacion({ ...recuperacion, codigo: e.target.value })}
                  />
                  <label className="lbl" htmlFor="r_p">
                    Nueva contraseña
                  </label>
                  <input
                    id="r_p"
                    className="field"
                    type="password"
                    autoComplete="new-password"
                    value={recuperacion.contrasena}
                    onChange={(e) => setRecuperacion({ ...recuperacion, contrasena: e.target.value })}
                  />
                  <Meter value={recuperacion.contrasena} />
                  <button className="btn btn-p btn-w" onClick={restablecerContrasena}>
                    Cambiar contraseña
                  </button>
                </>
              )}
              {msgRec && <div className="msg">{msgRec.t}</div>}
              <button
                className="link mt-3.5 block"
                onClick={() => {
                  setRecuperacion({ paso: 1, correo: '', codigo: '', contrasena: '' })
                  irAA('vLogin')
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
