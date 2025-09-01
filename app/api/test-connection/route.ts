import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function GET() {
  const result: any = {
    env: {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ 설정됨' : '❌ 없음',
      key: process.env.GOOGLE_PRIVATE_KEY ? `✅ 설정됨 (길이: ${process.env.GOOGLE_PRIVATE_KEY.length})` : '❌ 없음',
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID ? '✅ 설정됨' : '❌ 없음',
    },
    keyFormat: null,
    connection: null,
    error: null
  };

  // Private Key 형식 확인
  if (process.env.GOOGLE_PRIVATE_KEY) {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    result.keyFormat = {
      startsWithBegin: key.startsWith('-----BEGIN'),
      endsWithEnd: key.endsWith('-----'),
      hasNewlines: key.includes('\\n') ? '\\n 포함' : key.includes('\n') ? '실제 줄바꿈' : '줄바꿈 없음',
      firstChars: key.substring(0, 30),
      lastChars: key.substring(key.length - 30)
    };
  }

  // API 연결 테스트
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A1:A2',
    });
    
    result.connection = '✅ 성공';
    result.data = response.data.values;
    
  } catch (error: any) {
    result.connection = '❌ 실패';
    result.error = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }

  return NextResponse.json(result, { status: 200 });
}