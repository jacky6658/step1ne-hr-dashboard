import { google } from 'googleapis';

// Google Sheets IDs
const SHEETS = {
  jobs: process.env.SHEET_JOBS || '1QPaeOm-slNVFCeM8Q3gg3DawKjzp2tYwyfquvdHlZFE',
  resumes: process.env.SHEET_RESUMES || '1PunpaDAFBPBL_I76AiRYGXKaXDZvMl1c262SEtxRk6Q'
};

// 初始化 Google Sheets API
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : undefined,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

interface SheetData {
  values?: string[][];
}

/**
 * 從 Google Sheets 讀取資料
 */
export async function getSheetData(sheetId: string, range: string): Promise<string[][]> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    
    return (response.data as SheetData).values || [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetId}:`, error);
    return [];
  }
}

/**
 * 讀取職缺資料
 */
export async function getJobs() {
  const data = await getSheetData(SHEETS.jobs, '工作表1!A1:K100');
  
  if (data.length <= 1) return [];
  
  const jobs = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length > 0 && row[0]) {
      jobs.push({
        id: `JOB-${String(i).padStart(3, '0')}`,
        title: row[0] || '未命名職位',
        department: row[1] || '',
        count: parseInt(row[2]) || 1,
        salary: row[3] || '',
        skills: row[4] || '',
        experience: row[5] || '',
        education: row[6] || '',
        location: row[7] || '台北',
        status: row[8] || '開放中',
        createdAt: row[9] || new Date().toISOString().split('T')[0],
        updatedAt: row[10] || new Date().toISOString().split('T')[0]
      });
    }
  }
  
  return jobs;
}

/**
 * 讀取履歷資料
 */
export async function getResumes() {
  const data = await getSheetData(SHEETS.resumes, '工作表1!A1:H100');
  
  if (data.length <= 1) return [];
  
  const resumes = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length > 0 && row[0]) {
      resumes.push({
        id: `CAN-${String(i).padStart(3, '0')}`,
        name: row[0] || '',
        contact: row[1] || '',
        position: row[2] || '',
        skills: row[3] || '',
        experience: row[4] || '',
        education: row[5] || '',
        resumeLink: row[6] || '',
        status: row[7] || '待審核'
      });
    }
  }
  
  return resumes;
}

/**
 * 生成儀表板資料
 */
export async function generateDashboard() {
  const [jobs, resumes] = await Promise.all([
    getJobs(),
    getResumes()
  ]);
  
  // 計算統計數據
  const openJobs = jobs.filter(j => j.status === '開放中').length;
  const totalCandidates = resumes.length;
  const activeCandidates = resumes.filter(r => r.status !== '已關閉' && r.status !== '不適合').length;
  
  // Pipeline 統計
  const pipeline = {
    sourcing: resumes.filter(r => r.status === '待審核' || r.status === '初篩中').length,
    screening: resumes.filter(r => r.status === '待推薦' || r.status === '待確認').length,
    submitted: resumes.filter(r => r.status === '已推薦').length,
    interview: resumes.filter(r => r.status === '面試中' || r.status === '面試安排').length,
    offer: resumes.filter(r => r.status === 'Offer' || r.status === '談判中').length,
    placed: resumes.filter(r => r.status === '已報到' || r.status === '保證期').length
  };
  
  return {
    summary: {
      openJobs,
      totalCandidates,
      activeCandidates,
      placementRate: totalCandidates > 0 ? Math.round((pipeline.placed / totalCandidates) * 100) : 0
    },
    pipeline,
    jobs: jobs.slice(0, 10),
    recentCandidates: resumes.slice(0, 5),
    timestamp: new Date().toISOString()
  };
}
