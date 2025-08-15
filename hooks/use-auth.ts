"use client"

import { useState, useEffect, useCallback } from "react"

const AUTH_STORAGE_KEY = "mysc-admin-auth"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface AuthSession {
  isAuthenticated: boolean
  timestamp: number
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if session is valid
  const isSessionValid = useCallback((session: AuthSession): boolean => {
    const now = Date.now()
    return session.isAuthenticated && now - session.timestamp < SESSION_DURATION
  }, [])

  // Load authentication state from localStorage
  const loadAuthState = useCallback(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const session: AuthSession = JSON.parse(stored)
        if (isSessionValid(session)) {
          setIsAuthenticated(true)
        } else {
          // Session expired, clear it
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setIsAuthenticated(false)
        }
      }
    } catch (error) {
      console.error("Failed to load auth state:", error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [isSessionValid])

  // Login function
  const login = useCallback((password: string): boolean => {
    // Simple password check (in production, this would be more secure)
    if (password === "mysc2025") {
      const session: AuthSession = {
        isAuthenticated: true,
        timestamp: Date.now(),
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
  }, [])

  // Check session validity periodically
  useEffect(() => {
    loadAuthState()

    // Check session every 5 minutes
    const interval = setInterval(
      () => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          try {
            const session: AuthSession = JSON.parse(stored)
            if (!isSessionValid(session)) {
              logout()
            }
          } catch (error) {
            logout()
          }
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [loadAuthState, isSessionValid, logout])

  // Get remaining session time
  const getSessionTimeRemaining = useCallback((): number => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const session: AuthSession = JSON.parse(stored)
        const elapsed = Date.now() - session.timestamp
        return Math.max(0, SESSION_DURATION - elapsed)
      } catch (error) {
        return 0
      }
    }
    return 0
  }, [])

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getSessionTimeRemaining,
  }
}
