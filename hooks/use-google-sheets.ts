"use client"

import { useState, useEffect } from "react"

export interface SheetMember {
  name: string
  selectedDate?: string
}

export function useGoogleSheets() {
  const [members, setMembers] = useState<SheetMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8YxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ/pub?output=csv"

  const fallbackMembers: SheetMember[] = [
    { name: "김철수" },
    { name: "이영희" },
    { name: "박민수" },
    { name: "정수진" },
    { name: "최동현" },
    { name: "한지민" },
    { name: "오세훈" },
    { name: "임나영" },
    { name: "강태우" },
    { name: "윤서연" },
    { name: "조현우" },
    { name: "신미래" },
    { name: "홍길동" },
    { name: "송지은" },
    { name: "배준호" },
  ]

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setUsingFallback(false)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(SHEET_URL, {
        signal: controller.signal,
        mode: "cors",
        headers: {
          Accept: "text/csv",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 구글 시트에 접근할 수 없습니다.`)
      }

      const csvText = await response.text()
      const lines = csvText.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        throw new Error("구글 시트가 비어있습니다.")
      }

      // Skip header row and parse data
      const memberData: SheetMember[] = []
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",").map((col) => col.trim().replace(/"/g, ""))
        if (columns[0]) {
          memberData.push({
            name: columns[0],
            selectedDate: columns[1] || undefined,
          })
        }
      }

      console.log("[v0] Successfully loaded", memberData.length, "members from Google Sheets")
      setMembers(memberData)
    } catch (err) {
      console.error("[v0] Google Sheets fetch error:", err)

      console.log("[v0] Using fallback member data")
      setUsingFallback(true)
      setMembers(fallbackMembers)
      setError("구글 시트 연결 실패 - 샘플 데이터를 사용합니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateMemberDate = async (memberName: string, selectedDate: string) => {
    try {
      // Update local state immediately for better UX
      setMembers((prev) => prev.map((member) => (member.name === memberName ? { ...member, selectedDate } : member)))

      console.log("[v0] Updated member:", { memberName, selectedDate })

      const registrations = JSON.parse(localStorage.getItem("mysc-registrations") || "[]")
      const existingIndex = registrations.findIndex((r: any) => r.name === memberName)

      if (existingIndex >= 0) {
        registrations[existingIndex].selectedDate = selectedDate
      } else {
        registrations.push({ name: memberName, selectedDate, timestamp: new Date().toISOString() })
      }

      localStorage.setItem("mysc-registrations", JSON.stringify(registrations))
    } catch (err) {
      console.error("[v0] Error updating member date:", err)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return {
    members,
    isLoading,
    error,
    usingFallback,
    refetch: fetchMembers,
    updateMemberDate,
  }
}
