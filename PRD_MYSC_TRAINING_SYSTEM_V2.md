# 제품 요구사항 문서 (PRD) - Version 2.0
## MYSC 조직원 교육 신청 시스템

### 📋 문서 정보
- **문서 버전**: 2.0
- **작성일**: 2025-09-01
- **최종 수정일**: 2025-09-01
- **작성자**: Claude Code Assistant
- **주요 변경사항**: Google Sheets 동적 데이터 연동 강화

---

## 1. 제품 개요

### 1.1 제품명
MYSC 조직원 교육 신청 시스템

### 1.2 제품 비전
Google Sheets를 중앙 데이터 저장소로 활용하여, 비개발자도 쉽게 교육 설정을 관리할 수 있는 유연한 교육 신청 시스템

### 1.3 제품 목적
- 전 직원 필수 교육 프로그램의 온라인 신청 자동화
- Google Sheets를 통한 실시간 데이터 관리
- 관리자가 코드 수정 없이 교육 정보를 업데이트할 수 있는 시스템 구축

### 1.4 주요 이해관계자
| 역할 | 설명 | 인원 |
|------|------|------|
| 최종 사용자 | MYSC 전 직원 | 약 90명 |
| 교육 관리자 | 교육 일정 및 신청 관리 담당자 | 1-2명 |
| 시스템 관리자 | Google Sheets 및 시스템 설정 관리 | IT 부서 |

### 1.5 핵심 가치 제안
- ✅ **완전한 동적 데이터 관리**: 모든 교육 정보를 Google Sheets에서 실시간 관리
- ✅ **비개발자 친화적**: 스프레드시트만으로 시스템 설정 변경 가능
- ✅ **실시간 동기화**: 변경사항 즉시 반영
- ✅ **유연한 정원 관리**: 날짜별로 다른 정원 설정 가능

---

## 2. 기능 요구사항

### 2.1 사용자 기능 (메인 페이지)

#### 2.1.1 교육 신청 기능

##### 이름 선택
- **기능**: 드롭다운 메뉴에서 본인 이름 선택
- **데이터 소스**: Google Sheets A열 (A2부터)
- **검증**: 
  - Google Sheets에 등록된 이름만 선택 가능
  - 이미 신청한 경우 선택한 날짜 표시
- **UI**: shadcn/ui Select 컴포넌트 사용

##### 날짜 선택
- **기능**: 라디오 버튼으로 교육 날짜 단일 선택
- **데이터 소스**: 
  - L열: 날짜 ID (예: "10-28", "11-04")
  - M열: 해당 날짜 최대 정원
- **실시간 표시**:
  - 현재 신청 인원 / 최대 정원 (예: 15/30)
  - 정원 마감 시 "마감" 배지 표시 및 선택 비활성화
- **안내 문구**: "*날짜 선택이 불가능한 일정은 담당자에게 확인하세요"

#### 2.1.2 실시간 현황 표시

##### 헤더 정보
- **교육 제목**: "MYSC 조직원 교육"
- **교육 시간**: Google Sheets J2 셀에서 동적으로 가져옴
- **전체 신청 현황**: 실시간 신청자 수 / 전체 정원
- **신청 마감일**: 
  - Google Sheets I2 셀에서 날짜 가져옴
  - D-Day 카운트다운 자동 계산

##### 신청자 명단
- **날짜별 신청자 명단**: 각 날짜별로 신청한 사람들의 이름을 배지로 표시
- **미신청자 명단**: 
  - Google Sheets에 등록되었지만 미신청한 인원 표시
  - 미신청자 수와 명단 실시간 업데이트

#### 2.1.3 신청 처리

##### 신규 신청
- 이름과 날짜 선택 후 "교육 신청하기" 버튼 클릭
- Google Sheets B열에 선택한 날짜 ID 저장
- 성공 메시지: "교육 신청이 완료되었습니다!"

##### 신청 변경
- 이미 신청한 사용자가 다른 날짜 선택 시 자동으로 변경 처리
- 변경 메시지: "교육 신청이 [이전날짜]에서 [새날짜]로 변경되었습니다!"

