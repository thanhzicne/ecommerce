# E-Commerce

Ứng dụng quản lý sản phẩm thương mại điện tử đơn giản gồm frontend React/Vite và backend Spring Boot. Backend cung cấp REST API để quản lý sản phẩm, lưu dữ liệu trong Amazon RDS MySQL và upload ảnh sản phẩm lên Amazon S3. Frontend được deploy lên S3 và phân phối qua CloudFront HTTPS.

## Công Nghệ

- Frontend: React 19, Vite, React Router DOM, Axios.
- Backend: Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA, Lombok.
- Database: Amazon RDS MySQL.
- Storage: Amazon S3.
- CDN/HTTPS: Amazon CloudFront với Origin Access Control (OAC).
- Deploy: Docker, Docker Hub, EC2, GitHub Actions.

## Kiến Trúc Deploy

```text
User
  |
  v
CloudFront: https://d1cbcva8jyj4q8.cloudfront.net
  |-- /*       -> S3 bucket frontend: simple-ecommerce-phamducthanh
  |-- /api/*   -> EC2 backend: http://52.65.5.156:8080
  |
Backend EC2
  |-- RDS MySQL
  |-- upload ảnh -> S3 images/
```

CloudFront là URL chính của website:

```text
https://d1cbcva8jyj4q8.cloudfront.net
```

API public qua CloudFront:

```text
https://d1cbcva8jyj4q8.cloudfront.net/api/products
```

## Cấu Trúc Thư Mục

```text
.
├── .github/workflows/deploy.yml
├── backend
│   ├── src/main/java/com/example/ecommerce
│   │   ├── config
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
    ├── src/utils/imageUrl.js
    ├── Dockerfile
    └── package.json
```

## Chức Năng

- Xem danh sách sản phẩm.
- Xem ảnh, tên, mô tả, giá sản phẩm.
- Quản lý sản phẩm tại route `/admin`.
- Thêm, sửa, xóa sản phẩm.
- Upload ảnh sản phẩm lên S3.
- Hiển thị ảnh S3 thông qua CloudFront.

## API Backend

Base path:

```text
/api/products
```

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/products` | Lấy tất cả sản phẩm |
| `GET` | `/api/products/{id}` | Lấy sản phẩm theo ID |
| `POST` | `/api/products` | Tạo sản phẩm |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm |
| `POST` | `/api/products/{id}/image` | Upload ảnh sản phẩm |

## Biến Môi Trường

Backend:

```env
DB_PASSWORD=your_rds_password
```

Frontend local khi test trực tiếp qua EC2:

```env
VITE_API_URL=http://52.65.5.156:8080/api
VITE_ASSET_BASE_URL=https://d1cbcva8jyj4q8.cloudfront.net
```

Frontend khi build deploy production:

```env
VITE_API_URL=https://d1cbcva8jyj4q8.cloudfront.net/api
VITE_ASSET_BASE_URL=https://d1cbcva8jyj4q8.cloudfront.net
```

`frontend/.env` và `backend/.env` chỉ dùng local, không commit secrets lên GitHub. Chỉ commit các file `.env.example`.

## Chạy Frontend Local

Frontend local có thể gọi API trực tiếp từ EC2, còn ảnh vẫn đi qua CloudFront.

```powershell
cd frontend
npm install
npm run dev
```

Mở:

```text
http://localhost:5173
```

Nếu vừa sửa `.env`, cần tắt dev server rồi chạy lại `npm run dev`.

## Chạy Backend Local

Backend local chỉ chạy được nếu máy local kết nối được RDS qua port `3306`.

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

Nếu RDS private hoặc Security Group chỉ cho EC2 truy cập, backend local sẽ lỗi kết nối database. Khi đó nên chạy backend trên EC2.

## Build Kiểm Tra Local

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd backend
.\mvnw.cmd -DskipTests package
```

## Deploy Frontend Lên S3 Và CloudFront

Build frontend:

```powershell
cd frontend
npm run build
```

Upload thủ công lên S3:

```powershell
aws s3 sync dist s3://simple-ecommerce-phamducthanh
```

Clear cache CloudFront:

