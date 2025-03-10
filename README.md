# API Documentation

## Tổng quan

Đây là backend của ứng dụng Social Media được xây dựng bằng NestJS, cung cấp các API để quản lý người dùng, xác thực với JWT (JSON Web Token), và các chức năng cơ bản của mạng xã hội.

## API Endpoints

### Authentication

1. **Đăng nhập**

   ```
   POST api/auth/login
   Content-Type: application/json
   Body: {
     "username": "string",
     "password": "string"
   }
   ```

2. **Đăng ký**

   ```
   POST api/auth/register
   Content-Type: application/json
   Body: {
     "username": "string",
     "password": "string",
     "email": "string"
   }
   ```

3. **Làm mới token**

   ```
   POST api/auth/refresh
   Content-Type: application/json
   Body: {
     "refresh_token": "string"
   }
   ```

4. **Đăng xuất**

   ```
   POST api/auth/logout
   Content-Type: application/json
   Body: {
     "refresh_token": "string"
   }
   ```

5. **Quên mật khẩu**

   ```
   POST api/auth/forgot-password
   Content-Type: application/json
   Body: {
     "email": "string"
   }
   ```

6. **Đặt lại mật khẩu**
   ```
   POST api/auth/reset-password
   Content-Type: application/json
   Body: {
     "token": "string",
     "newPassword": "string"
   }
   ```

### Account

1. **Lấy thông tin tài khoản theo ID**

   ```
   GET api/account/:id
   Authorization: Bearer <token>
   ```

2. **Lấy thông tin tài khoản theo username**

   ```
   GET api/account/username/:username
   Authorization: Bearer <token>
   ```

3. **Cập nhật mật khẩu tài khoản**

   ```
   PATCH api/account/:id/password
   Authorization: Bearer <token>
   Content-Type: application/json
   Body: {
     "currentPassword": "string",
     "newPassword": "string"
   }
   ```

4. **Xóa tài khoản**
   ```
   DELETE api/account/:id
   Authorization: Bearer <token>
   ```

### Profile

1. **Lấy thông tin profile của người dùng hiện tại**

   ```
   GET api/profile/me
   Authorization: Bearer <token>
   ```

2. **Cập nhật profile của người dùng hiện tại**

   ```
   PATCH api/profile/me
   Authorization: Bearer <token>
   Content-Type: application/json
   Body: {
     "name": "string",
     "phone": "string",
     "bio": "string",
     "avatar": "string",
     "birthday": "string"
   }
   ```

3. **Lấy thông tin profile theo ID**
   ```
   GET api/profile/:id
   Authorization: Bearer <token>
   ```

## Cài đặt và Chạy

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Sửa file `.env.sample` thành `.env` và điền các thông tin cần thiết:

   ```
   DATABASE_URL=
   JWT_ACCESS_SECRET=
   JWT_ACCESS_EXPIRES_IN=
   JWT_REFRESH_EXPIRES_IN=
   JWT_REFRESH_SECRET=
   REDIS_URL=
   RESEND_API_KEY=
   ```

3. Chạy ứng dụng:
   ```bash
   npm run start:dev
   ```