##### 검증 로직
1. 이름 존재 여부 확인
2. 선택 날짜 정원 확인
3. 중복 신청 체크 (변경으로 처리)

### 2.2 관리자 기능 (/admin 페이지)

#### 2.2.1 인증 시스템
- **로그인**: 비밀번호 인증 (기본값: mysc2025)
- **세션 관리**: 
  - 유효 기간: 24시간
  - 남은 시간 실시간 표시
- **로그아웃**: 수동 로그아웃 버튼

#### 2.2.2 대시보드 탭

##### 현황 개요
- **통계 카드**:
  - 전체 신청자 수
  - 날짜별 신청 현황
  - 남은 자리 수
- **진행률 차트**: 날짜별 신청률 바 차트

##### 신청자 목록
- **테이블 표시**: 이름, 사번, 교육 날짜, 신청 일시
- **필터링**: 
  - 이름/사번 검색
  - 날짜별 필터
- **내보내기**: CSV 파일 다운로드 (UTF-8 BOM)

##### 조직원 관리
- **CSV 업로드**: 조직원 명단 일괄 등록
- **형식**: 이름, 사번, 부서(선택)
- **관리 기능**: 전체 삭제, 등록 인원 수 표시

---

## 3. 기술 사양

### 3.1 기술 스택

#### 프론트엔드
```json
{
  "framework": "Next.js 15.2.4",
  "ui": "React 19",
  "components": "shadcn/ui (Radix UI)",
  "styling": "Tailwind CSS",
  "typescript": "5.x"
}
```

#### 백엔드
```json
{
  "api": "Next.js Server Actions",
  "database": "Google Sheets API v4",
  "auth": "JWT (Google Service Account)"
}
```

### 3.2 Google Sheets 데이터 구조

#### 시트 구성
| 열 | 용도 | 설명 | 예시 |
|----|------|------|------|
| A | 조직원 이름 | A2부터 시작, 별명 포함 | "홍길동", "김철수(철수)" |
| B | 신청 날짜 | 선택한 교육 날짜 ID | "10-28", "11-04" |
| I2 | 신청 마감일 | 단일 셀, 마감일 정보 | "2025-09-05" 또는 "9월 5일" |
| J2 | 교육 시간 | 단일 셀, 교육 시간 정보 | "(#교육시간 10시~15시30분)" |
| L | 교육 날짜 ID | L2부터, 각 교육 날짜 식별자 | "10-28", "11-04", "11-07" |
| M | 최대 정원 | L열에 대응하는 각 날짜별 정원 | 25, 30, 20 |

#### 데이터 관리 규칙
1. **A열**: 비어있는 행은 무시, trim() 처리
2. **B열**: 신청/변경 시 업데이트
3. **I2, J2**: 시스템 설정 정보 (단일 셀)
4. **L, M열**: 교육 날짜와 정원 설정 (쌍으로 관리)

### 3.3 환경 변수 설정

```env
# .env.local
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

### 3.4 주요 API 함수

#### Server Actions (`app/actions/google-sheets.ts`)
```typescript
// 조직원 명단 가져오기
fetchNames(): Promise<{success: boolean, data?: string[], error?: string}>

// 신청 날짜 업데이트
updateMemberDate(name: string, date: string): Promise<{success: boolean, error?: string}>

// 모든 신청 정보 가져오기
fetchAllRegistrations(): Promise<{success: boolean, data?: Registration[], error?: string}>

// 교육 날짜 및 정원 정보
fetchTrainingDates(): Promise<{success: boolean, data?: TrainingDate[], error?: string}>

// 교육 시간 정보 (J2)
fetchEducationTime(): Promise<{success: boolean, data?: string, error?: string}>

