# Cardify Rewards — Hệ thống Quản lý Khách hàng Thân thiết (Loyalty Portal)

**Cardify Rewards** là hệ thống quản lý điểm thưởng và chăm sóc khách hàng thân thiết toàn diện, hỗ trợ doanh nghiệp vận hành các chương trình tích điểm, phân hạng thành viên, phát hành/gạch nợ E-Voucher và kiểm soát quy trình điều chỉnh điểm chặt chẽ theo phân quyền.

## Mục lục

1. [Tính năng chính](#-tính-năng-chính)

2. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)

3. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

4. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)

5. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)

6. [Khởi tạo tài khoản & Phân quyền mẫu](#-khởi-tạo-tài-khoản--phân-quyền-mẫu)

7. [Xử lý sự cố thường gặp (Troubleshooting)](#-xử-lý-sự-cố-thường-gặp-troubleshooting)

##  Tính năng chính

* **Xác thực & Phân quyền (RBAC):** Đăng nhập bảo mật với JWT, phân tách rõ ràng 3 vai trò (`Admin`, `Staff`, `Customer`).

* **Quản lý Hạng thành viên:** Thiết lập và cập nhật các mức hạng thẻ, quyền lợi tương ứng cho khách hàng.

* **Quản lý E-Voucher:** Phát hành ưu đãi, kiểm tra điều kiện và thực hiện gạch nợ E-Voucher tại quầy/hệ thống.

* **Quy trình Điều chỉnh điểm (Maker - Checker):**

  * **Nhân viên (Staff):** Lập phiếu yêu cầu cộng/trừ điểm thủ công cho khách hàng kèm lý do.

  * **Quản trị viên (Admin):** Kiểm duyệt (Phê duyệt / Từ chối) các phiếu điều chỉnh điểm.

* **Nhật ký hệ thống (Audit Log):** Theo dõi, truy vết lịch sử thao tác quan trọng của nhân viên và quản trị viên.

## Công nghệ sử dụng

| Thành phần | Công nghệ | Cổng mặc định | 
| ----- | ----- | ----- | 
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS | `3001` | 
| **Backend** | NestJS, TypeScript, JWT, Bcrypt, Swagger OpenAPI | `3000` | 
| **Database** | MySQL 8.0 (chạy qua Docker) | `3307` | 

## Cấu trúc thư mục

```
loyalty-portal/
├── backend/                # Mã nguồn API Server (NestJS)
│   ├── src/                # Modules, Controllers, Services, Entities
│   ├── .env                # Cấu hình biến môi trường Backend
│   └── package.json
├── frontend/               # Mã nguồn giao diện Web Portal (Next.js)
│   ├── src/                # Pages / App Router, Components, Services
│   ├── .env.local          # Cấu hình URL kết nối API
│   └── package.json
├── docker-compose.yml      # Cấu hình container MySQL
└── README.md               # Tài liệu hướng dẫn dự án

```

## Yêu cầu hệ thống

Trước khi cài đặt, hãy đảm bảo máy tính của bạn đã có sẵn:

* **Node.js** (khuyến nghị phiên bản `v18.x` hoặc `v20.x`) và `npm`

* **Docker Desktop** (đã bật *WSL 2* và *Virtual Machine Platform* nếu sử dụng Windows)

* **MySQL Workbench** hoặc **DBeaver** (tùy chọn, dùng để quản trị cơ sở dữ liệu trực quan)

## Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Khởi động Cơ sở dữ liệu (MySQL qua Docker)

1. Mở **Docker Desktop** và chờ đến khi trạng thái chuyển sang *Engine running*.

2. Mở Terminal tại thư mục gốc `loyalty-portal/` và chạy lệnh:

   ```
   docker-compose up -d
   
   ```

3. Đảm bảo container MySQL đã khởi động thành công và ánh xạ ra cổng **`3307`** trên máy thật (`127.0.0.1:3307`, database: `loyalty_db`).

### Bước 2: Cài đặt và chạy Backend (NestJS)

1. Di chuyển vào thư mục `backend` và cài đặt thư viện:

   ```
   cd backend
   npm install
   
   ```

2. Kiểm tra hoặc tạo file `.env` trong thư mục `backend/` với các thông số kết nối khớp với Docker MySQL:

   ```
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_USERNAME=loyalty_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=loyalty_db
   JWT_SECRET=your_jwt_secret_key
   
   ```

3. Khởi động server ở chế độ phát triển:

   ```
   npm run start:dev
   
   ```

4. Khi terminal hiển thị `Nest application successfully started`, bạn có thể truy cập tài liệu API tại:
   👉 **Swagger UI:** `http://localhost:3000/api`

### Bước 3: Cài đặt và chạy Frontend (Next.js)

1. Mở một cửa sổ Terminal mới, di chuyển vào thư mục `frontend` và cài đặt thư viện:

   ```
   cd frontend
   npm install
   
   ```

2. Kiểm tra hoặc tạo file `.env.local` trong thư mục `frontend/`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   
   ```

3. Khởi chạy ứng dụng web ở cổng `3001`:

   ```
   npm run dev -- -p 3001
   
   ```

4. Truy cập giao diện đăng nhập hệ thống tại: **Web Portal:** `http://localhost:3001/auth/login`

## Khởi tạo tài khoản & Phân quyền mẫu

Hệ thống mã hóa mật khẩu bằng thuật toán **Bcrypt** và phân quyền dựa trên bảng `VaiTro`:

* `1` — **Admin** (Quản trị viên toàn quyền)

* `2` — **Staff** (Nhân viên vận hành & CSKH)

* `3` — **Customer** (Khách hàng thành viên)

### Cách tạo tài khoản Admin / Staff chuẩn xác:

1. **Đăng ký qua Swagger để Backend tự động mã hóa mật khẩu:**

   * Truy cập `http://localhost:3000/api`, mở nhóm **Authentication** $\rightarrow$ **`POST /auth/register`**.

   * Nhấn **Try it out**, nhập thông tin đăng ký (email & số điện thoại chưa tồn tại) rồi nhấn **Execute** (trả về mã `201`):

     ```
     {
       "hoTen": "Quản trị viên",
       "email": "admin.test@cardify.vn",
       "soDienThoai": "0988777666",
       "matKhau": "123456"
     }
     
     ```

2. **Nâng quyền tài khoản trong MySQL:**

   * Mở **MySQL Workbench** kết nối tới `127.0.0.1:3307`, kiểm tra bảng `TaiKhoan` và cập nhật cột `maVaiTro`:

     ```
     USE loyalty_db;
     
     -- Xem danh sách tài khoản vừa tạo để lấy maTK hoặc tenDangNhap
     SELECT * FROM TaiKhoan;
     
     -- Cấp quyền Admin (maVaiTro = 1) hoặc Staff (maVaiTro = 2)
     UPDATE TaiKhoan 
     SET maVaiTro = 1 
     WHERE tenDangNhap = 'admin.test@cardify.vn';
     
     ```

3. **Đăng nhập:** Quay lại `http://localhost:3001/auth/login` và đăng nhập với tài khoản vừa tạo.

## 🔧 Xử lý sự cố thường gặp (Troubleshooting)

* **Lỗi `net::ERR_CONNECTION_REFUSED` khi đăng nhập:**

  * Kiểm tra xem terminal của `backend` đã chạy lệnh `npm run start:dev` chưa.

  * Đảm bảo biến `NEXT_PUBLIC_API_URL` ở Frontend trỏ đúng về `http://localhost:3000`.

* **Đăng ký thành công trên Swagger (`201`) nhưng không thấy dữ liệu trong MySQL Workbench (`3307`):**

  * Kiểm tra lại file `backend/.env` xem `DB_PORT` đã được đặt thành `3307` chưa (tránh để mặc định `3306` khiến Backend ghi nhầm vào MySQL cục bộ trên máy).

* **Báo lỗi *"Email hoặc mật khẩu không chính xác"* dù đã `INSERT` trực tiếp vào SQL:**

  * Không chèn mật khẩu dạng chữ thường (`123456`) trực tiếp vào bảng `TaiKhoan`. Hãy tạo qua API `/auth/register` hoặc sinh chuỗi hash Bcrypt trước khi lưu vào cột `matKhau`.

* **Docker không khởi động được trên Windows:**

  * Bật tính năng **Virtual Machine Platform** và **Windows Subsystem for Linux** trong *Turn Windows features on or off*, sau đó khởi động lại máy.