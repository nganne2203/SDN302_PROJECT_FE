import Cookies from 'js-cookie'

type StorageType = 'local' | 'session' | 'cookie'

interface CookieOptions {
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  expires: 7,
  path: '/',
  secure: true,
  sameSite: 'strict',
}

export const setStorage = (
  key: string,
  value: string,
  type: StorageType = 'local',
  options?: CookieOptions
): void => {
  try {
    switch (type) {
      case 'local':
        localStorage.setItem(key, value)
        break
      case 'session':
        sessionStorage.setItem(key, value)
        break
      case 'cookie':
        Cookies.set(key, value, { ...DEFAULT_COOKIE_OPTIONS, ...options })
        break
    }
  } catch (error) {
    console.error(`Error setting ${type} storage:`, error)
  }
}

export const getStorage = (key: string, type: StorageType = 'local'): string | null => {
  try {
    switch (type) {
      case 'local':
        return localStorage.getItem(key)
      case 'session':
        return sessionStorage.getItem(key)
      case 'cookie':
        return Cookies.get(key) || null
      default:
        return null
    }
  } catch (error) {
    console.error(`Error getting ${type} storage:`, error)
    return null
  }
}

export const removeStorage = (key: string, type: StorageType = 'local'): void => {
  try {
    switch (type) {
      case 'local':
        localStorage.removeItem(key)
        break
      case 'session':
        sessionStorage.removeItem(key)
        break
      case 'cookie':
        Cookies.remove(key)
        break
    }
  } catch (error) {
    console.error(`Error removing ${type} storage:`, error)
  }
}

export const clearStorage = (type: StorageType = 'local'): void => {
  try {
    switch (type) {
      case 'local':
        localStorage.clear()
        break
      case 'session':
        sessionStorage.clear()
        break
      case 'cookie':
        // Clear all cookies
        Object.keys(Cookies.get()).forEach((cookieName) => {
          Cookies.remove(cookieName)
        })
        break
    }
  } catch (error) {
    console.error(`Error clearing ${type} storage:`, error)
  }
}

// JSON helpers
export const setJsonStorage = <T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): void => {
  setStorage(key, JSON.stringify(value), type)
}

export const getJsonStorage = <T>(key: string, type: StorageType = 'local'): T | null => {
  const value = getStorage(key, type)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}
