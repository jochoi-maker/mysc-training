'use server'

import { getNamesFromSheet, updateRegistrationDate, getAllRegistrations, getTrainingDates } from '@/lib/google-sheets';

// 이름 목록 가져오기
export async function fetchNames() {
  try {
    const names = await getNamesFromSheet();
    return { success: true, data: names };
  } catch (error) {
    console.error('Error fetching names:', error);
    return { success: false, error: '이름 목록을 가져오는데 실패했습니다.' };
  }
}

// 신청 날짜 업데이트
export async function updateMemberDate(name: string, date: string) {
  try {
    await updateRegistrationDate(name, date);
    return { success: true };
  } catch (error) {
    console.error('Error updating date:', error);
    return { success: false, error: '날짜 업데이트에 실패했습니다.' };
  }
}

// 모든 신청 정보 가져오기
export async function fetchAllRegistrations() {
  try {
    const registrations = await getAllRegistrations();
    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return { success: false, error: '신청 정보를 가져오는데 실패했습니다.' };
  }
}

// 교육 날짜 목록 가져오기
export async function fetchTrainingDates() {
  try {
    const dates = await getTrainingDates();
    return { success: true, data: dates };
  } catch (error) {
    console.error('Error fetching training dates:', error);
    return { success: false, error: '교육 날짜를 가져오는데 실패했습니다.' };
  }
}