# MYSC 교육 신청 시스템 개발 및 배포 계획

## 프로젝트 개요
MYSC 조직원을 위한 교육 신청 관리 시스템으로, Google Sheets를 데이터베이스로 활용하여 실시간 신청 현황을 관리합니다.

## 기술 스택
- **Frontend**: Next.js 15.2.4 (React 19)
- **UI Framework**: Tailwind CSS + shadcn/ui 컴포넌트
- **Database**: Google Sheets API
- **Deployment**: Vercel
- **Authentication**: Google Auth Library

## 개발 진행 과정

### Phase 1: 초기 설정 및 기본 구조 (완료)
- [x] Next.js 프로젝트 초기화
- [x] shadcn/ui 컴포넌트 라이브러리 설정
- [x] Tailwind CSS 설정
- [x] 기본 폴더 구조 생성

### Phase 2: Google Sheets 연동 (완료)
- [x] Google Sheets API 설정
- [x] 서비스 계정 생성 및 권한 설정
- [x] 데이터 읽기/쓰기 함수 구현 (`lib/google-sheets.ts`)
- [x] Server Actions 구현 (`app/actions/google-sheets.ts`)

### Phase 3: 핵심 기능 개발 (완료)
- [x] 메인 신청 페이지 개발 (`app/page.tsx`)
  - 교육 날짜 선택 기능
  - 이름 선택 (드롭다운)
  - 실시간 신청 현황 표시
  - 날짜별 정원 관리 (25명 제한)
- [x] 신청 상태 관리
  - 신청자/미신청자 구분
  - 중복 신청 방지
  - 신청 날짜 변경 기능

### Phase 4: UI/UX 개선 (완료)
- [x] 반응형 디자인 구현
- [x] 로딩 상태 처리
- [x] 에러 처리 및 사용자 피드백
- [x] 신청 마감일 D-Day 카운터
- [x] 날짜별 신청자 명단 표시
- [x] 미신청자 명단 표시

### Phase 5: 관리자 기능 (개발 예정)
- [ ] 관리자 페이지 (`app/admin/page.tsx`)
- [ ] 신청 현황 대시보드
- [ ] 데이터 내보내기 기능
- [ ] 신청 기간 관리

## 배포 계획

### 1단계: 개발 환경 테스트
- 로컬 환경에서 기능 테스트
- Google Sheets API 연동 확인
- 성능 최적화

### 2단계: Vercel 배포 준비
1. **환경 변수 설정**
   ```
   GOOGLE_SHEETS_PRIVATE_KEY
   GOOGLE_SHEETS_CLIENT_EMAIL
   GOOGLE_SHEET_ID
   ```

2. **빌드 최적화**
   ```bash
   npm run build
   ```

3. **배포 전 체크리스트**
   - [ ] 모든 환경 변수 확인
   - [ ] Google Sheets 권한 설정 확인
   - [ ] 에러 페이지 구현
   - [ ] 메타데이터 설정

### 3단계: Vercel 배포
1. **GitHub 리포지토리 연결**
   - GitHub에 코드 푸시
   - Vercel과 리포지토리 연결

2. **자동 배포 설정**
   - main 브랜치 자동 배포
   - Preview 배포 활성화

3. **도메인 설정**
   - 커스텀 도메인 설정 (옵션)
   - SSL 인증서 자동 설정

### 4단계: 배포 후 관리
- **모니터링**
  - Vercel Analytics 설정
  - 에러 로깅
  - 사용자 트래픽 분석

- **유지보수**
  - 정기적인 데이터 백업
  - API 사용량 모니터링
  - 성능 최적화

## 주요 파일 구조
```
mysc-training/
├── app/
│   ├── page.tsx           # 메인 신청 페이지
│   ├── admin/
│   │   └── page.tsx       # 관리자 페이지
│   └── actions/
│       └── google-sheets.ts # Server Actions
├── lib/
│   └── google-sheets.ts   # Google Sheets API 연동
├── components/
│   └── ui/                # shadcn/ui 컴포넌트
├── hooks/                 # 커스텀 훅
└── package.json          # 의존성 관리
```

## 보안 고려사항
- Google Sheets API 키는 환경 변수로 관리
- 서버 사이드에서만 API 호출
- 클라이언트에 민감한 정보 노출 방지
- CORS 설정을 통한 접근 제어

## 성능 최적화
- Server Actions를 통한 효율적인 데이터 페칭
- 클라이언트 사이드 캐싱
- 이미지 최적화 (Next.js Image 컴포넌트)
- 번들 사이즈 최적화

## 향후 개선 계획
1. **기능 추가**
   - 이메일 알림 기능
   - 신청 확인서 PDF 생성
   - 다중 교육 과정 지원

2. **기술 개선**
   - TypeScript 타입 강화
   - 테스트 코드 작성
   - CI/CD 파이프라인 구축

3. **사용자 경험**
   - 다크 모드 지원
   - 다국어 지원
   - 접근성 개선

## 배포 일정
- **개발 완료**: 2025년 8월 15일
- **테스트 기간**: 2025년 8월 16-17일
- **프로덕션 배포**: 2025년 8월 18일
- **신청 마감**: 2025년 8월 20일

## 연락처
프로젝트 관련 문의사항이 있으시면 담당자에게 연락 부탁드립니다.