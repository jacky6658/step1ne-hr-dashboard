const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const SHEETS = {
  jobs: '1QPaeOm-slNVFCeM8Q3gg3DawKjzp2tYwyfquvdHlZFE',
  resumes: '1PunpaDAFBPBL_I76AiRYGXKaXDZvMl1c262SEtxRk6Q'
};

const ACCOUNT = 'aiagentg888@gmail.com';

async function getSheetData(sheetId, range) {
  try {
    const cmd = `gog sheets get ${sheetId} "${range}" --account ${ACCOUNT} --json`;
    const { stdout } = await execAsync(cmd);
    const data = JSON.parse(stdout);
    return data.values || [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetId}:`, error.message);
    return [];
  }
}

async function test() {
  console.log('📊 測試 Google Sheets 讀取...\n');
  
  // 測試職缺
  console.log('1️⃣ 讀取職缺資料...');
  const jobsData = await getSheetData(SHEETS.jobs, '工作表1!A1:K100');
  console.log(`   ✅ 讀取到 ${jobsData.length} 列資料`);
  console.log(`   表頭: ${jobsData[0]?.join(' | ')}\n`);
  
  // 測試履歷
  console.log('2️⃣ 讀取履歷資料...');
  const resumesData = await getSheetData(SHEETS.resumes, '工作表1!A1:H100');
  console.log(`   ✅ 讀取到 ${resumesData.length} 列資料`);
  console.log(`   表頭: ${resumesData[0]?.join(' | ')}\n`);
  
  // 生成儀表板資料
  console.log('3️⃣ 生成儀表板統計...');
  const dashboard = {
    openJobs: jobsData.length - 1, // 扣除表頭
    totalResumes: resumesData.length - 1,
    timestamp: new Date().toISOString()
  };
  console.log(`   📊 開放職缺: ${dashboard.openJobs}`);
  console.log(`   📋 履歷總數: ${dashboard.totalResumes}`);
  console.log(`   🕐 更新時間: ${dashboard.timestamp}\n`);
  
  console.log('✅ 測試完成！');
}

test().catch(console.error);
