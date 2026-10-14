export default function Bars({ data }) {
  const max = Math.max(...data.map((d) => d[1]), 1)
  return (
    <div className="flex items-end gap-3.5 h-[180px] pt-2.5">
      {data.map(([label, value]) => (
        <div
          key={label}
          className="flex-1 flex flex-col items-center justify-end h-full text-xs text-mut"
        >
          <em className="not-italic font-semibold text-txt mb-[3px]">{value}</em>
          <span
            className="block w-full bg-acc rounded-t-md min-h-[4px]"
            style={{ height: `${(value / max) * 100}%` }}
          />
          {label}
        </div>
      ))}
    </div>
  )
}
