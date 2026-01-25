import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { refreshTokenThunk } from '@/features/auth/authThunks'
import type { TokenPayload } from '@/features/auth/authTypes'

const REFRESH_BUFFER_MS = 60_000

export const useTokenAutoRefresh = () => {
  const dispatch = useAppDispatch()
  const { accessToken, refreshToken, isAuthenticated } = useAppSelector((state) => state.auth)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    if (!isAuthenticated || !accessToken || !refreshToken) {
      return
    }

    const scheduleRefresh = (delayMs: number) => {
      timeoutRef.current = window.setTimeout(() => {
        dispatch(refreshTokenThunk({ refreshToken }))
      }, delayMs)
    }

    try {
      const payload = jwtDecode<TokenPayload>(accessToken)
      const expMs = payload.exp * 1000
      const now = Date.now()
      const delay = expMs - now - REFRESH_BUFFER_MS

      scheduleRefresh(Math.max(delay, 0))
    } catch (error) {
      // If decoding fails, attempt immediate refresh
      console.error('Failed to decode access token:', error)
      scheduleRefresh(0)
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [accessToken, refreshToken, isAuthenticated, dispatch])
}

export default useTokenAutoRefresh
