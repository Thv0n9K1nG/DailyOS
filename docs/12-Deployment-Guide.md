# 12 - Deployment Guide

**Dự án:** LifeBoard — Personal Productivity System
**Phiên bản:** 1.0
**Ngày:** 2026-07-11

---

## 1. Tổng quan

LifeBoard là ứng dụng **local-first** — toàn bộ stack chạy trên máy người dùng, không cần internet. Tài liệu này hướng dẫn hai phương thức triển khai:

| Phương thức | Phù hợp với | Độ phức tạp |
|------------|------------|------------|
| **Manual** | Developer, debug, phát triển | Trung bình |
| **Docker Compose** | End-user, deploy nhanh | Thấp |

---

## 2. Yêu cầu Hệ thống

### 2.1 Manual Setup

| Thành phần | Phiên bản tối thiểu |
|-----------|-------------------|
| OS | Windows 10+ / Ubuntu 22.04+ / macOS 13+ |
| Node.js | 20 LTS trở lên |
| .NET SDK | 8.0 trở lên |
| MySQL | 8.0 trở lên |
| Git | 2.x |

### 2.2 Docker Setup

| Thành phần | Phiên bản tối thiểu |
|-----------|-------------------|
| Docker Desktop | 4.x trở lên |
| Docker Compose | v2.x (tích hợp trong Docker Desktop) |
| RAM khuyến nghị | 4GB trở lên |

---

## 3. Cài đặt Thủ công (Manual)

### Bước 1: Clone Repository

```bash
git clone https://github.com/<username>/LifeBoard.git
cd LifeBoard
```

---

### Bước 2: Cài đặt & Cấu hình MySQL

```bash
# Windows: Tải MySQL Installer từ https://dev.mysql.com/downloads/
# Ubuntu:
sudo apt update && sudo apt install -y mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation

# Tạo database và user
mysql -u root -p
```

```sql
CREATE DATABASE lifeboard
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'lifeboard_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON lifeboard.* TO 'lifeboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Bước 3: Cấu hình Backend

```bash
cd LifeBoard.API
```

Chỉnh sửa `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=lifeboard;Uid=lifeboard_user;Pwd=StrongPassword123!;CharSet=utf8mb4;"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

Chạy Migration để tạo schema:

```bash
# Nếu dùng script SQL
mysql -u lifeboard_user -p lifeboard < ./Migrations/001_init_schema.sql

# Nếu dùng EF Core Migrations
dotnet ef database update
```

---

### Bước 4: Chạy Backend

```bash
cd LifeBoard.API
dotnet restore
dotnet build
dotnet run --launch-profile Development
```

Kiểm tra:
```
Now listening on: http://localhost:5000
```

Test nhanh:
```bash
curl http://localhost:5000/api/v1/settings
```

Kết quả mong đợi:
```json
{"theme":"dark","pomodoroFocusMinutes":25,...}
```

---

### Bước 5: Cài đặt & Chạy Frontend

```bash
cd lifeboard-client
npm install
```

Tạo file `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Chạy dev server:

```bash
npm run dev
```

Kết quả:
```
  VITE v5.x.x  ready in 800ms
  ➜  Local:   http://localhost:5173/
```

Mở trình duyệt: **http://localhost:5173**

---

## 4. Triển khai với Docker Compose

### Bước 1: Chuẩn bị file cấu hình

Tạo `docker-compose.yml` ở root project:

```yaml
version: '3.9'

services:
  mysql:
    image: mysql:8.0
    container_name: lifeboard-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: lifeboard
      MYSQL_USER: lifeboard_user
      MYSQL_PASSWORD: StrongPassword123!
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./LifeBoard.API/Migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./LifeBoard.API
      dockerfile: Dockerfile
    container_name: lifeboard-api
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=mysql;Port=3306;Database=lifeboard;Uid=lifeboard_user;Pwd=StrongPassword123!;CharSet=utf8mb4;
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build:
      context: ./lifeboard-client
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=http://localhost:5000/api/v1
    container_name: lifeboard-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - api

volumes:
  mysql_data:
```

---

### Bước 2: Dockerfile — Backend

`LifeBoard.API/Dockerfile`:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "LifeBoard.API.dll"]
```

---

### Bước 3: Dockerfile — Frontend

`lifeboard-client/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`lifeboard-client/nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — tất cả routes về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### Bước 4: Khởi động

```bash
# Build và khởi động tất cả services
docker compose up -d --build

# Xem logs
docker compose logs -f

# Xem trạng thái
docker compose ps
```

Kết quả mong đợi:
```
NAME                  STATUS
lifeboard-mysql       Up (healthy)
lifeboard-api         Up
lifeboard-frontend    Up
```

Mở trình duyệt: **http://localhost:5173**

---

### Bước 5: Dừng & Xóa

```bash
# Dừng (giữ data)
docker compose down

# Dừng và xóa toàn bộ data (cẩn thận!)
docker compose down -v
```

---

## 5. Cấu trúc Thư mục Production Build

```
LifeBoard/
├── docker-compose.yml
├── LifeBoard.API/
│   ├── Dockerfile
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   ├── Migrations/
│   │   └── 001_init_schema.sql
│   └── ...
└── lifeboard-client/
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.local          (không commit)
    └── ...
```

---

## 6. Environment Variables

### Backend