```powershell
aws cloudfront create-invalidation --distribution-id E3O2ME4OPGOUZ9 --paths "/*"
```

Không dùng `--delete` khi sync nếu bucket đang chứa thư mục ảnh upload như `images/`.

## Deploy Backend Trên EC2

Backend chạy bằng Docker trên EC2 tại port `8080`.

```bash
docker run -d \
  --name backend \
  -p 8080:8080 \
  -e DB_PASSWORD=your_rds_password \
  --restart unless-stopped \
  your-dockerhub-user/ecommerce-backend:latest
```

Kiểm tra API trực tiếp:

```powershell
curl http://52.65.5.156:8080/api/products
```

Kiểm tra API qua CloudFront:

```powershell
curl https://d1cbcva8jyj4q8.cloudfront.net/api/products
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
5. Build frontend bằng Vite với CloudFront URL.
6. Cấu hình AWS credentials.
7. Upload `frontend/dist` lên S3 bucket `simple-ecommerce-phamducthanh`.
8. Invalidate CloudFront distribution `E3O2ME4OPGOUZ9`.
9. Login Docker Hub.
10. Build và push Docker image backend/frontend.
11. SSH vào EC2 và chạy lại container backend/frontend.

GitHub Secrets cần cấu hình:

| Secret | Giá trị |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | Access key của IAM user dùng cho GitHub Actions |
| `AWS_SECRET_ACCESS_KEY` | Secret key của IAM user dùng cho GitHub Actions |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token |
| `EC2_HOST` | Elastic IP của EC2, hiện tại `52.65.5.156` |
| `EC2_SSH_KEY` | Nội dung private key `.pem` để SSH vào EC2 |
| `DB_PASSWORD` | Mật khẩu RDS |

IAM user cho GitHub Actions cần quyền upload S3 và invalidate CloudFront. Với demo có thể dùng `AmazonS3FullAccess` và `CloudFrontFullAccess`; khi làm production nên giới hạn quyền theo bucket và distribution cụ thể.

Push để chạy pipeline:

```bash
git add .
git commit -m "docs: update readme for cloudfront deployment"
git push origin main
```

## Cấu Hình AWS Quan Trọng

- CloudFront distribution ID: `E3O2ME4OPGOUZ9`.
- CloudFront domain: `d1cbcva8jyj4q8.cloudfront.net`.
- S3 bucket: `simple-ecommerce-phamducthanh`.
- EC2 Elastic IP: `52.65.5.156`.
- S3 bucket nên bật `Block all public access = ON`.
- CloudFront nên dùng Origin Access Control (OAC), không dùng OAI cũ.
- Default root object của CloudFront: `index.html`.
- Custom error response cho React Router:
  - `403` -> `/index.html` -> `200`
  - `404` -> `/index.html` -> `200`
- Behavior `/api/*` trỏ về EC2 origin port `8080`, cache policy `CachingDisabled`.
- Default behavior `/*` trỏ về S3 origin, cache policy `CachingOptimized`.

## Lỗi Thường Gặp

### CloudFront trả AccessDenied

Kiểm tra S3 bucket đã có file sau chưa:

```text
index.html
assets/
```

Nếu chưa có, cần chạy lại GitHub Actions hoặc sync thủ công `frontend/dist` lên S3.

### Ảnh S3 không hiện khi chạy localhost

Bucket đang private nên không mở trực tiếp URL S3 được. Frontend dùng `VITE_ASSET_BASE_URL` để đổi URL ảnh S3 sang CloudFront trước khi hiển thị.

### API Network Error

Kiểm tra:

- EC2 đang running.
- Backend container đang chạy.
- Security Group EC2 đã mở port `8080`.
- CloudFront behavior `/api/*` đã trỏ đúng origin EC2.

### VS Code báo context access might be invalid

Nếu VS Code cảnh báo:

```text
Context access might be invalid: AWS_ACCESS_KEY_ID
Context access might be invalid: AWS_SECRET_ACCESS_KEY
```

Đây thường chỉ là cảnh báo editor. Chỉ cần đảm bảo GitHub repo đã có đúng secrets trong `Settings -> Secrets and variables -> Actions`.
