# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy Logistics Dashboard trong 5 phút.

## 📋 Prerequisites

- Google Account
- BigQuery project đã setup
- CLASP installed: `npm install -g @google/clasp`

## ⚡ 5-Minute Setup

### Bước 1: Clone/Download Project (0:30)
```bash
cd /Users/mac/Desktop/system_nak
```

### Bước 2: Login CLASP (1:00)
```bash
clasp login
```
→ Browser sẽ mở, login vào Google Account

### Bước 3: Update Config (1:30)
Mở file [Config.gs](Config.gs) và cập nhật:
```javascript
BIGQUERY: {
  PROJECT_ID: 'your-project-id',     // ← THAY ĐỔI
  DATASET: 'your-dataset',           // ← THAY ĐỔI
  TABLE_TRIPS: 'your-table-name'     // ← THAY ĐỔI
}
```

### Bước 4: Push Code (2:30)
```bash
clasp push
```

### Bước 5: Deploy (4:00)
```bash
clasp deploy --description "Initial deployment"
```

### Bước 6: Open Web App (5:00)
```bash
clasp deployments
```
→ Copy URL và mở trong browser

## ✅ Verify

Dashboard should load with:
- ✅ Sidebar menu
- ✅ Stats cards với số liệu từ BigQuery
- ✅ Responsive design

## 🐛 Quick Troubleshooting

**Lỗi: "Access denied"**
```bash
# Re-authorize
clasp open
# → Run testBigQueryConnection() trong editor
```

**Lỗi: "Script function not found"**
```bash
# Re-push code
clasp push --force
```

**Dashboard trống:**
- Open browser console (F12)
- Check errors
- Verify Config.gs đã update đúng

## 📚 Next Steps

1. ✅ **Đọc README.md** - Hiểu cấu trúc project
2. ✅ **Đọc ARCHITECTURE.md** - Hiểu kiến trúc
3. ✅ **Đọc DEPLOYMENT.md** - Chi tiết deployment
4. ✅ **Bắt đầu customize!**

## 🎯 Common Tasks

### Update BigQuery Query
```javascript
// File: Config.gs
QUERIES: {
  DASHBOARD_STATS: function() {
    return `
      SELECT ... // ← SỬA QUERY Ở ĐÂY
    `;
  }
}
```

### Add Menu Item
```javascript
// File: ClientConfig.html
menuItems: [
  { id: 'new-page', label: 'New Page', icon: 'new_icon' }  // ← THÊM
]
```

### Redeploy After Changes
```bash
clasp push
# Deployment URL giữ nguyên, không cần deploy lại
```

## 💡 Tips

- 💾 **Auto-save**: Enable trong Apps Script Editor
- 🔍 **Debug**: Check browser console + Apps Script logs
- 📝 **Test**: Run `testBigQueryConnection()` sau mỗi lần sửa query
- 🔄 **Live reload**: Code changes reflect ngay khi refresh browser

## 📞 Help

Stuck? Check:
1. [README.md](README.md) - General info
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment issues
4. [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - What changed

---

**Ready to start? Let's go! 🚀**
