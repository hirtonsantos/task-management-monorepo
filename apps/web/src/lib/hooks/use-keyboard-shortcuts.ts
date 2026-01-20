"use client"

import { useEffect } from "react"

interface Shortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      shortcuts.forEach(({ key, ctrlKey, shiftKey, altKey, callback }) => {
        const matchKey = e.key.toLowerCase() === key.toLowerCase()
        const matchCtrl = !ctrlKey || e.ctrlKey || e.metaKey
        const matchShift = !shiftKey || e.shiftKey
        const matchAlt = !altKey || e.altKey

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          e.preventDefault()
          callback()
        }
      })
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [shortcuts])
}
