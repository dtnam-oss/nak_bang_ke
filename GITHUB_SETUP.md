# 🚀 Hướng dẫn đẩy code lên GitHub

## ✅ Đã hoàn thành (tự động)

- [x] Tạo file `.gitignore`
- [x] Khởi tạo Git repository (`git init`)
- [x] Cấu hình Git user
- [x] Tạo commit đầu tiên (61 files, 23,017 dòng)

---

## 📝 Các bước tiếp theo (thực hiện thủ công)

### Bước 1: Tạo Repository trên GitHub

1. Truy cập: **https://github.com/new**
2. Điền thông tin:

```
Repository name: nak-logistics-dashboard
Description: NAK Logistics Dashboard - Standalone JavaScript version with BigQuery integration

Visibility:
  [ ] Public (mọi người có thể xem)
  [x] Private (chỉ bạn xem được)

⚠️ QUAN TRỌNG - KHÔNG tích vào các options sau:
  [ ] Add a README file
  [ ] Add .gitignore
  [ ] Choose a license
```

3. Click **"Create repository"**

---

### Bước 2: Lấy URL của repository

Sau khi tạo xong, GitHub sẽ hiển thị URL như:

```
https://github.com/YOUR_USERNAME/nak-logistics-dashboard.git
```

Copy URL này.

---

### Bước 3: Thêm remote và push code

Mở Terminal trong thư mục `/Users/mac/Desktop/system_nak` và chạy:

```bash
# Thêm remote repository (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/nak-logistics-dashboard.git

# Xác nhận branch là main
git branch -M main

# Push code lên GitHub
git push -u origin main
```

---

## 🔐 Xác thực với GitHub

Khi push lần đầu, GitHub sẽ yêu cầu xác thực:

### Option 1: Personal Access Token (Khuyên dùng)

1. Truy cập: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Điền:
   - **Note**: `NAK Dashboard Access`
   - **Expiration**: 90 days (hoặc tùy ý)
   - **Scopes**: Tích vào:
     - ✅ `repo` (Full control of private repositories)
4. Click **"Generate token"**
5. **Copy token** (chỉ hiển thị 1 lần!)
6. Khi push, dùng token này làm password

### Option 2: SSH Key

Nếu muốn dùng SSH thay vì HTTPS:

```bash
# Tạo SSH key (nếu chưa có)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Paste vào GitHub:
# https://github.com/settings/keys → New SSH key
```

Sau đó thay đổi remote URL:

```bash
git remote set-url origin git@github.com:YOUR_USERNAME/nak-logistics-dashboard.git
git push -u origin main
```

---

## 📊 Kiểm tra sau khi push

Sau khi push thành công, truy cập:

```
https://github.com/YOUR_USERNAME/nak-logistics-dashboard
```

Bạn sẽ thấy:
- ✅ 61 files
- ✅ README.md được hiển thị tự động
- ✅ Commit message: "Initial commit: NAK Logistics Dashboard"
- ✅ File structure đầy đủ

---

## 🔄 Các lệnh Git thường dùng sau này

### Khi có thay đổi mới:

```bash
# Xem files đã thay đổi
git status

# Thêm tất cả files đã thay đổi
git add .

# Hoặc thêm file cụ thể
git add filename.html

# Tạo commit
git commit -m "Mô tả thay đổi"

# Push lên GitHub
git push
```

### Xem lịch sử commit:

```bash
git log
git log --oneline
```

### Tạo branch mới:

```bash
# Tạo và chuyển sang branch mới
git checkout -b feature/new-feature

# Push branch lên GitHub
git push -u origin feature/new-feature
```

### Pull code mới nhất từ GitHub:

```bash
git pull origin main
```

---

## 🛡️ BẢO MẬT - QUAN TRỌNG

### ⚠️ Files KHÔNG BAO GIỜ được commit lên GitHub:

- ❌ `service-account-key.json` (BigQuery credentials)
- ❌ `.env` (environment variables)
- ❌ `node_modules/` (dependencies)
- ❌ Bất kỳ file chứa password, API keys, secrets

### ✅ Files đã được bảo vệ bởi `.gitignore`:

```gitignore
service-account-key.json
*.json (trừ package.json)
.env
node_modules/
```

### 🔍 Kiểm tra trước khi commit:

```bash
# Xem files sẽ được commit
git status

# Xem nội dung thay đổi
git diff

# Nếu thấy file nhạy cảm, loại bỏ:
git reset filename.json
```

---

## 📖 README.md trên GitHub

File `README.md` sẽ được hiển thị tự động trên trang chủ repository.

Bạn có thể chỉnh sửa để làm trang chủ đẹp hơn:

```bash
# Edit README
nano README.md

# Commit và push
git add README.md
git commit -m "Update README"
git push
```

---

## 🎯 Clone repository về máy khác

Nếu muốn clone code về máy khác:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/nak-logistics-dashboard.git

# Vào thư mục
cd nak-logistics-dashboard

# Cài đặt dependencies (cho standalone version)
cd standalone
npm install

# Chạy
npm start
```

---

## ❓ Troubleshooting

### Lỗi: "Permission denied"

Kiểm tra:
1. Username/Password đúng chưa?
2. Personal Access Token có đủ quyền `repo` không?
3. Nếu dùng SSH, key đã được thêm vào GitHub chưa?

### Lỗi: "Repository not found"

- Kiểm tra URL repository có đúng không
- Repository có tồn tại trên GitHub không
- Bạn có quyền truy cập repository không (nếu là private)

### Lỗi: "Failed to push some refs"

```bash
# Pull code mới nhất trước
git pull origin main --rebase

# Sau đó push lại
git push
```

### Xóa remote và thêm lại:

```bash
# Xem remote hiện tại
git remote -v

# Xóa remote
git remote remove origin

# Thêm lại
git remote add origin https://github.com/YOUR_USERNAME/nak-logistics-dashboard.git
```

---

## 📱 GitHub Desktop (GUI Alternative)

Nếu không muốn dùng command line, download GitHub Desktop:

**https://desktop.github.com/**

1. Cài đặt và login
2. File → Add Local Repository
3. Chọn thư mục `/Users/mac/Desktop/system_nak`
4. Publish repository lên GitHub

---

## 🎉 Hoàn thành!

Repository của bạn đã sẵn sàng trên GitHub!

**URL ví dụ:**
```
https://github.com/YOUR_USERNAME/nak-logistics-dashboard
```

Giờ bạn có thể:
- ✅ Chia sẻ code với team
- ✅ Backup code trên cloud
- ✅ Track changes và versions
- ✅ Collaborate với developers khác
- ✅ Setup CI/CD để auto-deploy

---

## 📚 Tài liệu tham khảo

- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Learning Lab](https://lab.github.com/)

---

**Happy coding! 🚀**
