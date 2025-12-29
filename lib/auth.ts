// lib/auth.ts

const TOKEN_KEY = "authToken"

// Save token in localStorage
export const saveToken = (token: string) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

// Get token
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

// Remove token
export const clearToken = () => {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}
