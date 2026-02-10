# Google Sheets API 設定指南

## 🎯 目標
建立 Google Service Account，讓 Zeabur 可以讀取你的 Google Sheets

## 📋 步驟

### 1️⃣ 前往 Google Cloud Console
https://console.cloud.google.com

### 2️⃣ 建立新專案（或選擇現有的）
1. 點選上方的專案選單
2. 點「新增專案」
3. 專案名稱：`Step1ne HR Dashboard`
4. 點「建立」

### 3️⃣ 啟用 Google Sheets API
1. 左側選單 → **「API 和服務」** → **「程式庫」**
2. 搜尋 `Google Sheets API`
3. 點進去，點「啟用」

### 4️⃣ 建立 Service Account
1. 左側選單 → **「API 和服務」** → **「憑證」**
2. 點上方「**建立憑證**」→ 選「**服務帳戶**」
3. 填寫資訊：
   - **服務帳戶名稱**：`hr-dashboard`
   - **服務帳戶 ID**：`hr-dashboard`（自動生成）
   - **說明**：`Step1ne HR 儀表板讀取 Sheets`
4. 點「**建立並繼續**」
5. **授予這個服務帳戶專案的存取權**：**略過**（不需要）
6. **將存取權授予使用者**：**略過**
7. 點「**完成**」

### 5️⃣ 下載 JSON 金鑰
1. 在「**服務帳戶**」列表中，找到剛建立的 `hr-dashboard@...`
2. 點進去，切換到「**金鑰**」頁籤
3. 點「**新增金鑰**」→「**建立新的金鑰**」
4. 選擇「**JSON**」
5. 點「**建立**」→ 會自動下載一個 JSON 檔案

**重要**：這個檔案包含私鑰，請妥善保管！

### 6️⃣ 分享 Google Sheets 給 Service Account
1. 打開下載的 JSON 檔案，找到 `client_email` 欄位：
   ```json
   "client_email": "hr-dashboard@xxxxx.iam.gserviceaccount.com"
   ```
2. 複製這個 email
3. 打開你的 Google Sheets：
   - [step1ne 職缺管理](https://docs.google.com/spreadsheets/d/1QPaeOm-slNVFCeM8Q3gg3DawKjzp2tYwyfquvdHlZFE)
   - [履歷池索引](https://docs.google.com/spreadsheets/d/1PunpaDAFBPBL_I76AiRYGXKaXDZvMl1c262SEtxRk6Q)
4. 點右上角「**共用**」
5. 貼上 Service Account 的 email
6. 權限選「**檢視者**」（只需要讀取）
7. **取消勾選「通知使用者」**
8. 點「**共用**」

對兩個 Sheets 都重複這個步驟。

### 7️⃣ 準備環境變數
1. 打開下載的 JSON 檔案
2. **複製整個檔案內容**（完整的 JSON）
3. **壓成一行**（移除所有換行）

**範例**：
```json
{"type":"service_account","project_id":"step1ne-hr-dashboard","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"hr-dashboard@step1ne-hr-dashboard.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**重要**：`private_key` 中的 `\n` 要保留！

---

## 🚀 下一步：部署到 Zeabur

完成上述步驟後，請告訴我：
1. ✅ Service Account 已建立
2. ✅ Sheets 已分享給 Service Account
3. ✅ JSON 金鑰已下載

我會幫你完成 Zeabur 部署！

---

## 🐛 常見問題

**Q: 找不到「API 和服務」？**  
A: 確認你在正確的專案中，左上角應該顯示專案名稱

**Q: 分享 Sheets 時找不到 Service Account email？**  
A: 直接貼上 email，按 Enter，即使顯示「找不到使用者」也沒關係

**Q: JSON 金鑰遺失怎麼辦？**  
A: 可以在「金鑰」頁籤重新建立一個新的（舊的會失效）

**Q: 為什麼要壓成一行？**  
A: Zeabur 環境變數不支援多行，必須是單行字串
