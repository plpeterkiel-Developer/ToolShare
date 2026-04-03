export default function ToolsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-stone-200 mb-6" />
      <div className="h-10 w-full rounded-xl bg-stone-200 mb-6" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="h-48 bg-stone-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/2 rounded bg-stone-200" />
              <div className="h-4 w-1/3 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
