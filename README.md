# E-Commerce

Ứng dụng quản lý sản phẩm thương mại điện tử đơn giản gồm frontend React/Vite và backend Spring Boot. Backend cung cấp REST API để quản lý sản phẩm, lưu dữ liệu trong MySQL RDS và upload ảnh sản phẩm lên AWS S3. Frontend hiển thị danh sách sản phẩm và trang admin để thêm, sửa, xóa, upload ảnh.

## Công nghệ

- Frontend: React 19, Vite, React Router DOM, Axios, Nginx khi chạy Docker.
- Backend: Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA, MySQL, Lombok, AWS SDK S3.
- Database: Amazon RDS MySQL.
- Storage: Amazon S3.
- Deploy: Docker, Docker Hub, EC2, GitHub Actions.

## Cấu trúc thư mục

```text
.
├── .github/workflows/deploy.yml
├── backend
│   ├── src/main/java/com/example/ecommerce
│   │   ├── controller
│   │   ├── model
│   │   ├── repository
│   │   └── service
│   ├── src/main/resources/application.properties
│   ├── Dockerfile
│   └── pom.xml
└── frontend
    ├── src/components
    ├── src/pages
    ├── src/services/productService.js
    ├── Dockerfile
    └── package.json
```

## Chức năng chính

- Xem danh sách sản phẩm.
- Xem ảnh, tên, mô tả, giá sản phẩm.
- Quản lý sản phẩm tại route `/admin`.
- Thêm sản phẩm mới.
- Sửa thông tin sản phẩm.
- Xóa sản phẩm.
- Upload ảnh sản phẩm lên S3.

## API Backend

Base URL:

```text
/api/products
```

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/products` | Lấy tất cả sản phẩm |
| `GET` | `/api/products/{id}` | Lấy sản phẩm theo id |
| `POST` | `/api/products` | Tạo sản phẩm |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm |
| `POST` | `/api/products/{id}/image` | Upload ảnh sản phẩm |

## Biến môi trường

Backend cần:

```env
DB_PASSWORD=your_rds_password
```

Frontend cần:

```env
VITE_API_URL=http://52.65.5.156:8080/api
```

`frontend/.env` và `backend/.env` là file local, không nên commit lên GitHub. Chỉ commit các file `.env.example`.

## Chạy frontend local

Cách này phù hợp khi backend đã chạy trên EC2. Frontend local sẽ gọi API backend qua `VITE_API_URL`.

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Nếu dùng Command Prompt:

```bat
cd frontend
copy .env.example .env
npm install
npm run dev
```

Mở:

```text
http://localhost:5173
```

## Chạy backend local

Backend local chỉ chạy được nếu máy local kết nối được RDS qua port `3306`. Nếu RDS private hoặc Security Group chỉ cho EC2 truy cập, backend local sẽ lỗi `Communications link failure`.

PowerShell:

```powershell
cd backend
$env:DB_PASSWORD="your_rds_password"
.\mvnw.cmd spring-boot:run
```

Command Prompt:

```bat
cd backend
set DB_PASSWORD=your_rds_password
mvnw.cmd spring-boot:run
```

Backend chạy tại:

```text
http://localhost:8080
```

Nếu muốn backend local truy cập RDS, Security Group của RDS cần mở inbound MySQL/Aurora port `3306` từ IP máy bạn. Với mô hình deploy an toàn hơn, chỉ nên cho Security Group của EC2 truy cập RDS.

## Build kiểm tra local

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
cd backend
.\mvnw.cmd -DskipTests package
```

`mvnw test` có thể fail nếu test context không kết nối được RDS.

## Chạy bằng Docker trên EC2

Build backend:

```bash
cd backend
./mvnw -DskipTests package
docker build -t ecommerce-backend:latest .
```

Build frontend:

```bash
cd ../frontend
docker build --build-arg VITE_API_URL=http://52.65.5.156:8080/api -t ecommerce-frontend:latest .
```

Chạy container:

```bash
docker run -d \
  --name backend \
  -p 8080:8080 \
  -e DB_PASSWORD=your_rds_password \
  --restart unless-stopped \
  ecommerce-backend:latest

docker run -d \
  --name frontend \
  -p 3000:80 \
  --restart unless-stopped \
  ecommerce-frontend:latest
```

Mở:

```text
Frontend: http://52.65.5.156:3000
Backend:  http://52.65.5.156:8080/api/products
```

## GitHub Actions CI/CD

Workflow nằm tại:

```text
.github/workflows/deploy.yml
```

Khi push lên branch `main`, workflow sẽ:

1. Checkout source code.
2. Cài JDK 17.
3. Cài Node.js 20.
4. Build backend bằng Maven.
5. Build frontend bằng Vite với `VITE_API_URL` lấy từ `EC2_HOST`.
6. Login Docker Hub.
7. Build và push Docker image backend/frontend.
8. SSH vào EC2 và chạy lại 2 container.

GitHub Secrets cần cấu hình:

| Secret | Giá trị |
| --- | --- |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token |
| `EC2_HOST` | Elastic IP của EC2, hiện tại `52.65.5.156` |
| `EC2_SSH_KEY` | Nội dung private key `.pem` để SSH vào EC2 |
| `DB_PASSWORD` | Mật khẩu RDS |

Push để chạy pipeline:

```bash
git add .
git commit -m "docs: add project readme"
git push origin main
```

## Ghi chú AWS

- EC2 đang dùng Elastic IP `52.65.5.156`, nên IP không đổi khi stop/start instance.
- EC2 Security Group cần mở port `22`, `8080`, `3000`.
- RDS Security Group nên cho phép MySQL port `3306` từ Security Group của EC2.
- Backend upload ảnh lên S3 bằng AWS credentials mặc định. Khi chạy trên EC2, nên dùng IAM role có quyền upload vào bucket `simple-ecommerce-phamducthanh`.
