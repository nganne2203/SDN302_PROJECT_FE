import type { Middleware } from '@reduxjs/toolkit'

// Logger middleware for development
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (import.meta.env.DEV) {
    console.group(typeof action === 'object' && action !== null && 'type' in action ? (action as { type: string }).type : 'Unknown Action')
    console.log('Previous State:', store.getState())
    console.log('Action:', action)
  }

  const result = next(action)

  if (import.meta.env.DEV) {
    console.log('Next State:', store.getState())
    console.groupEnd()
  }

  return result
}

// Error handling middleware
export const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action)
  } catch (error) {
    console.error('Redux Error:', error)
    throw error
  }
}
