import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
}

export default function GlobalHotkeys() {
  const navigate = useNavigate()
  const location = useLocation()
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const lastG = useRef<number | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      if (e.key === '?') {
        e.preventDefault()
        setShortcutsOpen(true)
        return
      }

      if (e.key === 'Escape') {
        setShortcutsOpen(false)
        setMobileSidebarOpen(false)
        return
      }

      if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
        const el = document.querySelector<HTMLInputElement>('input[data-search]')
        if (el) {
          e.preventDefault()
          el.focus()
          el.select?.()
        }
        return
      }

      if (e.key === 'g' || e.key === 'G') {
        lastG.current = Date.now()
        return
      }

      if (lastG.current && Date.now() - lastG.current < 900) {
        const k = e.key.toLowerCase()
        if (k === 'd') navigate('/dashboard')
        if (k === 'm') navigate('/dashboard/live-map')
        if (k === 'a') navigate('/dashboard/alerts')
        if (k === 'u') navigate('/dashboard/users')
        lastG.current = null
        return
      }

      if (e.key === 'k' || e.key === 'K') {
        navigate('/dashboard/live-map/kiosk')
        return
      }

      if ((e.key === 'f' || e.key === 'F') && location.pathname.startsWith('/dashboard/live-map')) {
        window.dispatchEvent(new CustomEvent('eas:toggleFullscreen'))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [location.pathname, navigate, setMobileSidebarOpen, setShortcutsOpen])

  return null
}

