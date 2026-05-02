import { useCallback, useLayoutEffect, useState } from 'react'

const STORAGE_KEY = 'dashvis:theme'

/** When embedded in WebApp-Vis, theme + CSS variables are scoped to this root (see dashboard-v2.css). */
export const DASHVIS_THEME_ROOT_ID = 'viszmo-dashboard-v2-root'

export function usePersistentTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(STORAGE_KEY) !== 'light'
  })

  useLayoutEffect(() => {
    const scoped = document.getElementById(DASHVIS_THEME_ROOT_ID)
    if (scoped) {
      // Avoid fighting the marketing site: do not toggle `dark` on <html> here.
      document.documentElement.classList.remove('dark')
      scoped.classList.toggle('dark', isDarkMode)
    } else {
      // Standalone dashvis (or tests): keep previous behavior.
      document.documentElement.classList.toggle('dark', isDarkMode)
    }
  }, [isDarkMode])

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { isDarkMode, toggleTheme }
}
