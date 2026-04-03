export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-stone-200" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg bg-stone-200" />
          <div className="h-4 w-24 rounded bg-stone-200" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-10 w-full rounded-xl bg-stone-200" />
        <div className="h-10 w-full rounded-xl bg-stone-200" />
        <div className="h-10 w-full rounded-xl bg-stone-200" />
      </div>
    </div>
  )
}
