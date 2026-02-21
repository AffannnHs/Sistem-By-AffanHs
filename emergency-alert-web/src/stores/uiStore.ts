import { create } from 'zustand'

type UIState = {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  shortcutsOpen: boolean
  setSidebarCollapsed: (v: boolean) => void
  setMobileSidebarOpen: (v: boolean) => void
  setShortcutsOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  shortcutsOpen: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
}))