| Variable | Mô tả | Mặc định |
|---------|-------|---------|
| `ASPNETCORE_ENVIRONMENT` | Môi trường chạy | `Development` |
| `ConnectionStrings__DefaultConnection` | MySQL connection string | — |
| `ASPNETCORE_URLS` | URLs API lắng nghe | `http://+:5000` |

### Frontend (Build-time)

| Variable | Mô tả | Mặc định |
|---------|-------|---------|
| `VITE_API_BASE_URL` | Base URL của Backend API | `http://localhost:5000/api/v1` |

---

## 7. Database Migration

### Migration thủ công

```bash
# Chạy migration script mới
mysql -u lifeboard_user -p lifeboard < ./Migrations/002_add_feature.sql
```

### Naming Convention cho Migration Files

```
001_init_schema.sql
002_add_mood_entries.sql
003_add_countdown_color.sql
```

> **Lưu ý:** Chạy theo thứ tự số thứ tự tăng dần. Không sửa migration đã chạy.

### Schema Version Tracking

```sql
-- Bảng theo dõi migrations đã chạy
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     VARCHAR(20) PRIMARY KEY,
    applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Backup trong Production

### Backup định kỳ

```bash
# Script backup tự động (Windows Task Scheduler / cron)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
mysqldump -u lifeboard_user -pStrongPassword123! lifeboard \
  > "$BACKUP_DIR/lifeboard_backup_$TIMESTAMP.sql"

# Giữ lại 30 bản backup gần nhất
ls -t "$BACKUP_DIR"/lifeboard_backup_*.sql | tail -n +31 | xargs rm -f
```

### Backup thông qua UI

Người dùng có thể backup/restore qua `Settings → Backup & Restore` trong ứng dụng (xem FR-024, FR-025).

---

## 9. Xử lý Sự cố Thường gặp

### 9.1 Backend không kết nối được MySQL

```
Error: Unable to connect to any of the specified MySQL hosts.
```

**Kiểm tra:**
```bash
# Xem MySQL có đang chạy không
sudo systemctl status mysql
# hoặc Docker
docker compose ps mysql

# Test kết nối
mysql -h localhost -u lifeboard_user -p lifeboard -e "SELECT 1;"
```

**Fix:**
- Đảm bảo MySQL đang chạy
- Kiểm tra đúng host, port, username, password trong connection string
- Đảm bảo database `lifeboard` đã được tạo

---

### 9.2 CORS Error trên Frontend

```
Access-Control-Allow-Origin header missing
```

**Fix:** Kiểm tra `appsettings.json`:
```json
"Cors": {
  "AllowedOrigins": ["http://localhost:5173"]
}
```
Đảm bảo URL frontend khớp chính xác (bao gồm port).

---

### 9.3 Port đã được sử dụng

```
Error: listen EADDRINUSE :::5173
```

**Fix:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :5173   # Windows
lsof -i :5173                   # Linux/Mac

# Kill process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                   # Linux/Mac
```

---

### 9.4 Docker — MySQL chưa sẵn sàng

```
Error: Connection refused to mysql:3306
```

**Fix:** API depends_on healthcheck của MySQL. Nếu vẫn lỗi:
```bash
# Đợi MySQL healthy rồi restart API
docker compose restart api
```

---

### 9.5 Frontend hiển thị trang trắng sau build

**Kiểm tra:**
```bash
# Xem nginx logs
docker logs lifeboard-frontend

# Đảm bảo index.html tồn tại
docker exec lifeboard-frontend ls /usr/share/nginx/html
```

**Fix thường gặp:** Đảm bảo `nginx.conf` có SPA fallback (`try_files $uri /index.html`).

---

### 9.6 Frontend không gọi được API

```
Network Error / ERR_CONNECTION_REFUSED
```

**Kiểm tra:**
```bash
# Trong browser console
fetch('http://localhost:5000/api/v1/settings').then(r => r.json()).then(console.log)

# Xem biến môi trường frontend
echo $VITE_API_BASE_URL
```

**Fix:** Đảm bảo `.env.local` có đúng `VITE_API_BASE_URL` và rebuild frontend.

---

## 10. Checklist Triển khai

### Manual Setup
- [ ] MySQL 8.0+ đã cài và chạy
- [ ] Database `lifeboard` và user đã tạo
- [ ] Migration script đã chạy thành công
- [ ] `appsettings.Development.json` đã cấu hình đúng connection string
- [ ] Backend khởi động thành công tại `http://localhost:5000`
- [ ] `.env.local` frontend đã cấu hình `VITE_API_BASE_URL`
- [ ] Frontend khởi động tại `http://localhost:5173`
- [ ] Mở trình duyệt và Dashboard hiển thị bình thường

### Docker Setup
- [ ] Docker Desktop đang chạy
- [ ] `docker-compose.yml` đã tạo
- [ ] Dockerfile backend và frontend đã tạo
- [ ] `nginx.conf` đã tạo
- [ ] `docker compose up -d --build` thành công
- [ ] Cả 3 containers đang `Up`
- [ ] MySQL container có trạng thái `healthy`
- [ ] Mở `http://localhost:5173` và Dashboard hiển thị bình thường

---

## 11. Thông tin Cổng (Ports)

| Service | Port | Giao thức |
|---------|------|----------|
| MySQL | 3306 | TCP |
| ASP.NET Core API | 5000 | HTTP |
| React Frontend | 5173 | HTTP |

> **Bảo mật:** Tất cả services chỉ lắng nghe trên `localhost`. Không expose ra internet.
