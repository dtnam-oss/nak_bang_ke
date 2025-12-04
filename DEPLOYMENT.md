# Deployment Guide

Hướng dẫn deploy Logistics Dashboard lên Google Apps Script

## 📋 Yêu cầu trước khi deploy

- [ ] Google Account với quyền truy cập BigQuery
- [ ] Project BigQuery đã setup
- [ ] Dataset và Table trong BigQuery
- [ ] Node.js installed (cho CLASP)
- [ ] CLASP installed: `npm install -g @google/clasp`

## 🚀 Deployment Methods

### Method 1: CLASP (Command Line) - Recommended

#### Bước 1: Login vào Google Account
```bash
clasp login
```
Browser sẽ mở, đăng nhập vào Google Account.

#### Bước 2: Kiểm tra .clasp.json
File `.clasp.json` đã có sẵn với scriptId:
```json
{
  "scriptId": "1adOXj_Yg6K6w9Czl9Ge78LbtDGv3xhKeE3wzbD9o_7iJvqEAH9XJZKI8"
}
```

**Lưu ý:** Nếu deploy project mới, xóa file này và tạo mới:
```bash
rm .clasp.json
clasp create --type webapp --title "Logistics Dashboard"
```

#### Bước 3: Push code lên Apps Script
```bash
cd /Users/mac/Desktop/system_nak
clasp push
```

Tất cả file .gs và .html sẽ được push lên.

#### Bước 4: Mở Apps Script Editor
```bash
clasp open
```

#### Bước 5: Configure BigQuery
Trong Apps Script Editor, mở **Config.gs** và cập nhật:
```javascript
BIGQUERY: {
  PROJECT_ID: 'nakvi-476804',        // Your project ID
  DATASET: 'nak_logistics',          // Your dataset
  TABLE_TRIPS: 'tb_chuyen_di'        // Your table
}
```

#### Bước 6: Test trong Editor
Run function `testBigQueryConnection()` trong Editor để test.

#### Bước 7: Deploy Web App
```bash
clasp deploy --description "Production v1.0"
```

Hoặc trong Editor:
1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (hoặc tùy chỉnh)
5. Click **Deploy**

#### Bước 8: Get Web App URL
```bash
clasp deployments
```

Copy URL và mở trong browser.

---

### Method 2: Apps Script Editor (Manual)

#### Bước 1: Tạo Project mới
1. Vào https://script.google.com
2. Click **New project**
3. Đặt tên: "Logistics Dashboard"

#### Bước 2: Add Advanced Services
1. Click ⚙️ **Project Settings**
2. Scroll xuống **Advanced Services**
3. Enable:
   - BigQuery API v2
   - Drive API v2
   - Google Sheets API v4

#### Bước 3: Copy Files

**Server-side files (.gs):**
1. Tạo file mới: `Config.gs`
2. Copy nội dung từ local `Config.gs`
3. Paste vào editor
4. Lặp lại với:
   - ErrorHandler.gs
   - BigQueryService.gs
   - Main.gs

**Client-side files (.html):**
1. Click **+** → **HTML**
2. Tạo file: `Index.html`
3. Copy nội dung từ local
4. Lặp lại với:
   - Styles.html
   - ClientConfig.html
   - ApiClient.html
   - UIComponents.html
   - AppController.html

#### Bước 4: Update appsscript.json
1. Click ⚙️ **Project Settings**
2. Check **Show "appsscript.json"**
3. File sẽ xuất hiện trong editor
4. Paste nội dung từ local appsscript.json

#### Bước 5: Save & Test
1. Click 💾 **Save all**
2. Select function: `testBigQueryConnection`
3. Click **Run**
4. Authorize permissions
5. Check **Execution log**

#### Bước 6: Deploy
1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. Description: "Production v1.0"
4. Execute as: **Me (your email)**
5. Who has access: **Anyone** hoặc theo nhu cầu
6. Click **Deploy**
7. Copy **Web app URL**

---

## ⚙️ Post-Deployment Configuration

### 1. Verify BigQuery Connection
```javascript
// Run trong Apps Script Editor
testBigQueryConnection()
```

Check logs:
```
Success: {
  "success": true,
  "data": {
    "total": 1234,
    "byRoute": 567,
    "ghn": 667
  }
}
```