// 신청 마감일 (I2)
fetchApplicationDeadline(): Promise<{success: boolean, data?: string, error?: string}>
```

#### Google Sheets 통신 (`lib/google-sheets.ts`)
```typescript
// 핵심 함수들
getNamesFromSheet(): Promise<string[]>
updateRegistrationDate(name: string, date: string): Promise<void>
getAllRegistrations(): Promise<Array<{name: string, date: string}>>
getTrainingDates(): Promise<Array<{id: string, label: string, capacity: number}>>
getEducationTime(): Promise<string>
getApplicationDeadline(): Promise<string>
```

---

## 4. UI/UX 디자인

### 4.1 디자인 시스템

#### 색상 팔레트
| 용도 | 색상 | 사용처 |
|------|------|--------|
| Primary | Black (#000000) | 헤더 배경 |
| Secondary | Gray (#6B7280) | 보조 텍스트, 배지 |
| Success | Green (#10B981) | 성공 메시지 |
| Error | Red (#EF4444) | 에러, 마감 표시 |
| Background | White (#FFFFFF) | 기본 배경 |

#### 레이아웃
- **최대 너비**: 768px (메인), 1280px (관리자)
- **반응형 브레이크포인트**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### 4.2 컴포넌트 구조

#### 카드 컴포넌트
- 모든 주요 섹션을 카드로 구성
- 둥근 모서리 (rounded-lg)
- 그림자 효과 (shadow-sm)

#### 폼 요소
- Label + Input/Select 구조
- 전체 너비 버튼
- 명확한 에러/성공 메시지

#### 데이터 표시
- Badge: 상태 표시 (신청 인원, 마감 등)
- Table: 신청자 목록
- Progress Bar: 신청률 시각화

---

## 5. 비기능 요구사항

### 5.1 성능
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 초기 로드 시간 | < 3초 | Lighthouse |
| API 응답 시간 | < 2초 | Server logs |
| 동시 접속 | 100명 | Load testing |

### 5.2 보안
- ✅ 환경 변수를 통한 API 키 관리
- ✅ Server Actions를 통한 서버 사이드 API 호출
- ✅ 관리자 페이지 비밀번호 보호
- ✅ HTTPS 전용 통신

### 5.3 접근성
- ✅ 모바일 반응형 디자인
- ✅ 키보드 네비게이션 지원
- ✅ 명확한 레이블과 안내 문구
- ✅ 고대비 색상 사용

### 5.4 확장성
- ✅ 최대 500명까지 확장 가능
- ✅ 교육 프로그램 다중화 가능
- ✅ 다국어 지원 가능 구조

---

## 6. 개발 가이드

### 6.1 프로젝트 구조
```
mysc-training/
├── app/
│   ├── page.tsx                 # 메인 신청 페이지
│   ├── admin/
│   │   └── page.tsx             # 관리자 대시보드
│   └── actions/
│       └── google-sheets.ts     # Server Actions
├── components/
│   └── ui/                      # shadcn/ui 컴포넌트
├── lib/
│   ├── google-sheets.ts         # Google Sheets API 통신
│   └── utils.ts                 # 유틸리티 함수
├── hooks/
│   ├── use-registrations.ts     # 신청 데이터 관리
│   ├── use-auth.ts              # 인증 관리
│   └── use-members.ts           # 조직원 관리
└── .env.local                   # 환경 변수
```

### 6.2 설치 및 실행

#### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone [repository-url]
cd mysc-training
npm install
```

#### 2. Google Service Account 설정
1. Google Cloud Console에서 프로젝트 생성
2. Google Sheets API 활성화
3. Service Account 생성 및 키 다운로드
4. Google Sheets에 Service Account 이메일 공유 권한 부여

#### 3. 환경 변수 설정
`.env.local` 파일 생성:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

#### 4. Google Sheets 초기 설정
스프레드시트에 다음 구조로 데이터 설정:
- A열: 조직원 이름 목록 (A2부터)
- I2 셀: 신청 마감일 (예: "2025-09-05")
- J2 셀: 교육 시간 정보 (예: "(#교육시간 10시~15시30분)")
- L열: 교육 날짜 ID (L2부터, 예: "10-28", "11-04")
- M열: 각 날짜별 최대 정원 (예: 25, 30)

