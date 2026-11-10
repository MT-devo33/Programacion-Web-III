import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import { MENU, ROLES } from '../data/seed'

const iconos = {
  dash: FiGrid,
  pac: FiUsers,
  med: FiBriefcase,
  age: FiCalendar,
  cit: FiCalendar,
  rep: FiFileText,
  aud: FiShield,
  agm: FiCalendar,
  misp: FiUsers,
  con: FiClipboard,
  his: FiFolder,
}

export default function Shell({ vista, setVista, sesion, alCerrarSesion, hijos }) {
  const elementos = MENU.filter((m) => m[3].includes(sesion.rol))

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-ink text-txt flex flex-wrap lg:flex-col lg:sticky lg:top-0 lg:h-screen p-2.5 lg:p-5">
        <div className="flex items-center gap-2.5 font-bold text-lg px-2 py-1 lg:pb-5">
          <span className="bg-acc w-[32px] h-[32px] rounded-lg grid place-items-center text-txt">
            <FiActivity size={19} />
          </span>
          <span className="leading-tight">
            SGP
            <small className="block text-[10px] font-medium tracking-wide text-mut uppercase">
              Gestión de pacientes
            </small>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 mx-2 mb-5 px-3 py-2 rounded-lg bg-ink2 border border-line">
          <span className="w-2 h-2 rounded-full bg-acc" />
          <div className="text-[12px] leading-tight">
            <b className="block text-txt">{ROLES[sesion.rol]}</b>
            <span className="text-mut">Modo demostración</span>
          </div>
        </div>

        <nav className="order-3 w-full lg:w-auto flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible lg:order-none pb-1 lg:pb-0">
          {elementos.map(([id, , etiqueta]) => {
            const Icono = iconos[id]
            return (
              <button
                key={id}
                className={`navbtn w-auto lg:w-full whitespace-nowrap shrink-0 ${
                  vista === id ? 'navbtn-on' : ''
                }`}
                onClick={() => setVista(id)}
                title={etiqueta}
              >
                {Icono ? <Icono size={17} /> : null}
                {etiqueta}
              </button>
            )
          })}
        </nav>

        <div className="ml-auto lg:mt-auto lg:ml-0 flex items-center gap-2.5 lg:block text-[13px] px-2 lg:p-3 lg:border-t lg:border-line">
          <div className="hidden lg:block">
            <b className="block text-txt">{sesion.nombre}</b>
            <span className="text-mut">{ROLES[sesion.rol]}</span>
          </div>
          <b className="lg:hidden text-txt text-sm">{sesion.nombre.split(' ')[0]}</b>
          <button
            className="link text-txt lg:mt-2 hover:underline inline-flex items-center gap-1.5"
            onClick={alCerrarSesion}
          >
            <FiLogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="p-4 md:px-8 md:py-7 min-w-0">{hijos}</main>
    </div>
  )
}