### 2. Test Web App
1. Mở Web App URL
2. Kiểm tra:
   - [ ] Dashboard loads
   - [ ] Stats display correctly
   - [ ] Menu navigation works
   - [ ] Sidebar collapse/expand
   - [ ] Mobile responsive

### 3. Setup Monitoring (Optional)

**Stackdriver Logging:**
```javascript
// Already enabled in appsscript.json
"exceptionLogging": "STACKDRIVER"
```

View logs:
1. Apps Script Editor → **Executions**
2. Hoặc: https://console.cloud.google.com/logs

---

## 🔄 Update Deployment

### CLASP Method
```bash
# Pull latest từ Apps Script (nếu có changes online)
clasp pull

# Make changes locally

# Push updates
clasp push

# Create new version
clasp deploy --description "v1.1 - Added new features"
```

### Manual Method
1. Edit files trong Apps Script Editor
2. Save
3. Deploy → **Manage deployments**
4. Click ✏️ edit
5. New version → Save

---

## 🐛 Troubleshooting

### Error: "Script function not found: getDashboardStats"

**Solution:**
- Check Main.gs có function `getDashboardStats`
- Verify đã Save all files
- Redeploy

### Error: "Access denied: BigQuery"

**Solution:**
1. Check appsscript.json có scopes:
```json
"https://www.googleapis.com/auth/bigquery"
```
2. Re-authorize app
3. Check BigQuery permissions

### Error: "include is not defined"

**Solution:**
- Verify Main.gs có function `include()`
- Check syntax: `<?!= include('Styles'); ?>`
- Ensure file names match exactly

### Blank Page

**Solution:**
1. Open browser console (F12)
2. Check errors
3. Verify all `.html` files pushed
4. Check Index.html syntax

### CSS/JS không load

**Solution:**
- Check `<?!= include('Styles'); ?>` syntax
- Ensure no typos in file names
- Verify files uploaded

---

## 🔐 Security Checklist

- [ ] Review OAuth scopes
- [ ] Set appropriate "Who has access" level
- [ ] Don't expose sensitive data in client code
- [ ] Use Config.gs for credentials
- [ ] Test authorization flow
- [ ] Review Stackdriver logs for errors

---

## 📊 Performance Tips

### 1. Enable Caching (Future)
```javascript
// Config.gs
FEATURES: {
  ENABLE_CACHE: true,
  CACHE_DURATION: 300  // 5 minutes
}
```

### 2. Optimize BigQuery Queries
- Use partitioned tables
- Add WHERE clauses to limit data
- Use LIMIT in queries

### 3. Minimize API Calls
- Cache dashboard stats
- Only refetch on user action

---

## 📝 Deployment Checklist

### Pre-deployment
- [ ] Update Config.gs với đúng BigQuery credentials
- [ ] Test all functions trong Editor
- [ ] Check appsscript.json có đủ scopes
- [ ] Review security settings

### Deployment
- [ ] Push/upload all files
- [ ] Enable Advanced Services
- [ ] Test connection với `testBigQueryConnection()`
- [ ] Deploy as Web App
- [ ] Copy deployment URL

### Post-deployment
- [ ] Test Web App URL
- [ ] Verify dashboard loads
- [ ] Check all menu items
- [ ] Test mobile responsive
- [ ] Monitor Stackdriver logs

### Documentation
- [ ] Update README với deployment URL
- [ ] Document any custom config
- [ ] Share URL với team

---

## 🔄 Rollback Plan

Nếu deployment mới có lỗi:

### CLASP
```bash
# List deployments
clasp deployments

# Undeploy specific version
clasp undeploy <deploymentId>

# Redeploy previous version
clasp deploy --versionNumber <versionNumber>
```

### Manual
1. Deploy → **Manage deployments**
2. Click version dropdown
3. Select previous version
4. Save

---

## 📞 Support

**Issues:**
- Check Apps Script Execution logs
- Check Browser console (F12)
- Review ARCHITECTURE.md
- Check README.md

**Common Commands:**
```bash
clasp login              # Login
clasp push              # Upload code
clasp pull              # Download code
clasp open              # Open editor
clasp deploy            # Create deployment
clasp deployments       # List deployments
clasp logs              # View logs
```

---

**Version:** 1.0
**Last Updated:** 2025