#### 5. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000
```

#### 6. 프로덕션 빌드
```bash
npm run build
npm start
```

### 6.3 배포

#### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_SPREADSHEET_ID
```

---

## 7. 테스트 시나리오

### 7.1 기능 테스트

#### 신청 프로세스
1. ✅ 이름 선택 → 날짜 선택 → 신청 완료
2. ✅ 중복 신청 시 변경으로 처리
3. ✅ 정원 초과 시 선택 불가
4. ✅ 미등록 이름으로 신청 불가

#### 데이터 동기화
1. ✅ Google Sheets 수정 → 페이지 새로고침 → 변경사항 반영
2. ✅ 정원 수정 시 즉시 반영
3. ✅ 마감일 변경 시 D-Day 재계산

### 7.2 성능 테스트
- 동시 접속 50명 시뮬레이션
- API 응답 시간 측정
- 페이지 로드 시간 측정

### 7.3 보안 테스트
- 환경 변수 노출 방지 확인
- 관리자 페이지 접근 제한 확인
- XSS, CSRF 방어 확인

---

## 8. 유지보수 가이드

### 8.1 일반 관리 작업

#### 교육 날짜 추가/변경
1. Google Sheets L열에 새 날짜 ID 추가
2. M열에 해당 날짜의 최대 정원 입력
3. 페이지 새로고침으로 확인

#### 교육 정보 변경
- **교육 시간**: J2 셀 수정
- **신청 마감일**: I2 셀 수정
- **정원 조정**: M열 해당 값 수정

#### 조직원 명단 관리
- **추가**: A열 마지막 행에 이름 추가
- **삭제**: 해당 행 삭제 또는 내용 삭제
- **일괄 업로드**: 관리자 페이지에서 CSV 업로드

### 8.2 문제 해결

#### Google Sheets 연결 오류
```bash
# 환경 변수 확인
echo $GOOGLE_SERVICE_ACCOUNT_EMAIL
echo $GOOGLE_SPREADSHEET_ID

# 권한 확인
# Google Sheets에서 Service Account 이메일이 편집 권한을 가지고 있는지 확인
```

#### 데이터 동기화 문제
- 브라우저 캐시 삭제
- Google Sheets API 할당량 확인
- 네트워크 연결 상태 확인

### 8.3 백업 및 복구
- Google Sheets 자동 버전 관리 활용
- 주기적인 CSV 내보내기 백업
- 관리자 페이지에서 수동 백업

---

## 9. 개선 로드맵

### 단기 (1-3개월)
- [ ] 이메일 알림 기능
- [ ] 교육 자료 다운로드
- [ ] 출석 체크 기능
- [ ] 모바일 앱 개발

### 중기 (3-6개월)
- [ ] 다중 교육 프로그램 지원
- [ ] 자동 대기자 관리
- [ ] 교육 이수증 발급
- [ ] 만족도 조사 통합

### 장기 (6-12개월)
- [ ] 자체 데이터베이스 마이그레이션
- [ ] AI 기반 일정 추천
- [ ] 다국어 지원
- [ ] 연간 교육 계획 관리

---

## 10. 부록

### 10.1 용어집
| 용어 | 설명 |
|------|------|
| Server Actions | Next.js의 서버 사이드 함수 실행 기능 |
| shadcn/ui | Radix UI와 Tailwind CSS 기반 컴포넌트 라이브러리 |
| Service Account | Google Cloud의 서버 간 인증용 계정 |
| D-Day | 신청 마감일까지 남은 일수 |

### 10.2 참고 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel 배포 가이드](https://vercel.com/docs)

### 10.3 변경 이력
| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-09-01 | 초기 작성 | Claude |
| 2.0 | 2025-09-01 | Google Sheets 동적 데이터 기능 추가 | Claude |

---

**문서 승인**
- 작성자: Claude Code Assistant
- 검토자: [검토자 이름]
- 승인자: [승인자 이름]
- 승인일: [승인 날짜]