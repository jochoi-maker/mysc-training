import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// 구글 시트 API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// 서비스 계정 키 정보 (환경 변수에서 가져옴)
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// JWT 인증 클라이언트 생성
function createAuthClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google service account credentials not found');
  }

  return new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: SCOPES,
  });
}

// 구글 시트 API 클라이언트 생성
function createSheetsClient() {
  const auth = createAuthClient();
  return google.sheets({ version: 'v4', auth });
}

// 시트에서 이름 목록 가져오기
export async function getNamesFromSheet(): Promise<string[]> {
  try {
    if (!GOOGLE_SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID not found');
    }

    const sheets = createSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: 'A2:A', // A열 2행부터 이름이 있다고 가정
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // 빈 셀 제거하고 이름만 반환
    return rows
      .map(row => row[0])
      .filter(name => name && name.trim() !== '');
  } catch (error) {
    console.error('Error fetching names from sheet:', error);
    throw new Error('Failed to fetch names from Google Sheets');
  }
}

// 특정 이름의 신청 날짜 업데이트
export async function updateRegistrationDate(name: string, date: string): Promise<void> {
  try {
    if (!GOOGLE_SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID not found');
    }

    const sheets = createSheetsClient();
    
    // 먼저 이름이 있는 행을 찾기
    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: 'A:A', // A열 전체에서 검색
    });

    const rows = findResponse.data.values;
    if (!rows) {
      throw new Error('No data found in sheet');
    }

    // 이름이 있는 행 번호 찾기
    const rowIndex = rows.findIndex(row => row[0] === name);
    if (rowIndex === -1) {
      throw new Error(`Name "${name}" not found in sheet`);
    }

    // 실제 행 번호는 1부터 시작하므로 +1
    const actualRow = rowIndex + 1;

    // B열에 날짜 업데이트 (B열이 신청 날짜 컬럼이라고 가정)
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: `B${actualRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[date]]
      }
    });

    console.log(`Updated registration date for ${name} to ${date}`);
  } catch (error) {
    console.error('Error updating registration date:', error);
    throw new Error(`Failed to update registration date for ${name}`);
  }
}

// 모든 신청 정보 가져오기 (이름과 날짜)
export async function getAllRegistrations(): Promise<Array<{name: string, date: string}>> {
  try {
    if (!GOOGLE_SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID not found');
    }

    const sheets = createSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: 'A2:B', // A열(이름)과 B열(날짜) 2행부터
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows
      .filter(row => row[0] && row[0].trim() !== '') // 이름이 있는 행만
      .map(row => ({
        name: row[0].trim(),
        date: row[1] ? row[1].trim() : ''
      }));
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw new Error('Failed to fetch registrations from Google Sheets');
  }
}

// 교육 날짜 목록 가져오기 (L열)
export async function getTrainingDates(): Promise<Array<{id: string, label: string, capacity: number}>> {
  try {
    if (!GOOGLE_SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID not found');
    }

    const sheets = createSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: 'L2:N', // L열(날짜), M열(라벨), N열(정원) 2행부터
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows
      .filter(row => row[0] && row[0].trim() !== '') // 날짜가 있는 행만
      .map(row => ({
        id: row[0].trim(),
        label: row[1] ? row[1].trim() : row[0].trim(),
        capacity: row[2] ? parseInt(row[2]) || 25 : 25
      }));
  } catch (error) {
    console.error('Error fetching training dates:', error);
    throw new Error('Failed to fetch training dates from Google Sheets');
  }
}
