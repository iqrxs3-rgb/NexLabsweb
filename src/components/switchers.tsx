'use client'

import { useTheme } from '@/context/providers'
import { useLanguage } from '@/context/providers'
import { Moon, Sun, Monitor, Globe, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <Globe className="h-4 w-4" />
        <span>{language === 'ar' ? 'العربية' : 'English'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-32 rounded-md border bg-background shadow-lg z-50">
            <button
              onClick={() => { setLanguage('en'); setIsOpen(false) }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent ${language === 'en' ? 'font-bold' : ''}`}
            >
              English
            </button>
            <button
              onClick={() => { setLanguage('ar'); setIsOpen(false) }}
              className={`w-full px-4 py-2 text-right text-sm hover:bg-accent ${language === 'ar' ? 'font-bold' : ''}`}
            >
              العربية
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        {theme === 'dark' && <Moon className="h-4 w-4" />}
        {theme === 'light' && <Sun className="h-4 w-4" />}
        {theme === 'system' && <Monitor className="h-4 w-4" />}
        <span>
          {language === 'ar' 
            ? (theme === 'dark' ? 'داكن' : theme === 'light' ? 'فاتح' : 'تلقائي')
            : (theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System')
          }
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 rounded-md border bg-background shadow-lg z-50">
            <button
              onClick={() => { setTheme('light'); setIsOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent ${theme === 'light' ? 'font-bold' : ''}`}
            >
              <Sun className="h-4 w-4" />
              {language === 'ar' ? 'فاتح' : 'Light'}
            </button>
            <button
              onClick={() => { setTheme('dark'); setIsOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent ${theme === 'dark' ? 'font-bold' : ''}`}
            >
              <Moon className="h-4 w-4" />
              {language === 'ar' ? 'داكن' : 'Dark'}
            </button>
            <button
              onClick={() => { setTheme('system'); setIsOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent ${theme === 'system' ? 'font-bold' : ''}`}
            >
              <Monitor className="h-4 w-4" />
              {language === 'ar' ? 'تلقائي' : 'System'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
