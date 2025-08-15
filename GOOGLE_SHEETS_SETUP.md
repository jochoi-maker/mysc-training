# 구글 시트 API 설정 가이드

## 1. 구글 클라우드 프로젝트 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화:
   - "API 및 서비스" → "라이브러리"
   - "Google Sheets API" 검색 후 활성화

## 2. 서비스 계정 생성

1. "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "서비스 계정"
3. 서비스 계정 이름 입력 (예: "sheets-api")
4. "키 만들기" → "JSON" 선택하여 키 파일 다운로드

## 3. 구글 시트 설정

1. 구글 시트 생성 또는 기존 시트 사용
2. 시트 URL에서 스프레드시트 ID 복사:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
3. 서비스 계정 이메일을 시트에 공유 (편집 권한)

## 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# Google Sheets API 설정
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

### 값 설정 방법:

1. **GOOGLE_SERVICE_ACCOUNT_EMAIL**: 다운로드한 JSON 파일의 `client_email` 값
2. **GOOGLE_PRIVATE_KEY**: 다운로드한 JSON 파일의 `private_key` 값 (전체를 복사)
3. **GOOGLE_SPREADSHEET_ID**: 구글 시트 URL에서 추출한 ID

## 5. 시트 구조

시트는 다음과 같은 구조로 설정하세요:

| A열 (이름) | B열 (신청 날짜) |
|------------|-----------------|
| 홍길동     | 2024-01-15      |
| 김철수     | 2024-01-20      |
| 이영희     |                 |

## 6. 테스트

설정 완료 후 애플리케이션을 실행하여 구글 시트에서 이름을 가져오고 날짜를 업데이트하는지 확인하세요.
