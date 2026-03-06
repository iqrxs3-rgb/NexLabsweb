import Link from 'next/link'
import { LanguageSwitcher, ThemeSwitcher } from './switchers'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '@/lib/utils'

// Simple top navigation bar with brand, language switcher, theme switcher and user avatar
export default function Navbar() {
  return (
    <header className={cn('w-full sticky top-0 z-50', 'bg-gradient-to-b from-black/50 via-black/30 to-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" aria-label="brand" />
          <span className="text-white font-semibold tracking-wide text-lg">NexLabs</span>
        </div>
        <nav aria-label="Main" className="hidden md:flex items-center gap-4">
          <Link href="/dashboard"><span className="text-white text-sm hover:underline">Dashboard</span></Link>
          <Link href="/docs"><span className="text-white text-sm hover:underline">Docs</span></Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <AvatarMenu />
        </div>
      </div>
      {/* decorative background */}
      <div className="absolute -top-12 left-0 w-full h-40 pointer-events-none overflow-hidden">
        <div className="absolute right-0 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 opacity-20 blur-3xl" />
      </div>
    </header>
  )
}

function AvatarMenu() {
  // placeholder user avatar with a simple dropdown-like behaviour
  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src="/default-avatar.png" alt="user"/>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      {/* Simple dropdown indicator could be added here in future */}
    </div>
  )
}
