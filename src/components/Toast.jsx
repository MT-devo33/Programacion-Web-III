export default function Toast({ text }) {
  return (
    <div
      className={`fixed bottom-5 right-5 bg-ink text-white px-4 py-3 rounded-lg z-10 transition-all duration-300 pointer-events-none ${
        text ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      }`}
    >
      {text}
    </div>
  )
}
