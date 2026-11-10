export default function Bars({ datos }) {
  const maximo = Math.max(...datos.map((d) => d[1]), 1)
  return (
    <div className="flex items-end gap-3.5 h-[180px] pt-2.5">
      {datos.map(([etiqueta, valor]) => (
        <div
          key={etiqueta}
          className="flex-1 flex flex-col items-center justify-end h-full text-xs text-mut"
        >
          <em className="not-italic font-semibold text-txt mb-[3px]">{valor}</em>
          <span
            className="block w-full bg-acc2 rounded-t-md min-h-[4px]"
            style={{ height: `${(valor / maximo) * 100}%` }}
          />
          {etiqueta}
        </div>
      ))}
    </div>
  )
}
