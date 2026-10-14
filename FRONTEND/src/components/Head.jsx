export default function Head({ title, sub, children }) {
  return (
    <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
      <div>
        <h2 className="text-[26px]">{title}</h2>
        <p className="text-mut">{sub}</p>
      </div>
      {children}
    </div>
  )
}
