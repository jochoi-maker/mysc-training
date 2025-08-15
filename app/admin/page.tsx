"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRegistrations, TRAINING_DATES } from "@/hooks/use-registrations"
import { useAuth } from "@/hooks/use-auth"
import { useMembers } from "@/hooks/use-members"

export default function AdminDashboard() {
  const { registrations, isLoading: registrationsLoading, getStatistics, refresh } = useRegistrations()
  const { isAuthenticated, isLoading: authLoading, login, logout, getSessionTimeRemaining } = useAuth()
  const { members, uploadMembersFromCsv, clearMembers, memberCount } = useMembers()

  const [filteredRegistrations, setFilteredRegistrations] = useState(registrations)
  const [adminPassword, setAdminPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>("")
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let filtered = registrations

    if (filterDate !== "all") {
      filtered = filtered.filter((reg) => reg.selectedDate === filterDate)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRegistrations(filtered)
  }, [registrations, filterDate, searchTerm])

  useEffect(() => {
    setLastRefresh(new Date())
  }, [registrations])

  useEffect(() => {
    if (!isAuthenticated) return

    const updateSessionTime = () => {
      const timeLeft = getSessionTimeRemaining()
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        setSessionTimeLeft(`${hours}시간 ${minutes}분`)
      } else {
        setSessionTimeLeft("만료됨")
      }
    }

    updateSessionTime()
    const interval = setInterval(updateSessionTime, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, getSessionTimeRemaining])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (login(adminPassword)) {
      setAdminPassword("")
    } else {
      setLoginError("잘못된 비밀번호입니다.")
    }
  }

  const handleLogout = () => {
    logout()
    setAdminPassword("")
    setLoginError("")
  }

  const handleManualRefresh = () => {
    refresh()
    setLastRefresh(new Date())
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadMessage({ type: "error", text: "CSV 파일만 업로드 가능합니다." })
      return
    }

    setIsUploading(true)
    setUploadMessage(null)

    try {
      const result = await uploadMembersFromCsv(file)

      if (result.success) {
        setUploadMessage({
          type: "success",
          text: `${result.count}명의 조직원 정보가 업로드되었습니다.`,
        })
      } else {
        setUploadMessage({
          type: "error",
          text: result.error || "업로드 중 오류가 발생했습니다.",
        })
      }
    } catch (error) {
      setUploadMessage({ type: "error", text: "파일 업로드 중 오류가 발생했습니다." })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClearMembers = () => {
    if (confirm("조직원 명단을 삭제하시겠습니까?")) {
      clearMembers()
      setUploadMessage({ type: "success", text: "조직원 명단이 삭제되었습니다." })
    }
  }

  const exportToCSV = () => {
    const headers = ["이름", "사번", "교육날짜", "신청일시"]
    const csvData = filteredRegistrations.map((reg) => {
      const dateLabel = TRAINING_DATES.find((d) => d.id === reg.selectedDate)?.label || reg.selectedDate
      const timestamp = new Date(reg.timestamp).toLocaleString("ko-KR")
      return [reg.name, reg.employeeId, dateLabel, timestamp]
    })

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `MYSC_교육신청_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>관리자 로그인</CardTitle>
            <CardDescription>MYSC 교육 관리 시스템</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">관리자 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                로그인
              </Button>

              {loginError && (
                <Alert className="border-destructive">
                  <AlertDescription className="text-destructive">{loginError}</AlertDescription>
                </Alert>
              )}
            </form>
            <Alert className="mt-4">
              <AlertDescription>데모용 비밀번호: mysc2025</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (registrationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  const statistics = getStatistics()

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">MYSC 교육 관리</h1>
            <p className="text-muted-foreground text-lg">교육 신청 현황 및 관리</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>마지막 업데이트: {lastRefresh.toLocaleString("ko-KR")}</span>
              <span>세션 남은 시간: {sessionTimeLeft}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualRefresh}>
              새로고침
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">현황 개요</TabsTrigger>
            <TabsTrigger value="registrations">신청자 목록</TabsTrigger>
            <TabsTrigger value="members">조직원 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">전체 신청자</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{registrations.length}</div>
                  <p className="text-xs text-muted-foreground">총 90명 중</p>
                </CardContent>
              </Card>

              {statistics.map((stat) => (
                <Card key={stat.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground">{stat.available}명 남음</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>날짜별 신청 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.map((stat) => (
                    <div key={stat.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stat.label}</span>
                        <Badge variant={stat.count >= stat.capacity ? "destructive" : "secondary"}>
                          {stat.count}/{stat.capacity}
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>필터 및 내보내기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">검색 (이름 또는 사번)</Label>
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="검색어를 입력하세요"
                      className="mt-1"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="dateFilter">날짜 필터</Label>
                    <Select value={filterDate} onValueChange={setFilterDate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 날짜</SelectItem>
                        {TRAINING_DATES.map((date) => (
                          <SelectItem key={date.id} value={date.id}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={exportToCSV} className="w-full sm:w-auto">
                    CSV 내보내기
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>신청자 목록</CardTitle>
                <CardDescription>
                  {filteredRegistrations.length}명의 신청자 (전체 {registrations.length}명 중)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>사번</TableHead>
                        <TableHead>교육 날짜</TableHead>
                        <TableHead>신청 일시</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            신청자가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRegistrations.map((registration) => {
                          const dateLabel = TRAINING_DATES.find((d) => d.id === registration.selectedDate)?.label
                          return (
                            <TableRow key={registration.id}>
                              <TableCell className="font-medium">{registration.name}</TableCell>
                              <TableCell>{registration.employeeId}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{dateLabel}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(registration.timestamp).toLocaleString("ko-KR")}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>조직원 명단 관리</CardTitle>
                <CardDescription>CSV 파일로 조직원 명단을 업로드하여 신청 자격을 제한할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="memberFile">CSV 파일 업로드</Label>
                    <Input
                      ref={fileInputRef}
                      id="memberFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      형식: 이름, 사번, 부서(선택) - 첫 번째 행이 헤더인 경우 자동으로 건너뜁니다.
                    </p>
                  </div>
                  {memberCount > 0 && (
                    <Button variant="destructive" onClick={handleClearMembers}>
                      명단 삭제
                    </Button>
                  )}
                </div>

                {uploadMessage && (
                  <Alert className={uploadMessage.type === "error" ? "border-destructive" : "border-green-500"}>
                    <AlertDescription
                      className={uploadMessage.type === "error" ? "text-destructive" : "text-green-600"}
                    >
                      {uploadMessage.text}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    등록된 조직원: {memberCount}명
                  </Badge>
                  {memberCount === 0 && <Badge variant="secondary">명단 미등록 - 모든 사번 허용</Badge>}
                </div>
              </CardContent>
            </Card>

            {memberCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>등록된 조직원 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>사번</TableHead>
                          <TableHead>부서</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.slice(0, 50).map((member, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.employeeId}</TableCell>
                            <TableCell>{member.department || "-"}</TableCell>
                          </TableRow>
                        ))}
                        {members.length > 50 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              ... 및 {members.length - 50}명 더
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
