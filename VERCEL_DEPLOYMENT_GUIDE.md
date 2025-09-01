# Vercel 배포 가이드

## 🎉 배포 완료!

GitHub 저장소와 Vercel 배포가 성공적으로 완료되었습니다.

### 📍 URL 정보

- **GitHub 저장소**: https://github.com/jochoi-maker/mysc-training
- **Vercel 프로덕션 URL**: https://mysc-training-j8x1ml0t5-choi-jong-oks-projects.vercel.app
- **Vercel 대시보드**: https://vercel.com/choi-jong-oks-projects/mysc-training

### ⚠️ 중요: 환경 변수 설정 필요

애플리케이션이 정상적으로 작동하려면 Vercel에서 환경 변수를 설정해야 합니다.

#### 환경 변수 설정 방법:

1. **Vercel 환경 변수 설정 페이지 접속**
   - URL: https://vercel.com/choi-jong-oks-projects/mysc-training/settings/environment-variables

2. **다음 3개의 환경 변수 추가:**

   | 변수명 | 설명 | 예시 |
   |--------|------|------|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Service Account 이메일 | `your-service@project.iam.gserviceaccount.com` |
   | `GOOGLE_PRIVATE_KEY` | Google Service Account Private Key | `-----BEGIN PRIVATE KEY-----\n...` |
   | `GOOGLE_SPREADSHEET_ID` | Google Sheets ID | `1abc...xyz` |

3. **각 변수 추가 시:**
   - Name: 위 표의 변수명 입력
   - Value: 실제 값 입력
   - Environment: Production, Preview, Development 모두 체크
   - "Add" 버튼 클릭

4. **모든 변수 추가 후 재배포:**
   - Vercel 대시보드에서 "Redeploy" 클릭
   - 또는 터미널에서 `npx vercel --prod` 실행

### 📝 Google Sheets 설정 확인

배포된 앱이 작동하려면 Google Sheets가 다음과 같이 설정되어 있어야 합니다:

| 열/셀 | 용도 | 예시 |
|-------|------|------|
| A2~ | 조직원 이름 목록 | "홍길동", "김철수" |
| B열 | 신청한 날짜 (자동 입력) | "10-28" |
| I2 | 신청 마감일 | "2025-09-05" |
| J2 | 교육 시간 정보 | "(#교육시간 10시~15시30분)" |
| L2~ | 교육 날짜 ID | "10-28", "11-04" |
| M2~ | 각 날짜별 최대 정원 | 25, 30 |

### 🔒 Google Sheets 권한 설정

1. Google Sheets 열기
2. 우측 상단 "공유" 버튼 클릭
3. Service Account 이메일 추가 (GOOGLE_SERVICE_ACCOUNT_EMAIL)
4. 권한: "편집자" 선택
5. "전송" 클릭

### ✅ 배포 확인 사항

- [ ] GitHub에 코드가 정상적으로 푸시됨
- [ ] Vercel에 프로젝트가 생성됨
- [ ] 환경 변수 3개 모두 설정됨
- [ ] Google Sheets 권한이 Service Account에 부여됨
- [ ] 프로덕션 URL에서 페이지가 정상 로드됨

### 🛠️ 문제 해결

#### 페이지가 로드되지 않는 경우:
1. Vercel 대시보드에서 빌드 로그 확인
2. 환경 변수가 모두 설정되었는지 확인
3. Google Sheets 권한 확인

#### Google Sheets 연결 오류:
1. Service Account 이메일이 정확한지 확인
2. Private Key가 올바르게 입력되었는지 확인 (줄바꿈 포함)
3. Spreadsheet ID가 정확한지 확인

### 📱 접속 정보

배포가 완료되면 다음 URL로 접속 가능합니다:
- 메인 페이지: https://mysc-training-j8x1ml0t5-choi-jong-oks-projects.vercel.app
- 관리자 페이지: https://mysc-training-j8x1ml0t5-choi-jong-oks-projects.vercel.app/admin

관리자 비밀번호: `mysc2025`

---

**작성일**: 2025-09-01  
**작성자**: Claude Code Assistant