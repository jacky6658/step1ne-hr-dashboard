# Step1ne HR 儀表板 - Zeabur 部署指南

## 🎯 功能
- 即時從 Google Sheets 讀取職缺與履歷資料
- 自動生成 Pipeline 統計
- 每 30 秒自動更新

## 📋 前置需求

### 1. Google Cloud Service Account（二選一）

#### 選項 A：使用 gog CLI 認證（本地開發）
```bash
# 已經設定好，可以直接用
gog auth list
```

#### 選項 B：建立 Service Account（Zeabur 部署）
1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API
4. 建立 Service Account
5. 下載 JSON 金鑰
6. 將 Service Account 加入 Google Sheets 的分享名單（編輯者權限）

### 2. Google Sheets 設定
確保以下兩個 Sheets 已分享給 Service Account：
- **step1ne 職缺管理**：`1QPaeOm-slNVFCeM8Q3gg3DawKjzp2tYwyfquvdHlZFE`
- **履歷池索引**：`1PunpaDAFBPBL_I76AiRYGXKaXDZvMl1c262SEtxRk6Q`

## 🚀 部署到 Zeabur

### 1. 推送到 GitHub
```bash
cd ~/clawd/projects/hr-dashboard
git init
git add .
git commit -m "Initial commit: HR Dashboard with Google Sheets integration"
gh repo create step1ne-hr-dashboard --public --source=. --remote=origin
git push -u origin main
```

### 2. 連結 Zeabur
1. 前往 [Zeabur Dashboard](https://zeabur.com)
2. 建立新專案：`step1ne-hr-dashboard`
3. 連結 GitHub 倉庫：`step1ne-hr-dashboard`
4. 選擇框架：Next.js（自動偵測）

### 3. 設定環境變數
在 Zeabur 專案設定中加入：

```env
# Google Service Account Credentials (JSON 格式，需壓成一行)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"..."}

# Google Sheets IDs（可選，已有預設值）
SHEET_JOBS=1QPaeOm-slNVFCeM8Q3gg3DawKjzp2tYwyfquvdHlZFE
SHEET_RESUMES=1PunpaDAFBPBL_I76AiRYGXKaXDZvMl1c262SEtxRk6Q
```

### 4. 部署
Zeabur 會自動偵測並部署，完成後會提供一個網址，例如：
```
https://step1ne-hr-dashboard.zeabur.app
```

## 📊 API 端點

### GET /api/dashboard
取得即時儀表板資料

**回應範例**：
```json
{
  "summary": {
    "openJobs": 5,
    "totalCandidates": 0,
    "activeCandidates": 0,
    "placementRate": 0
  },
  "pipeline": {
    "sourcing": 0,
    "screening": 0,
    "submitted": 0,
    "interview": 0,
    "offer": 0,
    "placed": 0
  },
  "jobs": [...],
  "recentCandidates": [...],
  "timestamp": "2026-02-10T10:58:29.349Z"
}
```

## 🔄 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數（複製 .env.example 並填入）
cp .env.example .env.local

# 啟動開發伺服器
npm run dev
```

訪問：http://localhost:3000

## 🎨 前端頁面
儀表板 UI 已經建立在 `app/page.tsx`，會自動每 30 秒更新一次。

## ⚠️ 注意事項
1. Service Account 必須有 Sheets 的檢視權限
2. 環境變數 `GOOGLE_CREDENTIALS` 必須是有效的 JSON（壓成一行）
3. Zeabur 免費版有流量限制，請注意用量
4. 每 30 秒更新一次，避免過度呼叫 Google API

## 🐛 除錯

### 錯誤：Unable to read sheets
- 檢查 Service Account 是否已加入 Sheets 分享名單
- 檢查 `GOOGLE_CREDENTIALS` 格式是否正確

### 錯誤：No data found
- 檢查 Sheet 名稱是否為「工作表1」
- 檢查資料範圍是否正確（A1:K100 / A1:H100）

---

## 📞 支援
有問題請在 Telegram 群組詢問 AI 助理
