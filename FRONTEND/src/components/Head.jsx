export default function Head({ titulo, subtitulo, children }) {
  return (
    <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
      <div>
        <h2 className="text-[26px]">{titulo}</h2>
        <p className="text-mut">{subtitulo}</p>
      </div>
      {children}
    </div>
  )
}
