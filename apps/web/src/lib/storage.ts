export const isBrowser = typeof (globalThis as any).window !== "undefined"

export const storage = {
  setItem(key: string, value: string) {
    if (!isBrowser) return
    ;(globalThis as any).localStorage.setItem(key, value)
  },

  getItem(key: string) {
    if (!isBrowser) return null
    return (globalThis as any).localStorage.getItem(key)
  },

  removeItem(key: string) {
    if (!isBrowser) return
    ;(globalThis as any).localStorage.removeItem(key)
  },
}