export default function RequestsLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-stone-200 mb-6" />
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-32 rounded-xl bg-stone-200" />
        <div className="h-10 w-32 rounded-xl bg-stone-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 w-full rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
    </div>
  )
}
