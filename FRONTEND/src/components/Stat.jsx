const tonos = {
  acc: { borde: 'border-l-acc2', fondo: 'bg-sec text-txt' },
  warn: { borde: 'border-l-warn', fondo: 'bg-warn text-warn-txt' },
  ok: { borde: 'border-l-ok', fondo: 'bg-ok text-ok-txt' },
  bad: { borde: 'border-l-bad', fondo: 'bg-bad text-bad-txt' },
  info: { borde: 'border-l-info', fondo: 'bg-info text-info-txt' },
}

export default function Stat({ icono: Icono, etiqueta, valor, detalle, tono = 'acc' }) {
  const t = tonos[tono] ?? tonos.acc
  return (
    <div className={`card border-l-4 ${t.borde} flex items-center justify-between gap-3 min-h-[94px]`}>
      <div className="min-w-0">
        <small className="block text-mut leading-tight">{etiqueta}</small>
        <strong className="text-[30px] font-bold leading-tight block">{valor}</strong>
        {detalle && <span className="text-[11px] text-mut">{detalle}</span>}
      </div>
      {Icono && (
        <span className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${t.fondo}`}>
          <Icono size={20} />
        </span>
      )}
    </div>
  )
}