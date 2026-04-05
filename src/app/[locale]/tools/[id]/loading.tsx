export default function ToolDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-64 w-full rounded-2xl bg-stone-200 mb-6" />
      <div className="h-8 w-2/3 rounded-lg bg-stone-200 mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-5/6 rounded bg-stone-200" />
        <div className="h-4 w-3/4 rounded bg-stone-200" />
      </div>
      <div className="mt-8 h-12 w-40 rounded-xl bg-stone-200" />
    </div>
  )
}
