"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchNames, updateMemberDate, fetchAllRegistrations, fetchTrainingDates, fetchEducationTime, fetchApplicationDeadline } from "@/app/actions/google-sheets"

export default function TrainingRegistration() {
  const [members, setMembers] = useState<string[]>([])
  const [registrations, setRegistrations] = useState<Array<{name: string, date: string}>>([])
  const [trainingDates, setTrainingDates] = useState<Array<{id: string, label: string, capacity: number}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [educationTime, setEducationTime] = useState<string>('')
  const [applicationDeadline, setApplicationDeadline] = useState<string>('2025-09-05')
  
  const [formData, setFormData] = useState({
    name: "",
    selectedDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // 이름 목록 가져오기
        const namesResult = await fetchNames()
        if (namesResult.success) {
          setMembers(namesResult.data)
        } else {
          setError(namesResult.error || '이름 목록을 가져오는데 실패했습니다.')
        }
        
        // 교육 날짜 목록 가져오기
        const datesResult = await fetchTrainingDates()
        if (datesResult.success) {
          setTrainingDates(datesResult.data)
        } else {
          setError(datesResult.error || '교육 날짜를 가져오는데 실패했습니다.')
        }
        
        // 신청 정보 가져오기
        const registrationsResult = await fetchAllRegistrations()
        if (registrationsResult.success) {
          setRegistrations(registrationsResult.data)
        } else {
          setError(registrationsResult.error || '신청 정보를 가져오는데 실패했습니다.')
        }
        
        // 교육 시간 정보 가져오기
        const timeResult = await fetchEducationTime()
        if (timeResult.success) {
          setEducationTime(timeResult.data)
        }
        
        // 신청 마감일 가져오기
        const deadlineResult = await fetchApplicationDeadline()
        if (deadlineResult.success) {
          setApplicationDeadline(deadlineResult.data)
        }
      } catch (err) {
        setError('데이터 로딩 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // D-X 계산 (클라이언트 사이드에서만)
  useEffect(() => {
    const calculateDaysLeft = () => {
      const deadline = new Date(applicationDeadline)
      const today = new Date()
      const diffTime = deadline.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysLeft(Math.max(0, diffDays))
    }
    
    if (applicationDeadline) {
      calculateDaysLeft()
    }
  }, [applicationDeadline])

  // Helper functions
  const getRegistrationCount = (dateId: string) => {
    return registrations.filter(reg => reg.date === dateId).length
  }

  const isAlreadyRegistered = (name: string) => {
    // 구글 시트에서 해당 이름의 신청 날짜가 있는지 확인
    const registration = registrations.find(reg => reg.name === name)
    return registration && registration.date && registration.date.trim() !== ''
  }

  const getApplicantsByDate = (dateId: string) => {
    return registrations.filter((reg) => reg.date === dateId).map((reg) => reg.name)
  }

  const getNonApplicants = () => {
    // 구글 시트에서 신청 날짜가 비어있는 사람들을 미신청자로 계산
    const nonApplicants = members.filter((name) => {
      const registration = registrations.find(reg => reg.name === name)
      return !registration || !registration.date || registration.date.trim() === ''
    })
    console.log('Debug - Members:', members)
    console.log('Debug - Registrations:', registrations)
    console.log('Debug - Non Applicants:', nonApplicants)
    return nonApplicants
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validation
    if (!formData.name || !formData.selectedDate) {
      setMessage({ type: "error", text: "이름과 교육 날짜를 모두 선택해주세요." })
      setIsSubmitting(false)
      return
    }

    // Check if name exists in Google Sheets
    const memberExists = members.includes(formData.name)
    if (!memberExists) {
      setMessage({ type: "error", text: "등록되지 않은 이름입니다. 관리자에게 문의하세요." })
      setIsSubmitting(false)
      return
    }

    // Check if already registered (by name) - 업데이트 허용
    const existingRegistration = registrations.find(reg => reg.name === formData.name)
    if (existingRegistration && existingRegistration.date && existingRegistration.date.trim() !== '') {
      // 이미 신청한 경우 업데이트로 처리
      console.log(`Updating registration for ${formData.name} from ${existingRegistration.date} to ${formData.selectedDate}`)
    }

    // Check capacity
    const currentCount = getRegistrationCount(formData.selectedDate)
    if (currentCount >= 25) {
      setMessage({ type: "error", text: "선택한 날짜의 정원이 마감되었습니다." })
      setIsSubmitting(false)
      return
    }

    try {
      // Update Google Sheets with selected date
      const result = await updateMemberDate(formData.name, formData.selectedDate)
      
      if (result.success) {
        // 구글 시트에서 최신 데이터를 다시 가져와서 동기화
        const registrationsResult = await fetchAllRegistrations()
        if (registrationsResult.success) {
          setRegistrations(registrationsResult.data)
        }
        const isUpdate = existingRegistration && existingRegistration.date && existingRegistration.date.trim() !== ''
        setMessage({ 
          type: "success", 
          text: isUpdate ? `교육 신청이 ${existingRegistration.date}에서 ${formData.selectedDate}로 변경되었습니다!` : "교육 신청이 완료되었습니다!" 
        })
        setFormData({ name: "", selectedDate: "" })
      } else {
        setMessage({ type: "error", text: result.error || "신청 중 오류가 발생했습니다." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "신청 중 오류가 발생했습니다." })
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  const nonApplicants = getNonApplicants()

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 bg-black text-white p-6 rounded-lg">
          <h1 className="text-4xl font-bold text-white mb-2">MYSC 조직원 교육</h1>
          <p className="text-gray-300 text-lg">교육 일정을 선택하고 신청해주세요. 전 직원 필수로 1회는 신청하셔야 합니다.</p>
          {educationTime && <p className="text-gray-300 text-lg">{educationTime}</p>}
                      <div className="mt-4 flex justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white text-black border-white">
                전체 신청자: {registrations.filter(reg => reg.date && reg.date.trim() !== '').length}/90명
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-white">
                신청 마감일: {applicationDeadline} (D-{daysLeft})
              </Badge>
            </div>
        </div>

        {/* Error */}
        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Member validation notice */}
        <Alert className="mb-6">
          <AlertDescription>
            구글 시트에서 조직원 명단을 불러왔습니다. 등록된 이름으로만 신청 가능합니다.
          </AlertDescription>
        </Alert>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>교육 신청</CardTitle>
            <CardDescription>총 90명 정원</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Selection */}
              <div>
                <Label htmlFor="name">이름 (별명)</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="이름을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((name) => {
                      const registration = registrations.find(reg => reg.name === name)
                      return (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{name}</span>
                            {registration && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {trainingDates.find((d) => d.id === registration.date)?.label || registration.date}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">교육 날짜 선택 [택 1 가능]</Label>
                  <p className="text-sm text-blue-600">(*날짜 선택이 불가능한 일정은 담당자에게 확인하세요)</p>
                </div>
                <RadioGroup
                  value={formData.selectedDate}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedDate: value }))}
                  className="mt-3"
                >
                  {trainingDates.map((date) => {
                    const currentCount = getRegistrationCount(date.id)
                    const isAvailable = currentCount < date.capacity

                    return (
                      <div key={date.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={date.id} id={date.id} disabled={!isAvailable} />
                        <Label
                          htmlFor={date.id}
                          className={`flex-1 cursor-pointer ${!isAvailable ? "text-muted-foreground" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{date.label}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant={isAvailable ? "secondary" : "destructive"}>
                                {currentCount}/{date.capacity}
                              </Badge>
                              {!isAvailable && <Badge variant="destructive">마감</Badge>}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "신청 중..." : "교육 신청하기"}
              </Button>

              {/* Message */}
              {message && (
                <Alert className={message.type === "error" ? "border-destructive" : "border-green-500"}>
                  <AlertDescription className={message.type === "error" ? "text-destructive" : "text-green-600"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>



        {/* Detailed applicant lists by date */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>날짜별 신청자 명단</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingDates.map((date) => {
                const applicants = getApplicantsByDate(date.id)
                return (
                  <div key={date.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-lg">{date.label}</h3>
                      <Badge variant="secondary">
                        {applicants.length}/{date.capacity}명
                      </Badge>
                    </div>
                    {applicants.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {applicants.map((name, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">아직 신청자가 없습니다.</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Non-applicants section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>미신청자</CardTitle>
            <CardDescription>구글 시트에 등록되어 있지만 아직 교육을 신청하지 않은 조직원</CardDescription>
          </CardHeader>
          <CardContent>
            {nonApplicants.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">미신청자 수</span>
                  <Badge variant="destructive">{nonApplicants.length}명</Badge>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">미신청자 명단:</p>
                  <p className="text-sm">{nonApplicants.join(", ")}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  🎉 모든 조직원이 신청을 완료했습니다!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
