"use client"

import { useState, useEffect, useCallback } from "react"

export interface Member {
  name: string
  employeeId: string
  department?: string
}

const MEMBERS_STORAGE_KEY = "mysc-members"

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load members from localStorage
  const loadMembers = useCallback(() => {
    try {
      const saved = localStorage.getItem(MEMBERS_STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to load members:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save members to localStorage
  const saveMembers = useCallback((memberList: Member[]) => {
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(memberList))
      setMembers(memberList)
    } catch (error) {
      console.error("Failed to save members:", error)
    }
  }, [])

  // Parse CSV content
  const parseCsvContent = useCallback((csvContent: string): Member[] => {
    const lines = csvContent.trim().split("\n")
    const members: Member[] = []

    // Skip header row if it exists
    const startIndex = lines[0].includes("이름") || lines[0].includes("name") ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

      if (columns.length >= 2) {
        members.push({
          name: columns[0],
          employeeId: columns[1],
          department: columns[2] || undefined,
        })
      }
    }

    return members
  }, [])

  // Upload members from CSV file
  const uploadMembersFromCsv = useCallback(
    (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const csvContent = e.target?.result as string
            const parsedMembers = parseCsvContent(csvContent)

            if (parsedMembers.length === 0) {
              resolve({ success: false, count: 0, error: "유효한 멤버 데이터를 찾을 수 없습니다." })
              return
            }

            saveMembers(parsedMembers)
            resolve({ success: true, count: parsedMembers.length })
          } catch (error) {
            resolve({ success: false, count: 0, error: "파일 파싱 중 오류가 발생했습니다." })
          }
        }

        reader.onerror = () => {
          resolve({ success: false, count: 0, error: "파일 읽기 중 오류가 발생했습니다." })
        }

        reader.readAsText(file, "utf-8")
      })
    },
    [parseCsvContent, saveMembers],
  )

  // Check if employee ID exists in member list
  const isValidMember = useCallback(
    (employeeId: string): boolean => {
      if (members.length === 0) return true // If no member list uploaded, allow all
      return members.some((member) => member.employeeId === employeeId)
    },
    [members],
  )

  // Get member by employee ID
  const getMemberByEmployeeId = useCallback(
    (employeeId: string): Member | undefined => {
      return members.find((member) => member.employeeId === employeeId)
    },
    [members],
  )

  // Clear all members
  const clearMembers = useCallback(() => {
    localStorage.removeItem(MEMBERS_STORAGE_KEY)
    setMembers([])
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  return {
    members,
    isLoading,
    uploadMembersFromCsv,
    isValidMember,
    getMemberByEmployeeId,
    clearMembers,
    memberCount: members.length,
  }
}
