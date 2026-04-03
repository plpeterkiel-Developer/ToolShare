export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-stone-200 mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-3/4 rounded bg-stone-200" />
        <div className="h-4 w-5/6 rounded bg-stone-200" />
      </div>
    </div>
  )
}
