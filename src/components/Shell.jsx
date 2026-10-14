import { MENU, ROLES } from '../data/seed'

export default function Shell({ view, setView, auth, onLogout, children }) {
  const items = MENU.filter((m) => m[3].includes(auth.role))

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-[#cfe1e6] flex flex-wrap lg:flex-col lg:sticky lg:top-0 lg:h-screen p-2.5 lg:p-5">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg px-2 py-1 lg:pb-7">
          <span className="bg-acc w-[30px] h-[30px] rounded-lg grid place-items-center text-base">✚</span>
          SGP
        </div>

        <nav className="order-3 w-full lg:w-auto flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible lg:order-none">
          {items.map(([id, icon, label]) => (
            <button
              key={id}
              className={`navbtn w-auto lg:w-full whitespace-nowrap shrink-0 ${
                view === id ? 'navbtn-on' : ''
              }`}
              onClick={() => setView(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto lg:mt-auto lg:ml-0 flex items-center gap-2.5 lg:block text-[13px] px-2 lg:p-3 lg:border-t lg:border-ink2">
          <div className="hidden lg:block">
            <b className="block text-white">{auth.name}</b>
            <span>{ROLES[auth.role]}</span>
          </div>
          <b className="lg:hidden text-white text-sm">{auth.name.split(' ')[0]}</b>
          <button
            className="link text-[#7fd0d8] lg:mt-2 hover:underline"
            style={{ color: '#7fd0d8' }}
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="p-4 md:px-8 md:py-7 min-w-0">{children}</main>
    </div>
  )
}
