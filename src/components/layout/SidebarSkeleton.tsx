export function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-stone-200 md:bg-white">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="h-8 w-8 rounded-lg bg-stone-200 animate-pulse" />
        <div className="h-5 w-24 rounded bg-stone-200 animate-pulse" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="h-5 w-5 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-stone-200 animate-pulse" />
          </div>
        ))}
      </nav>
    </aside>
  )
}
