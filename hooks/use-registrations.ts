"use client"

import { useState, useEffect, useCallback } from "react"

export interface Registration {
  id: string
  name: string
  employeeId: string
  selectedDate: string
  timestamp: number
}

export const TRAINING_DATES = [
  { id: "aug20", date: "2025-08-20", label: "8월 20일 (수요일)", capacity: 25 },
  { id: "aug21", date: "2025-08-21", label: "8월 21일 (목요일)", capacity: 25 },
  { id: "aug22", date: "2025-08-22", label: "8월 22일 (금요일)", capacity: 25 },
]

const STORAGE_KEY = "mysc-registrations"

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load registrations from localStorage
  const loadRegistrations = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        setRegistrations(data)
      }
    } catch (error) {
      console.error("Failed to load registrations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save registrations to localStorage
  const saveRegistrations = useCallback((data: Registration[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setRegistrations(data)
    } catch (error) {
      console.error("Failed to save registrations:", error)
    }
  }, [])

  // Add new registration
  const addRegistration = useCallback(
    (registration: Omit<Registration, "id" | "timestamp">) => {
      const newRegistration: Registration = {
        ...registration,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }

      setRegistrations((prev) => {
        const updated = [...prev, newRegistration]
        saveRegistrations(updated)
        return updated
      })

      return newRegistration
    },
    [saveRegistrations],
  )

  // Get registration count for a specific date
  const getRegistrationCount = useCallback(
    (dateId: string) => {
      return registrations.filter((reg) => reg.selectedDate === dateId).length
    },
    [registrations],
  )

  // Check if user is already registered
  const isAlreadyRegistered = useCallback(
    (employeeId: string) => {
      return registrations.some((reg) => reg.employeeId === employeeId)
    },
    [registrations],
  )

  // Get statistics
  const getStatistics = useCallback(() => {
    return TRAINING_DATES.map((date) => ({
      ...date,
      count: getRegistrationCount(date.id),
      available: date.capacity - getRegistrationCount(date.id),
      percentage: (getRegistrationCount(date.id) / date.capacity) * 100,
    }))
  }, [getRegistrationCount])

  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          setRegistrations(data)
        } catch (error) {
          console.error("Failed to sync registrations:", error)
        }
      }
    }

    // Load initial data
    loadRegistrations()

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadRegistrations])

  // Auto-refresh every 30 seconds for admin dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      loadRegistrations()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadRegistrations])

  return {
    registrations,
    isLoading,
    addRegistration,
    getRegistrationCount,
    isAlreadyRegistered,
    getStatistics,
    refresh: loadRegistrations,
  }
}
