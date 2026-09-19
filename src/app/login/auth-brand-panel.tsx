import { CalendarDaysIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { ADMIN_APP_NAME } from '@/lib/brand'

const highlights = [
  { icon: CalendarDaysIcon, label: 'Session & court management' },
  { icon: UsersIcon, label: 'Member invites & roles' },
  { icon: SettingsIcon, label: 'Space settings & visibility' },
] as const

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 size-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-zinc-400">{ADMIN_APP_NAME}</p>
        <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-white">
          Run your spaces with clarity.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
          Sign in to manage sessions, members, and settings for your spaces.
        </p>
      </div>

      <blockquote className="relative z-10 max-w-md border-l-2 border-white/20 pl-4 text-zinc-300">
        &ldquo;Everything we need to run sessions and members — in one place.&rdquo;
      </blockquote>

      <ul className="relative z-10 space-y-3">
        {highlights.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-zinc-400">
            <Icon className="size-4 shrink-0 text-zinc-500" />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  )
}
