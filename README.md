# Orange Sea API

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer<br/>Nhập token JWT của bạn

- HTTP Authentication, scheme: bearer<br/>Nhập token JWT của bạn

# Auth

<a id="opIdAuthController_register"></a>

## POST Đăng ký tài khoản mới

POST /api/auth/register

> Body Parameters

```json
{
  "username": "Tracy94",
  "email": "Viola_Crist@gmail.com",
  "password": "Abc1!Z46q]",
  "role": "USER"
}
```

### Params

| Name | Location | Type                              | Required | Description |
| ---- | -------- | --------------------------------- | -------- | ----------- |
| body | body     | [RegisterDTO](#schemaregisterdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "email": "Annalise9@gmail.com",
    "isPending": true,
    "key": "57958204-0f4a-4c53-889c-802f4dfbc819"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description        | Data schema                                                             |
| ---------------- | ---------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Đăng ký thành công | [Success_Auth_Register_Schema](#schemasuccess_auth_register_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Đăng ký thất bại   | [Error_400_Auth_Register_Schema](#schemaerror_400_auth_register_schema) |

<a id="opIdAuthController_resendOTP"></a>

## POST Gửi lại OTP sau 2 phút

POST /api/auth/resend-otp

> Body Parameters

```json
{
  "email": "Shyann78@yahoo.com"
}
```

### Params

| Name | Location | Type                                | Required | Description |
| ---- | -------- | ----------------------------------- | -------- | ----------- |
| body | body     | [ResendOtpDTO](#schemaresendotpdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "email": "Shyann78@yahoo.com"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                    | Data schema                                                                 |
| ---------------- | ---------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | OTP mới đã được gửi thành công | [Success_Auth_Resend_Otp_Schema](#schemasuccess_auth_resend_otp_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Gửi OTP thất bại               | [Error_400_Auth_Resend_Otp_Schema](#schemaerror_400_auth_resend_otp_schema) |

<a id="opIdAuthController_checkRegister"></a>

## POST Kiểm tra tình trạng đăng ký

POST /api/auth/is-register

> Body Parameters

```json
{
  "key": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "email": "Elmore.Block@hotmail.com"
}
```

### Params

| Name | Location | Type                                  | Required | Description |
| ---- | -------- | ------------------------------------- | -------- | ----------- |
| body | body     | [CheckRegister](#schemacheckregister) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                            | Data schema                                                                   |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Kiểm tra tình trạng đăng ký thành công | [Success_Auth_Is_Register_Schema](#schemasuccess_auth_is_register_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Kiểm tra tình trạng đăng ký thất bại   | [Error_400_Auth_Is_Register_Schema](#schemaerror_400_auth_is_register_schema) |

<a id="opIdAuthController_verifyOTP"></a>

## POST Xác thực OTP và hoàn tất đăng ký

POST /api/auth/verify-otp

> Body Parameters

```json
{
  "email": "Emilie43@yahoo.com",
  "otp": "1e104c31-4c5e-4606-9270-d0bf28a6d7dd"
}
```

### Params

| Name | Location | Type                                                | Required | Description |
| ---- | -------- | --------------------------------------------------- | -------- | ----------- |
| body | body     | [RegisterOtpVerifyDTO](#schemaregisterotpverifydto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "accountId": "e7befab8a8fcc8cf0faacdb3",
    "username": "Jerad93",
    "email": "Freeda26@gmail.com",
    "profileId": "7578affcaa3660e4aecaa362"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description             | Data schema                                                                 |
| ---------------- | ---------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Xác thực OTP thành công | [Success_Auth_Verify_Otp_Schema](#schemasuccess_auth_verify_otp_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xác thực OTP thất bại   | [Error_400_Auth_Verify_Otp_Schema](#schemaerror_400_auth_verify_otp_schema) |

<a id="opIdAuthController_login"></a>

## POST Đăng nhập với username và mật khẩu

POST /api/auth/login

> Body Parameters

```json
{
  "username": "Aryanna_Emmerich",
  "password": "Abc1!BA>mf"
}
```

### Params

| Name | Location | Type                        | Required | Description |
| ---- | -------- | --------------------------- | -------- | ----------- |
| body | body     | [LoginDTO](#schemalogindto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema                                                       |
| ---------------- | ---------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Đăng nhập thành công | [Success_Auth_Login_Schema](#schemasuccess_auth_login_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Đăng nhập thất bại   | [Error_400_Auth_Login_Schema](#schemaerror_400_auth_login_schema) |

<a id="opIdAuthController_refresh"></a>

## POST Làm mới access token bằng refresh token

POST /api/auth/refresh

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                        | Data schema                                                           |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Làm mới access token thành công    | [Success_Auth_Refresh_Schema](#schemasuccess_auth_refresh_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Làm mới access token thất bại      | [Error_400_Auth_Refresh_Schema](#schemaerror_400_auth_refresh_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Token không hợp lệ hoặc đã hết hạn | [Error_401_Auth_Refresh_Schema](#schemaerror_401_auth_refresh_schema) |

<a id="opIdAuthController_logout"></a>

## POST Đăng xuất và thu hồi token

POST /api/auth/logout

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                        | Data schema                                                         |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Đăng xuất thành công               | [Success_Auth_Logout_Schema](#schemasuccess_auth_logout_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Đăng xuất thất bại                 | [Error_400_Auth_Logout_Schema](#schemaerror_400_auth_logout_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Token không hợp lệ hoặc đã hết hạn | [Error_401_Auth_Logout_Schema](#schemaerror_401_auth_logout_schema) |

<a id="opIdAuthController_forgotPassword"></a>

## POST Quên mật khẩu

POST /api/auth/forgot-password

> Body Parameters

```json
{
  "email": "Bell.Runolfsson@gmail.com"
}
```

### Params

| Name | Location | Type                                          | Required | Description |
| ---- | -------- | --------------------------------------------- | -------- | ----------- |
| body | body     | [ForgotPasswordDTO](#schemaforgotpassworddto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description               | Data schema                                                                           |
| ---------------- | ---------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Email đã được gửi đến bạn | [Success_Auth_Forgot_Password_Schema](#schemasuccess_auth_forgot_password_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Quên mật khẩu thất bại    | [Error_400_Auth_Forgot_Password_Schema](#schemaerror_400_auth_forgot_password_schema) |

<a id="opIdAuthController_resetPassword"></a>

## POST Đặt lại mật khẩu

POST /api/auth/reset-password

> Body Parameters

```json
{
  "newPassword": "Abc1!uL/Tb"
}
```

### Params

| Name | Location | Type                                        | Required | Description |
| ---- | -------- | ------------------------------------------- | -------- | ----------- |
| body | body     | [ResetPasswordDTO](#schemaresetpassworddto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "profileId": "a8ac4a50e79eb911baca20b8"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description               | Data schema                                                                         |
| ---------------- | ---------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Mật khẩu đã được đặt lại  | [Success_Auth_Reset_Password_Schema](#schemasuccess_auth_reset_password_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Đặt lại mật khẩu thất bại | [Error_400_Auth_Reset_Password_Schema](#schemaerror_400_auth_reset_password_schema) |

# Profile

<a id="opIdProfileController_getMyProfile"></a>

## GET Lấy thông tin profile của người dùng hiện tại

GET /api/profile/me

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                      | Data schema                                                                               |
| ---------------- | ---------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Lấy thông tin profile thành công | [Success_Profile_Get_My_Profile_Schema](#schemasuccess_profile_get_my_profile_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy thông tin profile thất bại   | [Error_400_Profile_Get_My_Profile_Schema](#schemaerror_400_profile_get_my_profile_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập          | [Error_401_Profile_Get_My_Profile_Schema](#schemaerror_401_profile_get_my_profile_schema) |

<a id="opIdProfileController_updateMyProfile"></a>

## PUT Cập nhật profile của người dùng hiện tại

PUT /api/profile/me

> Body Parameters

```yaml
name: ''
phone: '0912345678'
bio: ''
gender: ''
avatar: ''
birthday: ''
```

### Params

| Name       | Location | Type           | Required | Description                |
| ---------- | -------- | -------------- | -------- | -------------------------- |
| body       | body     | object         | no       | none                       |
| » name     | body     | string         | no       | Tên đầy đủ                 |
| » phone    | body     | string         | no       | Số điện thoại              |
| » bio      | body     | string         | no       | Tiểu sử                    |
| » gender   | body     | string         | no       | Giới tính                  |
| » avatar   | body     | string(binary) | no       | Ảnh đại diện (file upload) |
| » birthday | body     | string         | no       | Ngày sinh (định dạng ISO)  |

#### Enum

| Name     | Value |
| -------- | ----- |
| » gender | M     |
| » gender | F     |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "profileId": "a8ac4a50e79eb911baca20b8"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                                     |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Cập nhật profile thành công | [Success_Profile_Update_My_Profile_Schema](#schemasuccess_profile_update_my_profile_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Cập nhật profile thất bại   | [Error_400_Profile_Update_My_Profile_Schema](#schemaerror_400_profile_update_my_profile_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_Profile_Update_My_Profile_Schema](#schemaerror_401_profile_update_my_profile_schema) |

<a id="opIdProfileController_getProfileById"></a>

## GET Lấy thông tin profile theo ID

GET /api/profile/{id}

### Params

| Name | Location | Type   | Required | Description |
| ---- | -------- | ------ | -------- | ----------- |
| id   | path     | string | yes      | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                      | Data schema                                                                                     |
| ---------------- | ---------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Lấy thông tin profile thành công | [Success_Profile_Get_Profile_By_ID_Schema](#schemasuccess_profile_get_profile_by_id_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy thông tin profile thất bại   | [Error_400_Profile_Get_Profile_By_ID_Schema](#schemaerror_400_profile_get_profile_by_id_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập          | [Error_401_Profile_Get_Profile_By_ID_Schema](#schemaerror_401_profile_get_profile_by_id_schema) |

<a id="opIdProfileController_findProfileByUsername"></a>

## GET Tìm kiếm profile theo username

GET /api/profile/username/{username}

### Params

| Name     | Location | Type   | Required | Description |
| -------- | -------- | ------ | -------- | ----------- |
| username | path     | string | yes      | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                                                   |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Tìm kiếm profile thành công | [Success_Profile_Find_Profile_By_Username_Schema](#schemasuccess_profile_find_profile_by_username_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Tìm kiếm profile thất bại   | [Error_400_Profile_Find_Profile_By_Username_Schema](#schemaerror_400_profile_find_profile_by_username_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_Profile_Find_Profile_By_Username_Schema](#schemaerror_401_profile_find_profile_by_username_schema) |

# Chat

<a id="opIdChatController_sendMessage"></a>

## POST Gửi tin nhắn đến nhóm chat

POST /api/chat/send

> Body Parameters

```yaml
groupId: da155133ee5f23240d4944f3
message: Mollitia vado ait utrimque sum tristis nulla templum.
type: TEXT
file: file_content
```

### Params

| Name      | Location | Type           | Required | Description                               |
| --------- | -------- | -------------- | -------- | ----------------------------------------- |
| body      | body     | object         | no       | none                                      |
| » groupId | body     | string         | yes      | ID của nhóm chat                          |
| » message | body     | string         | no       | Nội dung tin nhắn                         |
| » type    | body     | string         | no       | Loại tin nhắn                             |
| » file    | body     | string(binary) | no       | File đính kèm (hình ảnh, video hoặc file) |

#### Enum

| Name   | Value |
| ------ | ----- |
| » type | TEXT  |
| » type | IMAGE |
| » type | VIDEO |
| » type | RAW   |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description             | Data schema                                                                           |
| ---------------- | ---------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Gửi tin nhắn thành công | [Success_Message_Send_Message_Schema](#schemasuccess_message_send_message_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Gửi tin nhắn thất bại   | [Error_400_Message_Send_Message_Schema](#schemaerror_400_message_send_message_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập | [Error_401_Message_Send_Message_Schema](#schemaerror_401_message_send_message_schema) |

<a id="opIdChatController_recallMessage"></a>

## PUT Thu hồi tin nhắn

PUT /api/chat/recall/{messageId}

### Params

| Name      | Location | Type   | Required | Description                 |
| --------- | -------- | ------ | -------- | --------------------------- |
| messageId | path     | string | yes      | ID của tin nhắn cần thu hồi |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Thu hồi tin nhắn thành công | [Success_MessageId_Recall_Message_Schema](#schemasuccess_messageid_recall_message_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Thu hồi tin nhắn thất bại   | [Error_400_MessageId_Recall_Message_Schema](#schemaerror_400_messageid_recall_message_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_MessageId_Recall_Message_Schema](#schemaerror_401_messageid_recall_message_schema) |

<a id="opIdChatController_deleteMessage"></a>

## DELETE Xóa tin nhắn

DELETE /api/chat/delete/{messageId}

### Params

| Name      | Location | Type   | Required | Description             |
| --------- | -------- | ------ | -------- | ----------------------- |
| messageId | path     | string | yes      | ID của tin nhắn cần xóa |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description             | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Xóa tin nhắn thành công | [Success_MessageId_Delete_Message_Schema](#schemasuccess_messageid_delete_message_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xóa tin nhắn thất bại   | [Error_400_MessageId_Delete_Message_Schema](#schemaerror_400_messageid_delete_message_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập | [Error_401_MessageId_Delete_Message_Schema](#schemaerror_401_messageid_delete_message_schema) |

<a id="opIdChatController_forwardMessage"></a>

## POST Chuyển tiếp tin nhắn

POST /api/chat/forward

> Body Parameters

```json
{
  "messageId": "4b74d769fdfef24ca6ffca7d",
  "groupId": "d20afe5ebafccd8120ed3f83"
}
```

### Params

| Name | Location | Type                                          | Required | Description |
| ---- | -------- | --------------------------------------------- | -------- | ----------- |
| body | body     | [ForwardMessageDto](#schemaforwardmessagedto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                     | Data schema                                                                                     |
| ---------------- | ---------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Chuyển tiếp tin nhắn thành công | [Success_MessageId_Forward_Message_Schema](#schemasuccess_messageid_forward_message_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Chuyển tiếp tin nhắn thất bại   | [Error_400_MessageId_Forward_Message_Schema](#schemaerror_400_messageid_forward_message_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập         | [Error_401_MessageId_Forward_Message_Schema](#schemaerror_401_messageid_forward_message_schema) |

<a id="opIdChatController_getMessages"></a>

## GET Lấy tin nhắn theo trang của nhóm chat

GET /api/chat/messages/{groupId}

### Params

| Name    | Location | Type   | Required | Description      |
| ------- | -------- | ------ | -------- | ---------------- |
| groupId | path     | string | yes      | ID của nhóm chat |
| cursor  | query    | string | yes      | none             |

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "messages": [{}],
    "nextCursor": "string",
    "hasMore": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                      | Data schema |
| ---------------- | ---------------------------------------------------------------- | -------------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Danh sách tin nhắn của nhóm chat | Inline      |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Dữ liệu không hợp lệ             | None        |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập          | None        |

### Responses Data Schema

HTTP Status Code **200**

| Name          | Type        | Required | Restrictions | Title | description |
| ------------- | ----------- | -------- | ------------ | ----- | ----------- |
| » status      | string      | false    | none         |       | none        |
| » statusCode  | number      | false    | none         |       | none        |
| » data        | object      | false    | none         |       | none        |
| »» messages   | [object]    | false    | none         |       | none        |
| »» nextCursor | string¦null | false    | none         |       | none        |
| »» hasMore    | boolean     | false    | none         |       | none        |

<a id="opIdChatController_editMessage"></a>

## PUT Chỉnh sửa tin nhắn

PUT /api/chat/edit/{messageId}

> Body Parameters

```json
{
  "newContent": "Nội dung tin nhắn đã chỉnh sửa"
}
```

### Params

| Name      | Location | Type                                    | Required | Description                   |
| --------- | -------- | --------------------------------------- | -------- | ----------------------------- |
| messageId | path     | string                                  | yes      | ID của tin nhắn cần chỉnh sửa |
| body      | body     | [EditMessageDto](#schemaeditmessagedto) | no       | none                          |

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {},
  "message": "Tin nhắn không tồn tại"
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                                             | Data schema                             |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Tin nhắn đã được chỉnh sửa thành công                   | [ApiResponseDto](#schemaapiresponsedto) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Tin nhắn không tồn tại hoặc không phải tin nhắn văn bản | None                                    |
| 403              | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)   | Người dùng không có quyền chỉnh sửa tin nhắn này        | None                                    |

<a id="opIdChatController_getGroupMedia"></a>

## GET Lấy danh sách media (hình ảnh, video, file) của nhóm chat

GET /api/chat/media/{groupId}

> Body Parameters

```json
{
  "type": "IMAGE",
  "limit": 10,
  "cursor": "146ac4dab0fc39dd7bf06ccf"
}
```

### Params

| Name    | Location | Type                              | Required | Description      |
| ------- | -------- | --------------------------------- | -------- | ---------------- |
| groupId | path     | string                            | yes      | ID của nhóm chat |
| body    | body     | [GetMediaDto](#schemagetmediadto) | no       | none             |

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "media": [{}],
    "nextCursor": "string",
    "hasMore": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                   | Data schema |
| ---------------- | ---------------------------------------------------------------- | ----------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Danh sách media của nhóm chat | Inline      |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Dữ liệu không hợp lệ          | None        |
| 403              | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)   | Không có quyền truy cập       | None        |

### Responses Data Schema

HTTP Status Code **200**

| Name          | Type        | Required | Restrictions | Title | description |
| ------------- | ----------- | -------- | ------------ | ----- | ----------- |
| » status      | string      | false    | none         |       | none        |
| » statusCode  | number      | false    | none         |       | none        |
| » data        | object      | false    | none         |       | none        |
| »» media      | [object]    | false    | none         |       | none        |
| »» nextCursor | string¦null | false    | none         |       | none        |
| »» hasMore    | boolean     | false    | none         |       | none        |

# Account

<a id="opIdAccountController_updatePassword"></a>

## PUT Cập nhật mật khẩu tài khoản

PUT /api/account/{id}/password

> Body Parameters

```json
{
  "currentPassword": "Abc1!l<sHv",
  "newPassword": "Abc1!$o8p["
}
```

### Params

| Name | Location | Type                                          | Required | Description |
| ---- | -------- | --------------------------------------------- | -------- | ----------- |
| id   | path     | string                                        | yes      | none        |
| body | body     | [UpdatePasswordDTO](#schemaupdatepassworddto) | no       | none        |

### Responses

| HTTP Status Code | Meaning                                                 | Description                  | Data schema |
| ---------------- | ------------------------------------------------------- | ---------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Cập nhật mật khẩu thành công | None        |

<a id="opIdAccountController_getAccountById"></a>

## GET Lấy thông tin tài khoản theo ID

GET /api/account/{id}

### Params

| Name | Location | Type   | Required | Description |
| ---- | -------- | ------ | -------- | ----------- |
| id   | path     | string | yes      | none        |

### Responses

| HTTP Status Code | Meaning                                                        | Description                        | Data schema |
| ---------------- | -------------------------------------------------------------- | ---------------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Lấy thông tin tài khoản thành công | None        |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Không tìm thấy tài khoản           | None        |

<a id="opIdAccountController_getAccountByUsername"></a>

## GET Lấy thông tin tài khoản theo username

GET /api/account/username/{username}

### Params

| Name     | Location | Type   | Required | Description |
| -------- | -------- | ------ | -------- | ----------- |
| username | path     | string | yes      | none        |

### Responses

| HTTP Status Code | Meaning                                                        | Description                        | Data schema |
| ---------------- | -------------------------------------------------------------- | ---------------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Lấy thông tin tài khoản thành công | None        |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Không tìm thấy tài khoản           | None        |

# Friend

<a id="opIdFriendshipController_sendFriendRequest"></a>

## POST Gửi yêu cầu kết bạn

POST /api/friend

> Body Parameters

```json
{
  "receiverId": "b1cc74df4f22c9f0d870e002"
}
```

### Params

| Name | Location | Type                                              | Required | Description |
| ---- | -------- | ------------------------------------------------- | -------- | ----------- |
| body | body     | [CreateFriendshipDTO](#schemacreatefriendshipdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "friendshipId": "ba39e4a19738f4c3a5ff8781"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                    | Data schema                                                                                       |
| ---------------- | ---------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Gửi yêu cầu kết bạn thành công | [Success_Friend_Send_Friend_Request_Schema](#schemasuccess_friend_send_friend_request_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Tìm kiếm profile thất bại      | [Error_400_Friend_Send_Friend_Request_Schema](#schemaerror_400_friend_send_friend_request_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập        | [Error_401_Friend_Send_Friend_Request_Schema](#schemaerror_401_friend_send_friend_request_schema) |

<a id="opIdFriendshipController_getFriends"></a>

## GET Lấy danh sách bạn bè

GET /api/friend

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                     | Data schema                                                                       |
| ---------------- | ---------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Lấy danh sách bạn bè thành công | [Success_Friend_Get_Friends_Schema](#schemasuccess_friend_get_friends_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy danh sách bạn bè thất bại   | [Error_400_Friend_Get_Friends_Schema](#schemaerror_400_friend_get_friends_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập         | [Error_401_Friend_Get_Friends_Schema](#schemaerror_401_friend_get_friends_schema) |

<a id="opIdFriendshipController_getReceivedRequests"></a>

## GET Lấy danh sách yêu cầu kết bạn đã nhận

GET /api/friend/requests/received

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                                      | Data schema                                                                                           |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Lấy danh sách yêu cầu kết bạn đã nhận thành công | [Success_Friend_Get_Received_Requests_Schema](#schemasuccess_friend_get_received_requests_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy danh sách yêu cầu kết bạn đã nhận thất bại   | [Error_400_Friend_Get_Received_Requests_Schema](#schemaerror_400_friend_get_received_requests_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập                          | [Error_401_Friend_Get_Received_Requests_Schema](#schemaerror_401_friend_get_received_requests_schema) |

<a id="opIdFriendshipController_getSentRequests"></a>

## GET Lấy danh sách yêu cầu kết bạn đã gửi

GET /api/friend/requests/sent

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                                     | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Lấy danh sách yêu cầu kết bạn đã gửi thành công | [Success_Friend_Get_Sent_Requests_Schema](#schemasuccess_friend_get_sent_requests_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy danh sách yêu cầu kết bạn đã gửi thất bại   | [Error_400_Friend_Get_Sent_Requests_Schema](#schemaerror_400_friend_get_sent_requests_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập                         | [Error_401_Friend_Get_Sent_Requests_Schema](#schemaerror_401_friend_get_sent_requests_schema) |

<a id="opIdFriendshipController_handleFriendRequest"></a>

## PUT Xử lý yêu cầu kết bạn

PUT /api/friend/requests/{id}

> Body Parameters

```json
{
  "action": "ACCEPT"
}
```

### Params

| Name | Location | Type                                                    | Required | Description |
| ---- | -------- | ------------------------------------------------------- | -------- | ----------- |
| id   | path     | string                                                  | yes      | none        |
| body | body     | [HandleFriendRequestDTO](#schemahandlefriendrequestdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "friendshipId": "ba39e4a19738f4c3a5ff8781"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                      | Data schema                                                                                           |
| ---------------- | ---------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Xử lý yêu cầu kết bạn thành công | [Success_Friend_Handle_Friend_Request_Schema](#schemasuccess_friend_handle_friend_request_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xử lý yêu cầu kết bạn thất bại   | [Error_400_Friend_Handle_Friend_Request_Schema](#schemaerror_400_friend_handle_friend_request_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập          | [Error_401_Friend_Handle_Friend_Request_Schema](#schemaerror_401_friend_handle_friend_request_schema) |

<a id="opIdFriendshipController_deleteFriendship"></a>

## PUT Xóa mối quan hệ bạn bè

PUT /api/friend/delete/{id}

### Params

| Name | Location | Type   | Required | Description |
| ---- | -------- | ------ | -------- | ----------- |
| id   | path     | string | yes      | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                       | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Xóa mối quan hệ bạn bè thành công | [Success_Friend_Delete_Friendship_Schema](#schemasuccess_friend_delete_friendship_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xóa mối quan hệ bạn bè thất bại   | [Error_400_Friend_Delete_Friendship_Schema](#schemaerror_400_friend_delete_friendship_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập           | [Error_401_Friend_Delete_Friendship_Schema](#schemaerror_401_friend_delete_friendship_schema) |

<a id="opIdFriendshipController_searchUser"></a>

## GET Tìm kiếm người dùng

GET /api/friend/search/{keyword}

### Params

| Name    | Location | Type   | Required | Description |
| ------- | -------- | ------ | -------- | ----------- |
| keyword | path     | string | yes      | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "profile-id",
      "username": "user123",
      "name": "Nguyễn Văn A",
      "avatar": "https://example.com/avatar.jpg",
      "relation": "NONE"
    }
  ]
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                    | Data schema                                                                       |
| ---------------- | ---------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Tìm kiếm người dùng thành công | [Success_Friend_Search_User_Schema](#schemasuccess_friend_search_user_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Tìm kiếm người dùng thất bại   | [Error_400_Friend_Search_User_Schema](#schemaerror_400_friend_search_user_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập        | [Error_401_Friend_Search_User_Schema](#schemaerror_401_friend_search_user_schema) |

<a id="opIdFriendshipController_isFriend"></a>

## GET Kiểm tra mối quan hệ bạn bè

GET /api/friend/check/{profileId}

### Params

| Name      | Location | Type   | Required | Description |
| --------- | -------- | ------ | -------- | ----------- |
| profileId | path     | string | yes      | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "isFriend": true
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                            | Data schema                                                                                 |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Kiểm tra mối quan hệ bạn bè thành công | [Success_Friend_Check_Friendship_Schema](#schemasuccess_friend_check_friendship_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Kiểm tra mối quan hệ bạn bè thất bại   | [Error_400_Friend_Check_Friendship_Schema](#schemaerror_400_friend_check_friendship_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập                | [Error_401_Friend_Check_Friendship_Schema](#schemaerror_401_friend_check_friendship_schema) |

# Group

<a id="opIdGroupController_createGroup"></a>

## POST Tạo nhóm

POST /api/group

> Body Parameters

```json
{
  "name": "Nhóm học tập",
  "participantIds": ["61a70eb005ffedbb86da6fc7", "fa517bc5cfcbc72e2fd6addd"],
  "isGroup": true
}
```

### Params

| Name | Location | Type                                    | Required | Description |
| ---- | -------- | --------------------------------------- | -------- | ----------- |
| body | body     | [CreateGroupDTO](#schemacreategroupdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                       |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Nhóm đã được tạo thành công | [Success_Group_Create_Group_Schema](#schemasuccess_group_create_group_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Dữ liệu không hợp lệ        | [Error_400_Group_Create_Group_Schema](#schemaerror_400_group_create_group_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_Group_Create_Group_Schema](#schemaerror_401_group_create_group_schema) |

<a id="opIdGroupController_getGroups"></a>

## GET Lấy danh sách nhóm của người dùng hiện tại

GET /api/group

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "ce5cedd3c19185d96fa67750",
      "name": "petty furlough drat",
      "ownerId": "7e032a41eff088ed7ee55d33",
      "isGroup": true,
      "createdAt": "2024-06-16T08:57:04.657Z",
      "updatedAt": "2025-05-11T21:59:18.153Z",
      "participants": [
        {
          "id": "de28d19bea9e38f7effc8e92",
          "profileId": "e6f35ba74ad9f03f7b69ab68",
          "role": "OWNER",
          "name": "Franklin Schuster",
          "avatar": "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/25.jpg"
        }
      ],
      "lastMessage": {
        "id": "[",
        "content": "[",
        "senderId": "[",
        "fileUrl": "[",
        "createdAt": "[",
        "updatedAt": "[",
        "isRecalled": "[",
        "type": "[",
        "fileName": "["
      }
    }
  ]
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                   |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Danh sách nhóm              | [Success_Group_Get_Groups_Schema](#schemasuccess_group_get_groups_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Lấy danh sách nhóm thất bại | [Error_400_Group_Get_Groups_Schema](#schemaerror_400_group_get_groups_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_Group_Get_Groups_Schema](#schemaerror_401_group_get_groups_schema) |

<a id="opIdGroupController_addParticipant"></a>

## PUT Thêm thành viên vào nhóm

PUT /api/group/{groupId}/participant

> Body Parameters

```json
{
  "participantIds": ["21b1529f4a1ec026ed52ee7f", "c9c08b47f929fcb9bb7deb9a"]
}
```

### Params

| Name    | Location | Type                                          | Required | Description |
| ------- | -------- | --------------------------------------------- | -------- | ----------- |
| groupId | path     | string                                        | yes      | none        |
| body    | body     | [ParticipantIdsDTO](#schemaparticipantidsdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                       | Data schema                                                                             |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Thành viên đã được thêm vào nhóm  | [Success_Group_Add_Participant_Schema](#schemasuccess_group_add_participant_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Thêm thành viên vào nhóm thất bại | [Error_400_Group_Add_Participant_Schema](#schemaerror_400_group_add_participant_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập           | [Error_401_Group_Add_Participant_Schema](#schemaerror_401_group_add_participant_schema) |

<a id="opIdGroupController_removeParticipant"></a>

## DELETE Xóa thành viên khỏi nhóm

DELETE /api/group/{groupId}/participant

> Body Parameters

```json
{
  "participantIds": ["21b1529f4a1ec026ed52ee7f", "c9c08b47f929fcb9bb7deb9a"]
}
```

### Params

| Name    | Location | Type                                          | Required | Description |
| ------- | -------- | --------------------------------------------- | -------- | ----------- |
| groupId | path     | string                                        | yes      | none        |
| body    | body     | [ParticipantIdsDTO](#schemaparticipantidsdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                       | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Thành viên đã được xóa khỏi nhóm  | [Success_Group_Remove_Participant_Schema](#schemasuccess_group_remove_participant_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xóa thành viên khỏi nhóm thất bại | [Error_400_Group_Remove_Participant_Schema](#schemaerror_400_group_remove_participant_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập           | [Error_401_Group_Remove_Participant_Schema](#schemaerror_401_group_remove_participant_schema) |

<a id="opIdGroupController_deleteGroup"></a>

## DELETE Xóa nhóm

DELETE /api/group/{groupId}

### Params

| Name    | Location | Type   | Required | Description         |
| ------- | -------- | ------ | -------- | ------------------- |
| groupId | path     | string | yes      | ID của nhóm cần xóa |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                 | Data schema                                                                       |
| ---------------- | ---------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Nhóm đã được xóa thành công | [Success_Group_Delete_Group_Schema](#schemasuccess_group_delete_group_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Xóa nhóm thất bại           | [Error_400_Group_Delete_Group_Schema](#schemaerror_400_group_delete_group_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập     | [Error_401_Group_Delete_Group_Schema](#schemaerror_401_group_delete_group_schema) |

<a id="opIdGroupController_getGroupInfo"></a>

## GET Lấy thông tin của nhóm

GET /api/group/{groupId}

### Params

| Name    | Location | Type   | Required | Description |
| ------- | -------- | ------ | -------- | ----------- |
| groupId | path     | string | yes      | ID của nhóm |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "ce5cedd3c19185d96fa67750",
    "name": "petty furlough drat",
    "ownerId": "7e032a41eff088ed7ee55d33",
    "isGroup": true,
    "createdAt": "2024-06-16T08:57:04.657Z",
    "updatedAt": "2025-05-11T21:59:18.153Z",
    "participants": [
      {
        "id": "[",
        "profileId": "[",
        "role": "[",
        "name": "[",
        "avatar": "["
      }
    ],
    "lastMessage": {
      "id": null,
      "content": null,
      "senderId": null,
      "fileUrl": null,
      "createdAt": null,
      "updatedAt": null,
      "isRecalled": null,
      "type": null,
      "fileName": null
    }
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                         | Description                                  | Data schema                                                                           |
| ---------------- | --------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Thông tin chi tiết của nhóm                  | [Success_Group_Get_Group_Info_Schema](#schemasuccess_group_get_group_info_schema)     |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Không có quyền truy cập                      | [Error_401_Group_Get_Group_Info_Schema](#schemaerror_401_group_get_group_info_schema) |
| 403              | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)  | Người dùng không phải là thành viên của nhóm | [Error_403_Group_Get_Group_Info_Schema](#schemaerror_403_group_get_group_info_schema) |

<a id="opIdGroupController_leaveGroup"></a>

## DELETE Rời khỏi nhóm

DELETE /api/group/{groupId}/leave

### Params

| Name    | Location | Type   | Required | Description          |
| ------- | -------- | ------ | -------- | -------------------- |
| groupId | path     | string | yes      | ID của nhóm muốn rời |

### Responses

| HTTP Status Code | Meaning                                                 | Description | Data schema |
| ---------------- | ------------------------------------------------------- | ----------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | None        |

<a id="opIdGroupController_transferOwnership"></a>

## PUT Chuyển quyền chủ nhóm

PUT /api/group/{groupId}/owner

> Body Parameters

```json
{
  "newOwnerId": "1af1fc0adb5b8eaf067e1ae6"
}
```

### Params

| Name    | Location | Type                                    | Required | Description |
| ------- | -------- | --------------------------------------- | -------- | ----------- |
| groupId | path     | string                                  | yes      | ID của nhóm |
| body    | body     | [ChangeOwnerDTO](#schemachangeownerdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                              | Data schema                                                                                   |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Quyền chủ nhóm đã được chuyển thành công | [Success_Group_Transfer_Ownership_Schema](#schemasuccess_group_transfer_ownership_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Chuyển quyền chủ nhóm thất bại           | [Error_400_Group_Transfer_Ownership_Schema](#schemaerror_400_group_transfer_ownership_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập                  | [Error_401_Group_Transfer_Ownership_Schema](#schemaerror_401_group_transfer_ownership_schema) |

<a id="opIdGroupController_searchGroups"></a>

## GET Tìm kiếm nhóm theo tên

GET /api/group/search/{keyword}

### Params

| Name    | Location | Type   | Required | Description      |
| ------- | -------- | ------ | -------- | ---------------- |
| keyword | path     | string | yes      | Từ khóa tìm kiếm |

> Response Examples

> 200 Response

```json
[
  {
    "id": "group-id-1",
    "name": "Nhóm học tập",
    "ownerId": "profile-id-1",
    "isGroup": true,
    "createdAt": "2023-10-20T08:00:00Z",
    "updatedAt": "2023-10-25T10:30:00Z",
    "participants": [
      {
        "id": "participant-id-1",
        "userId": "profile-id-1",
        "groupId": "group-id-1",
        "role": "OWNER",
        "user": {
          "id": null,
          "name": null,
          "avatar": null
        }
      }
    ],
    "messages": [
      {
        "id": "message-id-1",
        "content": "Xin chào mọi người!",
        "createdAt": "2023-10-25T10:30:00Z"
      }
    ]
  }
]
```

### Responses

| HTTP Status Code | Meaning                                                 | Description                                 | Data schema |
| ---------------- | ------------------------------------------------------- | ------------------------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Danh sách nhóm phù hợp với từ khóa tìm kiếm | Inline      |

### Responses Data Schema

HTTP Status Code **200**

| Name           | Type                                            | Required | Restrictions | Title | description                                                |
| -------------- | ----------------------------------------------- | -------- | ------------ | ----- | ---------------------------------------------------------- |
| _anonymous_    | [[GroupResponseDto](#schemagroupresponsedto)]   | false    | none         |       | none                                                       |
| » id           | string                                          | true     | none         |       | ID của nhóm                                                |
| » name         | string                                          | true     | none         |       | Tên nhóm                                                   |
| » ownerId      | string                                          | true     | none         |       | ID của chủ nhóm                                            |
| » isGroup      | boolean                                         | true     | none         |       | Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp |
| » createdAt    | string(date-time)                               | true     | none         |       | Thời gian tạo nhóm                                         |
| » updatedAt    | string(date-time)                               | true     | none         |       | Thời gian cập nhật nhóm                                    |
| » participants | [[ParticipantDto](#schemaparticipantdto)]       | true     | none         |       | Danh sách thành viên trong nhóm                            |
| »» id          | string                                          | true     | none         |       | ID của thành viên trong nhóm                               |
| »» userId      | string                                          | true     | none         |       | ID của hồ sơ người dùng                                    |
| »» groupId     | string                                          | true     | none         |       | ID của nhóm                                                |
| »» role        | string                                          | true     | none         |       | Vai trò trong nhóm                                         |
| »» user        | [ParticipantUserDto](#schemaparticipantuserdto) | true     | none         |       | Thông tin người dùng                                       |
| »»» id         | string                                          | true     | none         |       | ID của hồ sơ người dùng                                    |
| »»» name       | string                                          | true     | none         |       | Tên người dùng                                             |
| »»» avatar     | string                                          | true     | none         |       | Ảnh đại diện                                               |
| » messages     | [[MessageDto](#schemamessagedto)]               | true     | none         |       | Tin nhắn gần nhất trong nhóm                               |
| »» id          | string                                          | true     | none         |       | ID của tin nhắn                                            |
| »» content     | string                                          | true     | none         |       | Nội dung tin nhắn                                          |
| »» createdAt   | string(date-time)                               | true     | none         |       | Thời gian tạo tin nhắn                                     |

#### Enum

| Name | Value  |
| ---- | ------ |
| role | OWNER  |
| role | MEMBER |

<a id="opIdGroupController_renameGroup"></a>

## POST Đổi tên nhóm

POST /api/group/{groupId}/rename

> Body Parameters

```json
{
  "name": "Nhóm bạn thân"
}
```

### Params

| Name    | Location | Type                                    | Required | Description |
| ------- | -------- | --------------------------------------- | -------- | ----------- |
| groupId | path     | string                                  | yes      | ID của nhóm |
| body    | body     | [RenameGroupDTO](#schemarenamegroupdto) | no       | none        |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                     | Data schema                                                                       |
| ---------------- | ---------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Tên nhóm đã được đổi thành công | [Success_Group_Rename_Group_Schema](#schemasuccess_group_rename_group_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Đổi tên nhóm thất bại           | [Error_400_Group_Rename_Group_Schema](#schemaerror_400_group_rename_group_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập         | [Error_401_Group_Rename_Group_Schema](#schemaerror_401_group_rename_group_schema) |

<a id="opIdGroupController_updateGroupAvatar"></a>

## PUT Cập nhật avatar nhóm

PUT /api/group/{groupId}/avatar

> Body Parameters

```yaml
file: ''
```

### Params

| Name    | Location | Type           | Required | Description                  |
| ------- | -------- | -------------- | -------- | ---------------------------- |
| groupId | path     | string         | yes      | ID của nhóm                  |
| body    | body     | object         | no       | none                         |
| » file  | body     | string(binary) | yes      | Ảnh đại diện của nhóm (file) |

> Response Examples

> 200 Response

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description                             | Data schema                                                                                     |
| ---------------- | ---------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | Avatar nhóm đã được cập nhật thành công | [Success_Group_Update_Group_Avatar_Schema](#schemasuccess_group_update_group_avatar_schema)     |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Cập nhật avatar nhóm thất bại           | [Error_400_Group_Update_Group_Avatar_Schema](#schemaerror_400_group_update_group_avatar_schema) |
| 401              | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)  | Không có quyền truy cập                 | [Error_401_Group_Update_Group_Avatar_Schema](#schemaerror_401_group_update_group_avatar_schema) |

# Data Schema

<h2 id="tocS_SendMessageDto">SendMessageDto</h2>

<a id="schemasendmessagedto"></a>
<a id="schema_SendMessageDto"></a>
<a id="tocSsendmessagedto"></a>
<a id="tocssendmessagedto"></a>

```json
{
  "groupId": "da155133ee5f23240d4944f3",
  "message": "Mollitia vado ait utrimque sum tristis nulla templum.",
  "type": "TEXT",
  "file": "file_content"
}
```

### Attribute

| Name    | Type           | Required | Restrictions | Title | Description                               |
| ------- | -------------- | -------- | ------------ | ----- | ----------------------------------------- |
| groupId | string         | true     | none         |       | ID của nhóm chat                          |
| message | string         | false    | none         |       | Nội dung tin nhắn                         |
| type    | string         | false    | none         |       | Loại tin nhắn                             |
| file    | string(binary) | false    | none         |       | File đính kèm (hình ảnh, video hoặc file) |

#### Enum

| Name | Value |
| ---- | ----- |
| type | TEXT  |
| type | IMAGE |
| type | VIDEO |
| type | RAW   |

<h2 id="tocS_ApiResponseDto">ApiResponseDto</h2>

<a id="schemaapiresponsedto"></a>
<a id="schema_ApiResponseDto"></a>
<a id="tocSapiresponsedto"></a>
<a id="tocsapiresponsedto"></a>

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {},
  "message": "Tin nhắn không tồn tại"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description            |
| ---------- | ------ | -------- | ------------ | ----- | ---------------------- |
| status     | string | true     | none         |       | Trạng thái của request |
| statusCode | number | true     | none         |       | Mã trạng thái HTTP     |
| data       | object | true     | none         |       | Dữ liệu trả về từ API  |
| message    | string | false    | none         |       | Thông báo lỗi (nếu có) |

<h2 id="tocS_MessageIdResponseDTO">MessageIdResponseDTO</h2>

<a id="schemamessageidresponsedto"></a>
<a id="schema_MessageIdResponseDTO"></a>
<a id="tocSmessageidresponsedto"></a>
<a id="tocsmessageidresponsedto"></a>

```json
{
  "messageId": "c8caf93a3bbf2fabcb83abe5"
}
```

### Attribute

| Name      | Type   | Required | Restrictions | Title | Description     |
| --------- | ------ | -------- | ------------ | ----- | --------------- |
| messageId | string | true     | none         |       | ID của tin nhắn |

<h2 id="tocS_ForwardMessageDto">ForwardMessageDto</h2>

<a id="schemaforwardmessagedto"></a>
<a id="schema_ForwardMessageDto"></a>
<a id="tocSforwardmessagedto"></a>
<a id="tocsforwardmessagedto"></a>

```json
{
  "messageId": "4b74d769fdfef24ca6ffca7d",
  "groupId": "d20afe5ebafccd8120ed3f83"
}
```

### Attribute

| Name      | Type   | Required | Restrictions | Title | Description                                       |
| --------- | ------ | -------- | ------------ | ----- | ------------------------------------------------- |
| messageId | string | true     | none         |       | ID của tin nhắn cần chuyển tiếp                   |
| groupId   | string | true     | none         |       | ID của nhóm chat đích để chuyển tiếp tin nhắn đến |

<h2 id="tocS_Success_Message_Send_Message_Schema">Success_Message_Send_Message_Schema</h2>

<a id="schemasuccess_message_send_message_schema"></a>
<a id="schema_Success_Message_Send_Message_Schema"></a>
<a id="tocSsuccess_message_send_message_schema"></a>
<a id="tocssuccess_message_send_message_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [MessageIdResponseDTO](#schemamessageidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_EditMessageDto">EditMessageDto</h2>

<a id="schemaeditmessagedto"></a>
<a id="schema_EditMessageDto"></a>
<a id="tocSeditmessagedto"></a>
<a id="tocseditmessagedto"></a>

```json
{
  "newContent": "Nội dung tin nhắn đã chỉnh sửa"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description               |
| ---------- | ------ | -------- | ------------ | ----- | ------------------------- |
| newContent | string | true     | none         |       | Nội dung mới của tin nhắn |

<h2 id="tocS_Error_400_Message_Send_Message_Schema">Error_400_Message_Send_Message_Schema</h2>

<a id="schemaerror_400_message_send_message_schema"></a>
<a id="schema_Error_400_Message_Send_Message_Schema"></a>
<a id="tocSerror_400_message_send_message_schema"></a>
<a id="tocserror_400_message_send_message_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Gửi tin nhắn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_GetMediaDto">GetMediaDto</h2>

<a id="schemagetmediadto"></a>
<a id="schema_GetMediaDto"></a>
<a id="tocSgetmediadto"></a>
<a id="tocsgetmediadto"></a>

```json
{
  "type": "IMAGE",
  "limit": 10,
  "cursor": "146ac4dab0fc39dd7bf06ccf"
}
```

### Attribute

| Name   | Type   | Required | Restrictions | Title | Description                                   |
| ------ | ------ | -------- | ------------ | ----- | --------------------------------------------- |
| type   | string | true     | none         |       | Loại media muốn lấy                           |
| limit  | number | true     | none         |       | Số lượng media muốn lấy trong một trang       |
| cursor | string | false    | none         |       | ID của tin nhắn dùng làm cursor để phân trang |

#### Enum

| Name | Value |
| ---- | ----- |
| type | IMAGE |
| type | VIDEO |
| type | RAW   |

<h2 id="tocS_Error_401_Message_Send_Message_Schema">Error_401_Message_Send_Message_Schema</h2>

<a id="schemaerror_401_message_send_message_schema"></a>
<a id="schema_Error_401_Message_Send_Message_Schema"></a>
<a id="tocSerror_401_message_send_message_schema"></a>
<a id="tocserror_401_message_send_message_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_RegisterDTO">RegisterDTO</h2>

<a id="schemaregisterdto"></a>
<a id="schema_RegisterDTO"></a>
<a id="tocSregisterdto"></a>
<a id="tocsregisterdto"></a>

```json
{
  "username": "Tracy94",
  "email": "Viola_Crist@gmail.com",
  "password": "Abc1!Z46q]",
  "role": "USER"
}
```

### Attribute

| Name     | Type   | Required | Restrictions | Title | Description            |
| -------- | ------ | -------- | ------------ | ----- | ---------------------- |
| username | string | true     | none         |       | Tên đăng nhập          |
| email    | string | true     | none         |       | Địa chỉ email          |
| password | string | true     | none         |       | Mật khẩu               |
| role     | string | true     | none         |       | Vai trò của người dùng |

#### Enum

| Name | Value |
| ---- | ----- |
| role | USER  |
| role | ADMIN |

<h2 id="tocS_Success_MessageId_Recall_Message_Schema">Success_MessageId_Recall_Message_Schema</h2>

<a id="schemasuccess_messageid_recall_message_schema"></a>
<a id="schema_Success_MessageId_Recall_Message_Schema"></a>
<a id="tocSsuccess_messageid_recall_message_schema"></a>
<a id="tocssuccess_messageid_recall_message_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [MessageIdResponseDTO](#schemamessageidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_ResendOtpDto">ResendOtpDto</h2>

<a id="schemaresendotpdto"></a>
<a id="schema_ResendOtpDto"></a>
<a id="tocSresendotpdto"></a>
<a id="tocsresendotpdto"></a>

```json
{
  "email": "string"
}
```

### Attribute

| Name  | Type   | Required | Restrictions | Title | Description   |
| ----- | ------ | -------- | ------------ | ----- | ------------- |
| email | string | true     | none         |       | Email đăng ký |

<h2 id="tocS_RegisterResponse">RegisterResponse</h2>

<a id="schemaregisterresponse"></a>
<a id="schema_RegisterResponse"></a>
<a id="tocSregisterresponse"></a>
<a id="tocsregisterresponse"></a>

```json
{
  "email": "Annalise9@gmail.com",
  "isPending": true,
  "key": "57958204-0f4a-4c53-889c-802f4dfbc819"
}
```

### Attribute

| Name      | Type    | Required | Restrictions | Title | Description                      |
| --------- | ------- | -------- | ------------ | ----- | -------------------------------- |
| email     | string  | true     | none         |       | Địa chỉ email đã đăng ký         |
| isPending | boolean | true     | none         |       | Trạng thái đang chờ xác thực OTP |
| key       | string  | false    | none         |       | Key                              |

<h2 id="tocS_Error_400_MessageId_Recall_Message_Schema">Error_400_MessageId_Recall_Message_Schema</h2>

<a id="schemaerror_400_messageid_recall_message_schema"></a>
<a id="schema_Error_400_MessageId_Recall_Message_Schema"></a>
<a id="tocSerror_400_messageid_recall_message_schema"></a>
<a id="tocserror_400_messageid_recall_message_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Thu hồi tin nhắn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CheckRegister">CheckRegister</h2>

<a id="schemacheckregister"></a>
<a id="schema_CheckRegister"></a>
<a id="tocScheckregister"></a>
<a id="tocscheckregister"></a>

```json
{
  "key": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "email": "Elmore.Block@hotmail.com"
}
```

### Attribute

| Name  | Type   | Required | Restrictions | Title | Description   |
| ----- | ------ | -------- | ------------ | ----- | ------------- |
| key   | string | true     | none         |       | Key xác thực  |
| email | string | true     | none         |       | Email đăng ký |

<h2 id="tocS_Success_Auth_Register_Schema">Success_Auth_Register_Schema</h2>

<a id="schemasuccess_auth_register_schema"></a>
<a id="schema_Success_Auth_Register_Schema"></a>
<a id="tocSsuccess_auth_register_schema"></a>
<a id="tocssuccess_auth_register_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "email": "Annalise9@gmail.com",
    "isPending": true,
    "key": "57958204-0f4a-4c53-889c-802f4dfbc819"
  }
}
```

### Attribute

| Name       | Type                                        | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                      | true     | none         |       | HTTP status code  |
| message    | string                                      | true     | none         |       | Thông báo kết quả |
| data       | [RegisterResponse](#schemaregisterresponse) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_401_MessageId_Recall_Message_Schema">Error_401_MessageId_Recall_Message_Schema</h2>

<a id="schemaerror_401_messageid_recall_message_schema"></a>
<a id="schema_Error_401_MessageId_Recall_Message_Schema"></a>
<a id="tocSerror_401_messageid_recall_message_schema"></a>
<a id="tocserror_401_messageid_recall_message_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_RegisterOtpVerifyDTO">RegisterOtpVerifyDTO</h2>

<a id="schemaregisterotpverifydto"></a>
<a id="schema_RegisterOtpVerifyDTO"></a>
<a id="tocSregisterotpverifydto"></a>
<a id="tocsregisterotpverifydto"></a>

```json
{
  "email": "Emilie43@yahoo.com",
  "otp": "1e104c31-4c5e-4606-9270-d0bf28a6d7dd"
}
```

### Attribute

| Name  | Type   | Required | Restrictions | Title | Description   |
| ----- | ------ | -------- | ------------ | ----- | ------------- |
| email | string | true     | none         |       | Email đăng ký |
| otp   | string | true     | none         |       | Mã OTP        |

<h2 id="tocS_Error_400_Auth_Register_Schema">Error_400_Auth_Register_Schema</h2>

<a id="schemaerror_400_auth_register_schema"></a>
<a id="schema_Error_400_Auth_Register_Schema"></a>
<a id="tocSerror_400_auth_register_schema"></a>
<a id="tocserror_400_auth_register_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Đăng ký thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_MessageId_Delete_Message_Schema">Success_MessageId_Delete_Message_Schema</h2>

<a id="schemasuccess_messageid_delete_message_schema"></a>
<a id="schema_Success_MessageId_Delete_Message_Schema"></a>
<a id="tocSsuccess_messageid_delete_message_schema"></a>
<a id="tocssuccess_messageid_delete_message_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [MessageIdResponseDTO](#schemamessageidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_LoginDTO">LoginDTO</h2>

<a id="schemalogindto"></a>
<a id="schema_LoginDTO"></a>
<a id="tocSlogindto"></a>
<a id="tocslogindto"></a>

```json
{
  "username": "Aryanna_Emmerich",
  "password": "Abc1!BA>mf"
}
```

### Attribute

| Name     | Type   | Required | Restrictions | Title | Description  |
| -------- | ------ | -------- | ------------ | ----- | ------------ |
| username | string | false    | none         |       | The username |
| password | string | true     | none         |       | Mật khẩu     |

<h2 id="tocS_ResendOtpDTO">ResendOtpDTO</h2>

<a id="schemaresendotpdto"></a>
<a id="schema_ResendOtpDTO"></a>
<a id="tocSresendotpdto"></a>
<a id="tocsresendotpdto"></a>

```json
{
  "email": "Shyann78@yahoo.com"
}
```

### Attribute

| Name  | Type   | Required | Restrictions | Title | Description   |
| ----- | ------ | -------- | ------------ | ----- | ------------- |
| email | string | true     | none         |       | Email đăng ký |

<h2 id="tocS_Error_400_MessageId_Delete_Message_Schema">Error_400_MessageId_Delete_Message_Schema</h2>

<a id="schemaerror_400_messageid_delete_message_schema"></a>
<a id="schema_Error_400_MessageId_Delete_Message_Schema"></a>
<a id="tocSerror_400_messageid_delete_message_schema"></a>
<a id="tocserror_400_messageid_delete_message_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xóa tin nhắn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_ForgotPasswordDTO">ForgotPasswordDTO</h2>

<a id="schemaforgotpassworddto"></a>
<a id="schema_ForgotPasswordDTO"></a>
<a id="tocSforgotpassworddto"></a>
<a id="tocsforgotpassworddto"></a>

```json
{
  "email": "Bell.Runolfsson@gmail.com"
}
```

### Attribute

| Name  | Type   | Required | Restrictions | Title | Description |
| ----- | ------ | -------- | ------------ | ----- | ----------- |
| email | string | true     | none         |       | Email       |

<h2 id="tocS_Success_Auth_Resend_Otp_Schema">Success_Auth_Resend_Otp_Schema</h2>

<a id="schemasuccess_auth_resend_otp_schema"></a>
<a id="schema_Success_Auth_Resend_Otp_Schema"></a>
<a id="tocSsuccess_auth_resend_otp_schema"></a>
<a id="tocssuccess_auth_resend_otp_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "email": "Shyann78@yahoo.com"
  }
}
```

### Attribute

| Name       | Type                                | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                              | true     | none         |       | HTTP status code  |
| message    | string                              | true     | none         |       | Thông báo kết quả |
| data       | [ResendOtpDTO](#schemaresendotpdto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_401_MessageId_Delete_Message_Schema">Error_401_MessageId_Delete_Message_Schema</h2>

<a id="schemaerror_401_messageid_delete_message_schema"></a>
<a id="schema_Error_401_MessageId_Delete_Message_Schema"></a>
<a id="tocSerror_401_messageid_delete_message_schema"></a>
<a id="tocserror_401_messageid_delete_message_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_ResetPasswordDTO">ResetPasswordDTO</h2>

<a id="schemaresetpassworddto"></a>
<a id="schema_ResetPasswordDTO"></a>
<a id="tocSresetpassworddto"></a>
<a id="tocsresetpassworddto"></a>

```json
{
  "newPassword": "Abc1!uL/Tb"
}
```

### Attribute

| Name        | Type   | Required | Restrictions | Title | Description  |
| ----------- | ------ | -------- | ------------ | ----- | ------------ |
| newPassword | string | true     | none         |       | Mật khẩu mới |

<h2 id="tocS_Error_400_Auth_Resend_Otp_Schema">Error_400_Auth_Resend_Otp_Schema</h2>

<a id="schemaerror_400_auth_resend_otp_schema"></a>
<a id="schema_Error_400_Auth_Resend_Otp_Schema"></a>
<a id="tocSerror_400_auth_resend_otp_schema"></a>
<a id="tocserror_400_auth_resend_otp_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Gửi OTP thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_UpdateProfileDTO">UpdateProfileDTO</h2>

<a id="schemaupdateprofiledto"></a>
<a id="schema_UpdateProfileDTO"></a>
<a id="tocSupdateprofiledto"></a>
<a id="tocsupdateprofiledto"></a>

```json
{
  "name": "string",
  "phone": "0912345678",
  "bio": "string",
  "gender": "M",
  "avatar": "string",
  "birthday": "string"
}
```

### Attribute

| Name     | Type           | Required | Restrictions | Title | Description                |
| -------- | -------------- | -------- | ------------ | ----- | -------------------------- |
| name     | string         | false    | none         |       | Tên đầy đủ                 |
| phone    | string         | false    | none         |       | Số điện thoại              |
| bio      | string         | false    | none         |       | Tiểu sử                    |
| gender   | string         | false    | none         |       | Giới tính                  |
| avatar   | string(binary) | false    | none         |       | Ảnh đại diện (file upload) |
| birthday | string         | false    | none         |       | Ngày sinh (định dạng ISO)  |

#### Enum

| Name   | Value |
| ------ | ----- |
| gender | M     |
| gender | F     |

<h2 id="tocS_Success_MessageId_Forward_Message_Schema">Success_MessageId_Forward_Message_Schema</h2>

<a id="schemasuccess_messageid_forward_message_schema"></a>
<a id="schema_Success_MessageId_Forward_Message_Schema"></a>
<a id="tocSsuccess_messageid_forward_message_schema"></a>
<a id="tocssuccess_messageid_forward_message_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "messageId": "c8caf93a3bbf2fabcb83abe5"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [MessageIdResponseDTO](#schemamessageidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_UpdatePasswordDTO">UpdatePasswordDTO</h2>

<a id="schemaupdatepassworddto"></a>
<a id="schema_UpdatePasswordDTO"></a>
<a id="tocSupdatepassworddto"></a>
<a id="tocsupdatepassworddto"></a>

```json
{
  "currentPassword": "Abc1!l<sHv",
  "newPassword": "Abc1!$o8p["
}
```

### Attribute

| Name            | Type   | Required | Restrictions | Title | Description                                        |
| --------------- | ------ | -------- | ------------ | ----- | -------------------------------------------------- |
| currentPassword | string | true     | none         |       | Mật khẩu hiện tại (bắt buộc khi thay đổi mật khẩu) |
| newPassword     | string | true     | none         |       | Mật khẩu mới                                       |

<h2 id="tocS_Success_Auth_Is_Register_Schema">Success_Auth_Is_Register_Schema</h2>

<a id="schemasuccess_auth_is_register_schema"></a>
<a id="schema_Success_Auth_Is_Register_Schema"></a>
<a id="tocSsuccess_auth_is_register_schema"></a>
<a id="tocssuccess_auth_is_register_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description       |
| ---------- | ------ | -------- | ------------ | ----- | ----------------- |
| statusCode | number | true     | none         |       | HTTP status code  |
| message    | string | true     | none         |       | Thông báo kết quả |
| data       | object | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_MessageId_Forward_Message_Schema">Error_400_MessageId_Forward_Message_Schema</h2>

<a id="schemaerror_400_messageid_forward_message_schema"></a>
<a id="schema_Error_400_MessageId_Forward_Message_Schema"></a>
<a id="tocSerror_400_messageid_forward_message_schema"></a>
<a id="tocserror_400_messageid_forward_message_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Chuyển tiếp tin nhắn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CreateFriendshipDto">CreateFriendshipDto</h2>

<a id="schemacreatefriendshipdto"></a>
<a id="schema_CreateFriendshipDto"></a>
<a id="tocScreatefriendshipdto"></a>
<a id="tocscreatefriendshipdto"></a>

```json
{
  "receiverId": "profile-id"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description                       |
| ---------- | ------ | -------- | ------------ | ----- | --------------------------------- |
| receiverId | string | true     | none         |       | ID của người nhận lời mời kết bạn |

<h2 id="tocS_Error_400_Auth_Is_Register_Schema">Error_400_Auth_Is_Register_Schema</h2>

<a id="schemaerror_400_auth_is_register_schema"></a>
<a id="schema_Error_400_Auth_Is_Register_Schema"></a>
<a id="tocSerror_400_auth_is_register_schema"></a>
<a id="tocserror_400_auth_is_register_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Kiểm tra đăng ký thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_MessageId_Forward_Message_Schema">Error_401_MessageId_Forward_Message_Schema</h2>

<a id="schemaerror_401_messageid_forward_message_schema"></a>
<a id="schema_Error_401_MessageId_Forward_Message_Schema"></a>
<a id="tocSerror_401_messageid_forward_message_schema"></a>
<a id="tocserror_401_messageid_forward_message_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_FriendshipResponseDto">FriendshipResponseDto</h2>

<a id="schemafriendshipresponsedto"></a>
<a id="schema_FriendshipResponseDto"></a>
<a id="tocSfriendshipresponsedto"></a>
<a id="tocsfriendshipresponsedto"></a>

```json
{
  "id": "friendShip-id",
  "status": "PENDING",
  "message": "Yêu cầu kết bạn đã được gửi thành công"
}
```

### Attribute

| Name    | Type   | Required | Restrictions | Title | Description                |
| ------- | ------ | -------- | ------------ | ----- | -------------------------- |
| id      | string | true     | none         |       | ID của mối quan hệ bạn bè  |
| status  | string | true     | none         |       | Trạng thái của mối quan hệ |
| message | string | true     | none         |       | Thông báo kết quả          |

#### Enum

| Name   | Value    |
| ------ | -------- |
| status | PENDING  |
| status | ACCEPTED |
| status | REJECTED |

<h2 id="tocS_FriendResponse">FriendResponse</h2>

<a id="schemafriendresponse"></a>
<a id="schema_FriendResponse"></a>
<a id="tocSfriendresponse"></a>
<a id="tocsfriendresponse"></a>

```json
{
  "id": "b1b4d6dc8f1b07ce3dfe13c6",
  "profileId": "bcabfa1f6d85fd6cbaad6468",
  "name": "Loren Ryan",
  "avatar": "https://avatars.githubusercontent.com/u/40136905",
  "bio": "fog junkie, leader",
  "phone": "0971498233",
  "email": "Melba_Abernathy97@gmail.com",
  "birthday": "2002-08-14T22:39:47.293Z"
}
```

### Attribute

| Name      | Type        | Required | Restrictions | Title | Description                      |
| --------- | ----------- | -------- | ------------ | ----- | -------------------------------- |
| id        | string      | true     | none         |       | ID của mối quan hệ bạn bè        |
| profileId | string      | true     | none         |       | ID của profile người dùng        |
| name      | object¦null | false    | none         |       | Tên người dùng                   |
| avatar    | object¦null | false    | none         |       | URL hình đại diện của người dùng |
| bio       | object¦null | false    | none         |       | Thông tin giới thiệu             |
| phone     | object¦null | false    | none         |       | Số điện thoại                    |
| email     | object¦null | false    | none         |       | Email người dùng                 |
| birthday  | object¦null | false    | none         |       | Ngày sinh                        |

<h2 id="tocS_RegisterResponseDTO">RegisterResponseDTO</h2>

<a id="schemaregisterresponsedto"></a>
<a id="schema_RegisterResponseDTO"></a>
<a id="tocSregisterresponsedto"></a>
<a id="tocsregisterresponsedto"></a>

```json
{
  "accountId": "e7befab8a8fcc8cf0faacdb3",
  "username": "Jerad93",
  "email": "Freeda26@gmail.com",
  "profileId": "7578affcaa3660e4aecaa362"
}
```

### Attribute

| Name      | Type   | Required | Restrictions | Title | Description      |
| --------- | ------ | -------- | ------------ | ----- | ---------------- |
| accountId | string | true     | none         |       | ID của tài khoản |
| username  | string | true     | none         |       | Tên đăng nhập    |
| email     | string | true     | none         |       | Địa chỉ email    |
| profileId | string | true     | none         |       | ID của profile   |

<h2 id="tocS_HandleFriendRequestDto">HandleFriendRequestDto</h2>

<a id="schemahandlefriendrequestdto"></a>
<a id="schema_HandleFriendRequestDto"></a>
<a id="tocShandlefriendrequestdto"></a>
<a id="tocshandlefriendrequestdto"></a>

```json
{
  "action": "ACCEPT"
}
```

### Attribute

| Name   | Type   | Required | Restrictions | Title | Description                     |
| ------ | ------ | -------- | ------------ | ----- | ------------------------------- |
| action | string | true     | none         |       | Hành động xử lý yêu cầu kết bạn |

#### Enum

| Name   | Value  |
| ------ | ------ |
| action | ACCEPT |
| action | REJECT |

<h2 id="tocS_Success_Auth_Verify_Otp_Schema">Success_Auth_Verify_Otp_Schema</h2>

<a id="schemasuccess_auth_verify_otp_schema"></a>
<a id="schema_Success_Auth_Verify_Otp_Schema"></a>
<a id="tocSsuccess_auth_verify_otp_schema"></a>
<a id="tocssuccess_auth_verify_otp_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "accountId": "e7befab8a8fcc8cf0faacdb3",
    "username": "Jerad93",
    "email": "Freeda26@gmail.com",
    "profileId": "7578affcaa3660e4aecaa362"
  }
}
```

### Attribute

| Name       | Type                                              | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                            | true     | none         |       | HTTP status code  |
| message    | string                                            | true     | none         |       | Thông báo kết quả |
| data       | [RegisterResponseDTO](#schemaregisterresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_UserSearchResponseDto">UserSearchResponseDto</h2>

<a id="schemausersearchresponsedto"></a>
<a id="schema_UserSearchResponseDto"></a>
<a id="tocSusersearchresponsedto"></a>
<a id="tocsusersearchresponsedto"></a>

```json
{
  "id": "profile-id",
  "username": "user123",
  "name": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg",
  "relation": "NONE"
}
```

### Attribute

| Name     | Type        | Required | Restrictions | Title | Description                                    |
| -------- | ----------- | -------- | ------------ | ----- | ---------------------------------------------- |
| id       | string      | true     | none         |       | ID của người dùng                              |
| username | string      | true     | none         |       | Tên đăng nhập                                  |
| name     | object¦null | false    | none         |       | Tên hiển thị của người dùng                    |
| avatar   | object¦null | false    | none         |       | URL hình đại diện của người dùng               |
| relation | string      | false    | none         |       | Trạng thái mối quan hệ với người dùng hiện tại |

#### Enum

| Name     | Value            |
| -------- | ---------------- |
| relation | NONE             |
| relation | FRIEND           |
| relation | PENDING_SENT     |
| relation | PENDING_RECEIVED |
| relation | REJECTED         |

<h2 id="tocS_Error_400_Auth_Verify_Otp_Schema">Error_400_Auth_Verify_Otp_Schema</h2>

<a id="schemaerror_400_auth_verify_otp_schema"></a>
<a id="schema_Error_400_Auth_Verify_Otp_Schema"></a>
<a id="tocSerror_400_auth_verify_otp_schema"></a>
<a id="tocserror_400_auth_verify_otp_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xác thực OTP thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CreateGroupDto">CreateGroupDto</h2>

<a id="schemacreategroupdto"></a>
<a id="schema_CreateGroupDto"></a>
<a id="tocScreategroupdto"></a>
<a id="tocscreategroupdto"></a>

```json
{
  "name": "Nhóm học tập",
  "participantIds": ["profile-id-1", "profile-id-2"],
  "isGroup": true
}
```

### Attribute

| Name           | Type     | Required | Restrictions | Title | Description                                                |
| -------------- | -------- | -------- | ------------ | ----- | ---------------------------------------------------------- |
| name           | string   | false    | none         |       | Tên của nhóm                                               |
| participantIds | [string] | true     | none         |       | Danh sách ID của thành viên tham gia nhóm                  |
| isGroup        | boolean  | false    | none         |       | Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp |

<h2 id="tocS_ParticipantUserDto">ParticipantUserDto</h2>

<a id="schemaparticipantuserdto"></a>
<a id="schema_ParticipantUserDto"></a>
<a id="tocSparticipantuserdto"></a>
<a id="tocsparticipantuserdto"></a>

```json
{
  "id": "profile-id-1",
  "name": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Attribute

| Name   | Type   | Required | Restrictions | Title | Description             |
| ------ | ------ | -------- | ------------ | ----- | ----------------------- |
| id     | string | true     | none         |       | ID của hồ sơ người dùng |
| name   | string | true     | none         |       | Tên người dùng          |
| avatar | string | true     | none         |       | Ảnh đại diện            |

<h2 id="tocS_LoginUserResponseDTO">LoginUserResponseDTO</h2>

<a id="schemaloginuserresponsedto"></a>
<a id="schema_LoginUserResponseDTO"></a>
<a id="tocSloginuserresponsedto"></a>
<a id="tocsloginuserresponsedto"></a>

```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

### Attribute

| Name          | Type   | Required | Restrictions | Title | Description       |
| ------------- | ------ | -------- | ------------ | ----- | ----------------- |
| access_token  | string | true     | none         |       | The access token  |
| refresh_token | string | true     | none         |       | The refresh token |

<h2 id="tocS_ParticipantDto">ParticipantDto</h2>

<a id="schemaparticipantdto"></a>
<a id="schema_ParticipantDto"></a>
<a id="tocSparticipantdto"></a>
<a id="tocsparticipantdto"></a>

```json
{
  "id": "participant-id-1",
  "userId": "profile-id-1",
  "groupId": "group-id-1",
  "role": "OWNER",
  "user": {
    "id": "profile-id-1",
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### Attribute

| Name    | Type                                            | Required | Restrictions | Title | Description                  |
| ------- | ----------------------------------------------- | -------- | ------------ | ----- | ---------------------------- |
| id      | string                                          | true     | none         |       | ID của thành viên trong nhóm |
| userId  | string                                          | true     | none         |       | ID của hồ sơ người dùng      |
| groupId | string                                          | true     | none         |       | ID của nhóm                  |
| role    | string                                          | true     | none         |       | Vai trò trong nhóm           |
| user    | [ParticipantUserDto](#schemaparticipantuserdto) | true     | none         |       | Thông tin người dùng         |

#### Enum

| Name | Value  |
| ---- | ------ |
| role | OWNER  |
| role | MEMBER |

<h2 id="tocS_Success_Auth_Login_Schema">Success_Auth_Login_Schema</h2>

<a id="schemasuccess_auth_login_schema"></a>
<a id="schema_Success_Auth_Login_Schema"></a>
<a id="tocSsuccess_auth_login_schema"></a>
<a id="tocssuccess_auth_login_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [LoginUserResponseDTO](#schemaloginuserresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_MessageDto">MessageDto</h2>

<a id="schemamessagedto"></a>
<a id="schema_MessageDto"></a>
<a id="tocSmessagedto"></a>
<a id="tocsmessagedto"></a>

```json
{
  "id": "message-id-1",
  "content": "Xin chào mọi người!",
  "createdAt": "2023-10-25T10:30:00Z"
}
```

### Attribute

| Name      | Type              | Required | Restrictions | Title | Description            |
| --------- | ----------------- | -------- | ------------ | ----- | ---------------------- |
| id        | string            | true     | none         |       | ID của tin nhắn        |
| content   | string            | true     | none         |       | Nội dung tin nhắn      |
| createdAt | string(date-time) | true     | none         |       | Thời gian tạo tin nhắn |

<h2 id="tocS_Error_400_Auth_Login_Schema">Error_400_Auth_Login_Schema</h2>

<a id="schemaerror_400_auth_login_schema"></a>
<a id="schema_Error_400_Auth_Login_Schema"></a>
<a id="tocSerror_400_auth_login_schema"></a>
<a id="tocserror_400_auth_login_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Đăng nhập thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_GroupResponseDto">GroupResponseDto</h2>

<a id="schemagroupresponsedto"></a>
<a id="schema_GroupResponseDto"></a>
<a id="tocSgroupresponsedto"></a>
<a id="tocsgroupresponsedto"></a>

```json
{
  "id": "group-id-1",
  "name": "Nhóm học tập",
  "ownerId": "profile-id-1",
  "isGroup": true,
  "createdAt": "2023-10-20T08:00:00Z",
  "updatedAt": "2023-10-25T10:30:00Z",
  "participants": [
    {
      "id": "participant-id-1",
      "userId": "profile-id-1",
      "groupId": "group-id-1",
      "role": "OWNER",
      "user": {
        "id": "[",
        "name": "[",
        "avatar": "["
      }
    }
  ],
  "messages": [
    {
      "id": "message-id-1",
      "content": "Xin chào mọi người!",
      "createdAt": "2023-10-25T10:30:00Z"
    }
  ]
}
```

### Attribute

| Name         | Type                                      | Required | Restrictions | Title | Description                                                |
| ------------ | ----------------------------------------- | -------- | ------------ | ----- | ---------------------------------------------------------- |
| id           | string                                    | true     | none         |       | ID của nhóm                                                |
| name         | string                                    | true     | none         |       | Tên nhóm                                                   |
| ownerId      | string                                    | true     | none         |       | ID của chủ nhóm                                            |
| isGroup      | boolean                                   | true     | none         |       | Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp |
| createdAt    | string(date-time)                         | true     | none         |       | Thời gian tạo nhóm                                         |
| updatedAt    | string(date-time)                         | true     | none         |       | Thời gian cập nhật nhóm                                    |
| participants | [[ParticipantDto](#schemaparticipantdto)] | true     | none         |       | Danh sách thành viên trong nhóm                            |
| messages     | [[MessageDto](#schemamessagedto)]         | true     | none         |       | Tin nhắn gần nhất trong nhóm                               |

<h2 id="tocS_Success_Auth_Refresh_Schema">Success_Auth_Refresh_Schema</h2>

<a id="schemasuccess_auth_refresh_schema"></a>
<a id="schema_Success_Auth_Refresh_Schema"></a>
<a id="tocSsuccess_auth_refresh_schema"></a>
<a id="tocssuccess_auth_refresh_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "access_token": "string",
    "refresh_token": "string"
  }
}
```

### Attribute

| Name       | Type                                                | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                              | true     | none         |       | HTTP status code  |
| message    | string                                              | true     | none         |       | Thông báo kết quả |
| data       | [LoginUserResponseDTO](#schemaloginuserresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_AddParticipantDto">AddParticipantDto</h2>

<a id="schemaaddparticipantdto"></a>
<a id="schema_AddParticipantDto"></a>
<a id="tocSaddparticipantdto"></a>
<a id="tocsaddparticipantdto"></a>

```json
{
  "participantIds": "profile-id-1"
}
```

### Attribute

| Name           | Type     | Required | Restrictions | Title | Description                         |
| -------------- | -------- | -------- | ------------ | ----- | ----------------------------------- |
| participantIds | [string] | true     | none         |       | ID của thành viên cần thêm vào nhóm |

<h2 id="tocS_Error_400_Auth_Refresh_Schema">Error_400_Auth_Refresh_Schema</h2>

<a id="schemaerror_400_auth_refresh_schema"></a>
<a id="schema_Error_400_Auth_Refresh_Schema"></a>
<a id="tocSerror_400_auth_refresh_schema"></a>
<a id="tocserror_400_auth_refresh_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Làm mới access token thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_UpdateGroupAvatarDto">UpdateGroupAvatarDto</h2>

<a id="schemaupdategroupavatardto"></a>
<a id="schema_UpdateGroupAvatarDto"></a>
<a id="tocSupdategroupavatardto"></a>
<a id="tocsupdategroupavatardto"></a>

```json
{
  "avatar": "string"
}
```

### Attribute

| Name   | Type           | Required | Restrictions | Title | Description                  |
| ------ | -------------- | -------- | ------------ | ----- | ---------------------------- |
| avatar | string(binary) | true     | none         |       | Ảnh đại diện của nhóm (file) |

<h2 id="tocS_Error_401_Auth_Refresh_Schema">Error_401_Auth_Refresh_Schema</h2>

<a id="schemaerror_401_auth_refresh_schema"></a>
<a id="schema_Error_401_Auth_Refresh_Schema"></a>
<a id="tocSerror_401_auth_refresh_schema"></a>
<a id="tocserror_401_auth_refresh_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Auth_Logout_Schema">Success_Auth_Logout_Schema</h2>

<a id="schemasuccess_auth_logout_schema"></a>
<a id="schema_Success_Auth_Logout_Schema"></a>
<a id="tocSsuccess_auth_logout_schema"></a>
<a id="tocssuccess_auth_logout_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description       |
| ---------- | ------ | -------- | ------------ | ----- | ----------------- |
| statusCode | number | true     | none         |       | HTTP status code  |
| message    | string | true     | none         |       | Thông báo kết quả |
| data       | object | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Auth_Logout_Schema">Error_400_Auth_Logout_Schema</h2>

<a id="schemaerror_400_auth_logout_schema"></a>
<a id="schema_Error_400_Auth_Logout_Schema"></a>
<a id="tocSerror_400_auth_logout_schema"></a>
<a id="tocserror_400_auth_logout_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Đăng xuất thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Auth_Logout_Schema">Error_401_Auth_Logout_Schema</h2>

<a id="schemaerror_401_auth_logout_schema"></a>
<a id="schema_Error_401_Auth_Logout_Schema"></a>
<a id="tocSerror_401_auth_logout_schema"></a>
<a id="tocserror_401_auth_logout_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Auth_Forgot_Password_Schema">Success_Auth_Forgot_Password_Schema</h2>

<a id="schemasuccess_auth_forgot_password_schema"></a>
<a id="schema_Success_Auth_Forgot_Password_Schema"></a>
<a id="tocSsuccess_auth_forgot_password_schema"></a>
<a id="tocssuccess_auth_forgot_password_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description       |
| ---------- | ------ | -------- | ------------ | ----- | ----------------- |
| statusCode | number | true     | none         |       | HTTP status code  |
| message    | string | true     | none         |       | Thông báo kết quả |
| data       | object | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Auth_Forgot_Password_Schema">Error_400_Auth_Forgot_Password_Schema</h2>

<a id="schemaerror_400_auth_forgot_password_schema"></a>
<a id="schema_Error_400_Auth_Forgot_Password_Schema"></a>
<a id="tocSerror_400_auth_forgot_password_schema"></a>
<a id="tocserror_400_auth_forgot_password_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Quên mật khẩu thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Auth_Reset_Password_Schema">Success_Auth_Reset_Password_Schema</h2>

<a id="schemasuccess_auth_reset_password_schema"></a>
<a id="schema_Success_Auth_Reset_Password_Schema"></a>
<a id="tocSsuccess_auth_reset_password_schema"></a>
<a id="tocssuccess_auth_reset_password_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "profileId": "a8ac4a50e79eb911baca20b8"
  }
}
```

### Attribute

| Name       | Type                                                      | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                    | true     | none         |       | HTTP status code  |
| message    | string                                                    | true     | none         |       | Thông báo kết quả |
| data       | [GetProfileIdResponseDTO](#schemagetprofileidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Auth_Reset_Password_Schema">Error_400_Auth_Reset_Password_Schema</h2>

<a id="schemaerror_400_auth_reset_password_schema"></a>
<a id="schema_Error_400_Auth_Reset_Password_Schema"></a>
<a id="tocSerror_400_auth_reset_password_schema"></a>
<a id="tocserror_400_auth_reset_password_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Đặt lại mật khẩu thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_GetProfileDTO">GetProfileDTO</h2>

<a id="schemagetprofiledto"></a>
<a id="schema_GetProfileDTO"></a>
<a id="tocSgetprofiledto"></a>
<a id="tocsgetprofiledto"></a>

```json
{
  "id": "4d8ff6814e4dae9e07caccc2",
  "name": "Irma Swaniawski",
  "avatar": "https://robust-exploration.biz/",
  "bio": "veteran, streamer, engineer",
  "role": "USER",
  "phone": "442.951.2803 x835",
  "gender": "M",
  "birthday": "1989-04-12T22:13:24.856Z",
  "email": "Neha_Sipes8@gmail.com",
  "username": "Sabina.Wehner89",
  "accountID": "d0a92ee180cafb5d902fdbab",
  "isSetup": true
}
```

### Attribute

| Name      | Type        | Required | Restrictions | Title | Description                  |
| --------- | ----------- | -------- | ------------ | ----- | ---------------------------- |
| id        | string      | true     | none         |       | ID của profile               |
| name      | string      | true     | none         |       | Tên người dùng               |
| avatar    | string      | true     | none         |       | URL ảnh đại diện             |
| bio       | string      | true     | none         |       | Tiểu sử người dùng           |
| role      | string      | true     | none         |       | Vai trò của người dùng       |
| phone     | string      | true     | none         |       | Số điện thoại                |
| gender    | string      | true     | none         |       | Giới tính                    |
| birthday  | object¦null | true     | none         |       | Ngày sinh                    |
| email     | string      | true     | none         |       | Email người dùng             |
| username  | string      | true     | none         |       | Tên đăng nhập                |
| accountID | string      | true     | none         |       | ID của tài khoản             |
| isSetup   | boolean     | true     | none         |       | Trạng thái thiết lập profile |

#### Enum

| Name   | Value |
| ------ | ----- |
| gender | M     |
| gender | F     |

<h2 id="tocS_Success_Profile_Get_My_Profile_Schema">Success_Profile_Get_My_Profile_Schema</h2>

<a id="schemasuccess_profile_get_my_profile_schema"></a>
<a id="schema_Success_Profile_Get_My_Profile_Schema"></a>
<a id="tocSsuccess_profile_get_my_profile_schema"></a>
<a id="tocssuccess_profile_get_my_profile_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Attribute

| Name       | Type                                  | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                | true     | none         |       | HTTP status code  |
| message    | string                                | true     | none         |       | Thông báo kết quả |
| data       | [GetProfileDTO](#schemagetprofiledto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Profile_Get_My_Profile_Schema">Error_400_Profile_Get_My_Profile_Schema</h2>

<a id="schemaerror_400_profile_get_my_profile_schema"></a>
<a id="schema_Error_400_Profile_Get_My_Profile_Schema"></a>
<a id="tocSerror_400_profile_get_my_profile_schema"></a>
<a id="tocserror_400_profile_get_my_profile_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy thông tin profile thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Profile_Get_My_Profile_Schema">Error_401_Profile_Get_My_Profile_Schema</h2>

<a id="schemaerror_401_profile_get_my_profile_schema"></a>
<a id="schema_Error_401_Profile_Get_My_Profile_Schema"></a>
<a id="tocSerror_401_profile_get_my_profile_schema"></a>
<a id="tocserror_401_profile_get_my_profile_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_GetProfileIdResponseDTO">GetProfileIdResponseDTO</h2>

<a id="schemagetprofileidresponsedto"></a>
<a id="schema_GetProfileIdResponseDTO"></a>
<a id="tocSgetprofileidresponsedto"></a>
<a id="tocsgetprofileidresponsedto"></a>

```json
{
  "profileId": "a8ac4a50e79eb911baca20b8"
}
```

### Attribute

| Name      | Type   | Required | Restrictions | Title | Description    |
| --------- | ------ | -------- | ------------ | ----- | -------------- |
| profileId | string | true     | none         |       | ID của profile |

<h2 id="tocS_Success_Profile_Update_My_Profile_Schema">Success_Profile_Update_My_Profile_Schema</h2>

<a id="schemasuccess_profile_update_my_profile_schema"></a>
<a id="schema_Success_Profile_Update_My_Profile_Schema"></a>
<a id="tocSsuccess_profile_update_my_profile_schema"></a>
<a id="tocssuccess_profile_update_my_profile_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "profileId": "a8ac4a50e79eb911baca20b8"
  }
}
```

### Attribute

| Name       | Type                                                      | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                    | true     | none         |       | HTTP status code  |
| message    | string                                                    | true     | none         |       | Thông báo kết quả |
| data       | [GetProfileIdResponseDTO](#schemagetprofileidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Profile_Update_My_Profile_Schema">Error_400_Profile_Update_My_Profile_Schema</h2>

<a id="schemaerror_400_profile_update_my_profile_schema"></a>
<a id="schema_Error_400_Profile_Update_My_Profile_Schema"></a>
<a id="tocSerror_400_profile_update_my_profile_schema"></a>
<a id="tocserror_400_profile_update_my_profile_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Cập nhật profile thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Profile_Update_My_Profile_Schema">Error_401_Profile_Update_My_Profile_Schema</h2>

<a id="schemaerror_401_profile_update_my_profile_schema"></a>
<a id="schema_Error_401_Profile_Update_My_Profile_Schema"></a>
<a id="tocSerror_401_profile_update_my_profile_schema"></a>
<a id="tocserror_401_profile_update_my_profile_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Profile_Get_Profile_By_ID_Schema">Success_Profile_Get_Profile_By_ID_Schema</h2>

<a id="schemasuccess_profile_get_profile_by_id_schema"></a>
<a id="schema_Success_Profile_Get_Profile_By_ID_Schema"></a>
<a id="tocSsuccess_profile_get_profile_by_id_schema"></a>
<a id="tocssuccess_profile_get_profile_by_id_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Attribute

| Name       | Type                                  | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                | true     | none         |       | HTTP status code  |
| message    | string                                | true     | none         |       | Thông báo kết quả |
| data       | [GetProfileDTO](#schemagetprofiledto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Profile_Get_Profile_By_ID_Schema">Error_400_Profile_Get_Profile_By_ID_Schema</h2>

<a id="schemaerror_400_profile_get_profile_by_id_schema"></a>
<a id="schema_Error_400_Profile_Get_Profile_By_ID_Schema"></a>
<a id="tocSerror_400_profile_get_profile_by_id_schema"></a>
<a id="tocserror_400_profile_get_profile_by_id_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy thông tin profile thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Profile_Get_Profile_By_ID_Schema">Error_401_Profile_Get_Profile_By_ID_Schema</h2>

<a id="schemaerror_401_profile_get_profile_by_id_schema"></a>
<a id="schema_Error_401_Profile_Get_Profile_By_ID_Schema"></a>
<a id="tocSerror_401_profile_get_profile_by_id_schema"></a>
<a id="tocserror_401_profile_get_profile_by_id_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Profile_Find_Profile_By_Username_Schema">Success_Profile_Find_Profile_By_Username_Schema</h2>

<a id="schemasuccess_profile_find_profile_by_username_schema"></a>
<a id="schema_Success_Profile_Find_Profile_By_Username_Schema"></a>
<a id="tocSsuccess_profile_find_profile_by_username_schema"></a>
<a id="tocssuccess_profile_find_profile_by_username_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "4d8ff6814e4dae9e07caccc2",
    "name": "Irma Swaniawski",
    "avatar": "https://robust-exploration.biz/",
    "bio": "veteran, streamer, engineer",
    "role": "USER",
    "phone": "442.951.2803 x835",
    "gender": "M",
    "birthday": "1989-04-12T22:13:24.856Z",
    "email": "Neha_Sipes8@gmail.com",
    "username": "Sabina.Wehner89",
    "accountID": "d0a92ee180cafb5d902fdbab",
    "isSetup": true
  }
}
```

### Attribute

| Name       | Type                                  | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                | true     | none         |       | HTTP status code  |
| message    | string                                | true     | none         |       | Thông báo kết quả |
| data       | [GetProfileDTO](#schemagetprofiledto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Profile_Find_Profile_By_Username_Schema">Error_400_Profile_Find_Profile_By_Username_Schema</h2>

<a id="schemaerror_400_profile_find_profile_by_username_schema"></a>
<a id="schema_Error_400_Profile_Find_Profile_By_Username_Schema"></a>
<a id="tocSerror_400_profile_find_profile_by_username_schema"></a>
<a id="tocserror_400_profile_find_profile_by_username_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Tìm kiếm profile thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Profile_Find_Profile_By_Username_Schema">Error_401_Profile_Find_Profile_By_Username_Schema</h2>

<a id="schemaerror_401_profile_find_profile_by_username_schema"></a>
<a id="schema_Error_401_Profile_Find_Profile_By_Username_Schema"></a>
<a id="tocSerror_401_profile_find_profile_by_username_schema"></a>
<a id="tocserror_401_profile_find_profile_by_username_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Account_Password_Schema">Success_Account_Password_Schema</h2>

<a id="schemasuccess_account_password_schema"></a>
<a id="schema_Success_Account_Password_Schema"></a>
<a id="tocSsuccess_account_password_schema"></a>
<a id="tocssuccess_account_password_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description       |
| ---------- | ------ | -------- | ------------ | ----- | ----------------- |
| statusCode | number | true     | none         |       | HTTP status code  |
| message    | string | true     | none         |       | Thông báo kết quả |
| data       | object | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Account_Password_Schema">Error_400_Account_Password_Schema</h2>

<a id="schemaerror_400_account_password_schema"></a>
<a id="schema_Error_400_Account_Password_Schema"></a>
<a id="tocSerror_400_account_password_schema"></a>
<a id="tocserror_400_account_password_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Cập nhật mật khẩu thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Account_Password_Schema">Error_401_Account_Password_Schema</h2>

<a id="schemaerror_401_account_password_schema"></a>
<a id="schema_Error_401_Account_Password_Schema"></a>
<a id="tocSerror_401_account_password_schema"></a>
<a id="tocserror_401_account_password_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CreateFriendshipDTO">CreateFriendshipDTO</h2>

<a id="schemacreatefriendshipdto"></a>
<a id="schema_CreateFriendshipDTO"></a>
<a id="tocScreatefriendshipdto"></a>
<a id="tocscreatefriendshipdto"></a>

```json
{
  "receiverId": "b1cc74df4f22c9f0d870e002"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description                       |
| ---------- | ------ | -------- | ------------ | ----- | --------------------------------- |
| receiverId | string | true     | none         |       | ID của người nhận lời mời kết bạn |

<h2 id="tocS_CreateFriendshipResponseDTO">CreateFriendshipResponseDTO</h2>

<a id="schemacreatefriendshipresponsedto"></a>
<a id="schema_CreateFriendshipResponseDTO"></a>
<a id="tocScreatefriendshipresponsedto"></a>
<a id="tocscreatefriendshipresponsedto"></a>

```json
{
  "friendshipId": "ba39e4a19738f4c3a5ff8781"
}
```

### Attribute

| Name         | Type   | Required | Restrictions | Title | Description            |
| ------------ | ------ | -------- | ------------ | ----- | ---------------------- |
| friendshipId | string | true     | none         |       | ID của lời mời kết bạn |

<h2 id="tocS_Success_Friend_Send_Friend_Request_Schema">Success_Friend_Send_Friend_Request_Schema</h2>

<a id="schemasuccess_friend_send_friend_request_schema"></a>
<a id="schema_Success_Friend_Send_Friend_Request_Schema"></a>
<a id="tocSsuccess_friend_send_friend_request_schema"></a>
<a id="tocssuccess_friend_send_friend_request_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "friendshipId": "ba39e4a19738f4c3a5ff8781"
  }
}
```

### Attribute

| Name       | Type                                                              | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                            | true     | none         |       | HTTP status code  |
| message    | string                                                            | true     | none         |       | Thông báo kết quả |
| data       | [CreateFriendshipResponseDTO](#schemacreatefriendshipresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Send_Friend_Request_Schema">Error_400_Friend_Send_Friend_Request_Schema</h2>

<a id="schemaerror_400_friend_send_friend_request_schema"></a>
<a id="schema_Error_400_Friend_Send_Friend_Request_Schema"></a>
<a id="tocSerror_400_friend_send_friend_request_schema"></a>
<a id="tocserror_400_friend_send_friend_request_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Gửi yêu cầu kết bạn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Send_Friend_Request_Schema">Error_401_Friend_Send_Friend_Request_Schema</h2>

<a id="schemaerror_401_friend_send_friend_request_schema"></a>
<a id="schema_Error_401_Friend_Send_Friend_Request_Schema"></a>
<a id="tocSerror_401_friend_send_friend_request_schema"></a>
<a id="tocserror_401_friend_send_friend_request_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Friend_Get_Received_Requests_Schema">Success_Friend_Get_Received_Requests_Schema</h2>

<a id="schemasuccess_friend_get_received_requests_schema"></a>
<a id="schema_Success_Friend_Get_Received_Requests_Schema"></a>
<a id="tocSsuccess_friend_get_received_requests_schema"></a>
<a id="tocssuccess_friend_get_received_requests_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Attribute

| Name       | Type                                      | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                    | true     | none         |       | HTTP status code  |
| message    | string                                    | true     | none         |       | Thông báo kết quả |
| data       | [[FriendResponse](#schemafriendresponse)] | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Get_Received_Requests_Schema">Error_400_Friend_Get_Received_Requests_Schema</h2>

<a id="schemaerror_400_friend_get_received_requests_schema"></a>
<a id="schema_Error_400_Friend_Get_Received_Requests_Schema"></a>
<a id="tocSerror_400_friend_get_received_requests_schema"></a>
<a id="tocserror_400_friend_get_received_requests_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy danh sách yêu cầu kết bạn đã nhận thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Get_Received_Requests_Schema">Error_401_Friend_Get_Received_Requests_Schema</h2>

<a id="schemaerror_401_friend_get_received_requests_schema"></a>
<a id="schema_Error_401_Friend_Get_Received_Requests_Schema"></a>
<a id="tocSerror_401_friend_get_received_requests_schema"></a>
<a id="tocserror_401_friend_get_received_requests_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Friend_Get_Sent_Requests_Schema">Success_Friend_Get_Sent_Requests_Schema</h2>

<a id="schemasuccess_friend_get_sent_requests_schema"></a>
<a id="schema_Success_Friend_Get_Sent_Requests_Schema"></a>
<a id="tocSsuccess_friend_get_sent_requests_schema"></a>
<a id="tocssuccess_friend_get_sent_requests_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Attribute

| Name       | Type                                      | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                    | true     | none         |       | HTTP status code  |
| message    | string                                    | true     | none         |       | Thông báo kết quả |
| data       | [[FriendResponse](#schemafriendresponse)] | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Get_Sent_Requests_Schema">Error_400_Friend_Get_Sent_Requests_Schema</h2>

<a id="schemaerror_400_friend_get_sent_requests_schema"></a>
<a id="schema_Error_400_Friend_Get_Sent_Requests_Schema"></a>
<a id="tocSerror_400_friend_get_sent_requests_schema"></a>
<a id="tocserror_400_friend_get_sent_requests_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy danh sách yêu cầu kết bạn đã gửi thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Get_Sent_Requests_Schema">Error_401_Friend_Get_Sent_Requests_Schema</h2>

<a id="schemaerror_401_friend_get_sent_requests_schema"></a>
<a id="schema_Error_401_Friend_Get_Sent_Requests_Schema"></a>
<a id="tocSerror_401_friend_get_sent_requests_schema"></a>
<a id="tocserror_401_friend_get_sent_requests_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_HandleFriendRequestDTO">HandleFriendRequestDTO</h2>

<a id="schemahandlefriendrequestdto"></a>
<a id="schema_HandleFriendRequestDTO"></a>
<a id="tocShandlefriendrequestdto"></a>
<a id="tocshandlefriendrequestdto"></a>

```json
{
  "action": "ACCEPT"
}
```

### Attribute

| Name   | Type   | Required | Restrictions | Title | Description                     |
| ------ | ------ | -------- | ------------ | ----- | ------------------------------- |
| action | string | true     | none         |       | Hành động xử lý yêu cầu kết bạn |

#### Enum

| Name   | Value  |
| ------ | ------ |
| action | ACCEPT |
| action | REJECT |

<h2 id="tocS_Success_Friend_Handle_Friend_Request_Schema">Success_Friend_Handle_Friend_Request_Schema</h2>

<a id="schemasuccess_friend_handle_friend_request_schema"></a>
<a id="schema_Success_Friend_Handle_Friend_Request_Schema"></a>
<a id="tocSsuccess_friend_handle_friend_request_schema"></a>
<a id="tocssuccess_friend_handle_friend_request_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "friendshipId": "ba39e4a19738f4c3a5ff8781"
  }
}
```

### Attribute

| Name       | Type                                                              | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                            | true     | none         |       | HTTP status code  |
| message    | string                                                            | true     | none         |       | Thông báo kết quả |
| data       | [CreateFriendshipResponseDTO](#schemacreatefriendshipresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Handle_Friend_Request_Schema">Error_400_Friend_Handle_Friend_Request_Schema</h2>

<a id="schemaerror_400_friend_handle_friend_request_schema"></a>
<a id="schema_Error_400_Friend_Handle_Friend_Request_Schema"></a>
<a id="tocSerror_400_friend_handle_friend_request_schema"></a>
<a id="tocserror_400_friend_handle_friend_request_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xử lý yêu cầu kết bạn thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Handle_Friend_Request_Schema">Error_401_Friend_Handle_Friend_Request_Schema</h2>

<a id="schemaerror_401_friend_handle_friend_request_schema"></a>
<a id="schema_Error_401_Friend_Handle_Friend_Request_Schema"></a>
<a id="tocSerror_401_friend_handle_friend_request_schema"></a>
<a id="tocserror_401_friend_handle_friend_request_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Friend_Get_Friends_Schema">Success_Friend_Get_Friends_Schema</h2>

<a id="schemasuccess_friend_get_friends_schema"></a>
<a id="schema_Success_Friend_Get_Friends_Schema"></a>
<a id="tocSsuccess_friend_get_friends_schema"></a>
<a id="tocssuccess_friend_get_friends_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "b1b4d6dc8f1b07ce3dfe13c6",
      "profileId": "bcabfa1f6d85fd6cbaad6468",
      "name": "Loren Ryan",
      "avatar": "https://avatars.githubusercontent.com/u/40136905",
      "bio": "fog junkie, leader",
      "phone": "0971498233",
      "email": "Melba_Abernathy97@gmail.com",
      "birthday": "2002-08-14T22:39:47.293Z"
    }
  ]
}
```

### Attribute

| Name       | Type                                      | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                    | true     | none         |       | HTTP status code  |
| message    | string                                    | true     | none         |       | Thông báo kết quả |
| data       | [[FriendResponse](#schemafriendresponse)] | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Get_Friends_Schema">Error_400_Friend_Get_Friends_Schema</h2>

<a id="schemaerror_400_friend_get_friends_schema"></a>
<a id="schema_Error_400_Friend_Get_Friends_Schema"></a>
<a id="tocSerror_400_friend_get_friends_schema"></a>
<a id="tocserror_400_friend_get_friends_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy danh sách bạn bè thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Get_Friends_Schema">Error_401_Friend_Get_Friends_Schema</h2>

<a id="schemaerror_401_friend_get_friends_schema"></a>
<a id="schema_Error_401_Friend_Get_Friends_Schema"></a>
<a id="tocSerror_401_friend_get_friends_schema"></a>
<a id="tocserror_401_friend_get_friends_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Friend_Delete_Friendship_Schema">Success_Friend_Delete_Friendship_Schema</h2>

<a id="schemasuccess_friend_delete_friendship_schema"></a>
<a id="schema_Success_Friend_Delete_Friendship_Schema"></a>
<a id="tocSsuccess_friend_delete_friendship_schema"></a>
<a id="tocssuccess_friend_delete_friendship_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description       |
| ---------- | ------ | -------- | ------------ | ----- | ----------------- |
| statusCode | number | true     | none         |       | HTTP status code  |
| message    | string | true     | none         |       | Thông báo kết quả |
| data       | object | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Delete_Friendship_Schema">Error_400_Friend_Delete_Friendship_Schema</h2>

<a id="schemaerror_400_friend_delete_friendship_schema"></a>
<a id="schema_Error_400_Friend_Delete_Friendship_Schema"></a>
<a id="tocSerror_400_friend_delete_friendship_schema"></a>
<a id="tocserror_400_friend_delete_friendship_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xóa mối quan hệ bạn bè thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Delete_Friendship_Schema">Error_401_Friend_Delete_Friendship_Schema</h2>

<a id="schemaerror_401_friend_delete_friendship_schema"></a>
<a id="schema_Error_401_Friend_Delete_Friendship_Schema"></a>
<a id="tocSerror_401_friend_delete_friendship_schema"></a>
<a id="tocserror_401_friend_delete_friendship_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_UserSearchResponseDTO">UserSearchResponseDTO</h2>

<a id="schemausersearchresponsedto"></a>
<a id="schema_UserSearchResponseDTO"></a>
<a id="tocSusersearchresponsedto"></a>
<a id="tocsusersearchresponsedto"></a>

```json
{
  "id": "profile-id",
  "username": "user123",
  "name": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg",
  "relation": "NONE"
}
```

### Attribute

| Name     | Type        | Required | Restrictions | Title | Description                                    |
| -------- | ----------- | -------- | ------------ | ----- | ---------------------------------------------- |
| id       | string      | true     | none         |       | ID của người dùng                              |
| username | string      | true     | none         |       | Tên đăng nhập                                  |
| name     | object¦null | false    | none         |       | Tên hiển thị của người dùng                    |
| avatar   | object¦null | false    | none         |       | URL hình đại diện của người dùng               |
| relation | string      | false    | none         |       | Trạng thái mối quan hệ với người dùng hiện tại |

#### Enum

| Name     | Value            |
| -------- | ---------------- |
| relation | NONE             |
| relation | FRIEND           |
| relation | PENDING_SENT     |
| relation | PENDING_RECEIVED |
| relation | REJECTED         |

<h2 id="tocS_Success_Friend_Search_User_Schema">Success_Friend_Search_User_Schema</h2>

<a id="schemasuccess_friend_search_user_schema"></a>
<a id="schema_Success_Friend_Search_User_Schema"></a>
<a id="tocSsuccess_friend_search_user_schema"></a>
<a id="tocssuccess_friend_search_user_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "profile-id",
      "username": "user123",
      "name": "Nguyễn Văn A",
      "avatar": "https://example.com/avatar.jpg",
      "relation": "NONE"
    }
  ]
}
```

### Attribute

| Name       | Type                                                    | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                  | true     | none         |       | HTTP status code  |
| message    | string                                                  | true     | none         |       | Thông báo kết quả |
| data       | [[UserSearchResponseDTO](#schemausersearchresponsedto)] | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Search_User_Schema">Error_400_Friend_Search_User_Schema</h2>

<a id="schemaerror_400_friend_search_user_schema"></a>
<a id="schema_Error_400_Friend_Search_User_Schema"></a>
<a id="tocSerror_400_friend_search_user_schema"></a>
<a id="tocserror_400_friend_search_user_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Tìm kiếm người dùng thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Search_User_Schema">Error_401_Friend_Search_User_Schema</h2>

<a id="schemaerror_401_friend_search_user_schema"></a>
<a id="schema_Error_401_Friend_Search_User_Schema"></a>
<a id="tocSerror_401_friend_search_user_schema"></a>
<a id="tocserror_401_friend_search_user_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CheckFriendshipResponseDto">CheckFriendshipResponseDto</h2>

<a id="schemacheckfriendshipresponsedto"></a>
<a id="schema_CheckFriendshipResponseDto"></a>
<a id="tocScheckfriendshipresponsedto"></a>
<a id="tocscheckfriendshipresponsedto"></a>

```json
{
  "isFriend": true
}
```

### Attribute

| Name     | Type    | Required | Restrictions | Title | Description                   |
| -------- | ------- | -------- | ------------ | ----- | ----------------------------- |
| isFriend | boolean | true     | none         |       | Trạng thái mối quan hệ bạn bè |

<h2 id="tocS_Success_Friend_Check_Friendship_Schema">Success_Friend_Check_Friendship_Schema</h2>

<a id="schemasuccess_friend_check_friendship_schema"></a>
<a id="schema_Success_Friend_Check_Friendship_Schema"></a>
<a id="tocSsuccess_friend_check_friendship_schema"></a>
<a id="tocssuccess_friend_check_friendship_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "isFriend": true
  }
}
```

### Attribute

| Name       | Type                                                            | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                                          | true     | none         |       | HTTP status code  |
| message    | string                                                          | true     | none         |       | Thông báo kết quả |
| data       | [CheckFriendshipResponseDto](#schemacheckfriendshipresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Friend_Check_Friendship_Schema">Error_400_Friend_Check_Friendship_Schema</h2>

<a id="schemaerror_400_friend_check_friendship_schema"></a>
<a id="schema_Error_400_Friend_Check_Friendship_Schema"></a>
<a id="tocSerror_400_friend_check_friendship_schema"></a>
<a id="tocserror_400_friend_check_friendship_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Kiểm tra mối quan hệ bạn bè thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Friend_Check_Friendship_Schema">Error_401_Friend_Check_Friendship_Schema</h2>

<a id="schemaerror_401_friend_check_friendship_schema"></a>
<a id="schema_Error_401_Friend_Check_Friendship_Schema"></a>
<a id="tocSerror_401_friend_check_friendship_schema"></a>
<a id="tocserror_401_friend_check_friendship_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_CreateGroupDTO">CreateGroupDTO</h2>

<a id="schemacreategroupdto"></a>
<a id="schema_CreateGroupDTO"></a>
<a id="tocScreategroupdto"></a>
<a id="tocscreategroupdto"></a>

```json
{
  "name": "Nhóm học tập",
  "participantIds": ["61a70eb005ffedbb86da6fc7", "fa517bc5cfcbc72e2fd6addd"],
  "isGroup": true
}
```

### Attribute

| Name           | Type     | Required | Restrictions | Title | Description                                                |
| -------------- | -------- | -------- | ------------ | ----- | ---------------------------------------------------------- |
| name           | string   | false    | none         |       | Tên của nhóm                                               |
| participantIds | [string] | true     | none         |       | Danh sách ID của thành viên tham gia nhóm                  |
| isGroup        | boolean  | false    | none         |       | Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp |

<h2 id="tocS_GroupIdResponseDTO">GroupIdResponseDTO</h2>

<a id="schemagroupidresponsedto"></a>
<a id="schema_GroupIdResponseDTO"></a>
<a id="tocSgroupidresponsedto"></a>
<a id="tocsgroupidresponsedto"></a>

```json
{
  "groupId": "4baaff3dac5e034bf6afb215"
}
```

### Attribute

| Name    | Type   | Required | Restrictions | Title | Description |
| ------- | ------ | -------- | ------------ | ----- | ----------- |
| groupId | string | true     | none         |       | ID của nhóm |

<h2 id="tocS_Success_Group_Create_Group_Schema">Success_Group_Create_Group_Schema</h2>

<a id="schemasuccess_group_create_group_schema"></a>
<a id="schema_Success_Group_Create_Group_Schema"></a>
<a id="tocSsuccess_group_create_group_schema"></a>
<a id="tocssuccess_group_create_group_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Create_Group_Schema">Error_400_Group_Create_Group_Schema</h2>

<a id="schemaerror_400_group_create_group_schema"></a>
<a id="schema_Error_400_Group_Create_Group_Schema"></a>
<a id="tocSerror_400_group_create_group_schema"></a>
<a id="tocserror_400_group_create_group_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Create_Group_Schema">Error_401_Group_Create_Group_Schema</h2>

<a id="schemaerror_401_group_create_group_schema"></a>
<a id="schema_Error_401_Group_Create_Group_Schema"></a>
<a id="tocSerror_401_group_create_group_schema"></a>
<a id="tocserror_401_group_create_group_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_ParticipantDTO">ParticipantDTO</h2>

<a id="schemaparticipantdto"></a>
<a id="schema_ParticipantDTO"></a>
<a id="tocSparticipantdto"></a>
<a id="tocsparticipantdto"></a>

```json
{
  "id": "de28d19bea9e38f7effc8e92",
  "profileId": "e6f35ba74ad9f03f7b69ab68",
  "role": "OWNER",
  "name": "Franklin Schuster",
  "avatar": "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/25.jpg"
}
```

### Attribute

| Name      | Type        | Required | Restrictions | Title | Description                  |
| --------- | ----------- | -------- | ------------ | ----- | ---------------------------- |
| id        | string      | true     | none         |       | ID của thành viên trong nhóm |
| profileId | string      | true     | none         |       | ID của hồ sơ người dùng      |
| role      | string      | true     | none         |       | Vai trò trong nhóm           |
| name      | object¦null | true     | none         |       | Tên người dùng               |
| avatar    | object¦null | true     | none         |       | Ảnh đại diện                 |

#### Enum

| Name | Value  |
| ---- | ------ |
| role | OWNER  |
| role | MEMBER |

<h2 id="tocS_MessageDTO">MessageDTO</h2>

<a id="schemamessagedto"></a>
<a id="schema_MessageDTO"></a>
<a id="tocSmessagedto"></a>
<a id="tocsmessagedto"></a>

```json
{
  "id": "ebcc0b8b3eb1f413fdae7ac9",
  "content": "Voluptates timor sonitus vero talio.",
  "senderId": "da504edaabb6b11271dafd1d",
  "fileUrl": "https://picsum.photos/seed/TZO0C/2701/3235",
  "createdAt": "2025-05-12T14:22:10.271Z",
  "updatedAt": "2025-05-12T12:49:42.137Z",
  "isRecalled": false,
  "type": "TEXT",
  "fileName": "document.pdf"
}
```

### Attribute

| Name       | Type              | Required | Restrictions | Title | Description                 |
| ---------- | ----------------- | -------- | ------------ | ----- | --------------------------- |
| id         | string            | true     | none         |       | ID của tin nhắn             |
| content    | string            | true     | none         |       | Nội dung tin nhắn           |
| senderId   | string            | true     | none         |       | ID của người gửi            |
| fileUrl    | object¦null       | true     | none         |       | URL của tệp đính kèm        |
| createdAt  | string(date-time) | true     | none         |       | Thời gian tạo tin nhắn      |
| updatedAt  | string(date-time) | true     | none         |       | Thời gian cập nhật tin nhắn |
| isRecalled | boolean           | true     | none         |       | Trạng thái thu hồi tin nhắn |
| type       | string            | true     | none         |       | Loại tin nhắn               |
| fileName   | object¦null       | true     | none         |       | Tên tệp đính kèm            |

<h2 id="tocS_GroupResponseDTO">GroupResponseDTO</h2>

<a id="schemagroupresponsedto"></a>
<a id="schema_GroupResponseDTO"></a>
<a id="tocSgroupresponsedto"></a>
<a id="tocsgroupresponsedto"></a>

```json
{
  "id": "ce5cedd3c19185d96fa67750",
  "name": "petty furlough drat",
  "ownerId": "7e032a41eff088ed7ee55d33",
  "isGroup": true,
  "createdAt": "2024-06-16T08:57:04.657Z",
  "updatedAt": "2025-05-11T21:59:18.153Z",
  "participants": [
    {
      "id": "de28d19bea9e38f7effc8e92",
      "profileId": "e6f35ba74ad9f03f7b69ab68",
      "role": "OWNER",
      "name": "Franklin Schuster",
      "avatar": "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/25.jpg"
    }
  ],
  "lastMessage": {
    "id": "ebcc0b8b3eb1f413fdae7ac9",
    "content": "Voluptates timor sonitus vero talio.",
    "senderId": "da504edaabb6b11271dafd1d",
    "fileUrl": "https://picsum.photos/seed/TZO0C/2701/3235",
    "createdAt": "2025-05-12T14:22:10.271Z",
    "updatedAt": "2025-05-12T12:49:42.137Z",
    "isRecalled": false,
    "type": "TEXT",
    "fileName": "document.pdf"
  }
}
```

### Attribute

| Name         | Type                                      | Required | Restrictions | Title | Description                                                |
| ------------ | ----------------------------------------- | -------- | ------------ | ----- | ---------------------------------------------------------- |
| id           | string                                    | true     | none         |       | ID của nhóm                                                |
| name         | object¦null                               | true     | none         |       | Tên nhóm                                                   |
| ownerId      | string                                    | true     | none         |       | ID của chủ nhóm                                            |
| isGroup      | boolean                                   | true     | none         |       | Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp |
| createdAt    | string(date-time)                         | true     | none         |       | Thời gian tạo nhóm                                         |
| updatedAt    | string(date-time)                         | true     | none         |       | Thời gian cập nhật nhóm                                    |
| participants | [[ParticipantDTO](#schemaparticipantdto)] | true     | none         |       | Danh sách thành viên trong nhóm                            |
| lastMessage  | [MessageDTO](#schemamessagedto)           | true     | none         |       | Tin nhắn gần nhất trong nhóm                               |

<h2 id="tocS_Success_Group_Get_Groups_Schema">Success_Group_Get_Groups_Schema</h2>

<a id="schemasuccess_group_get_groups_schema"></a>
<a id="schema_Success_Group_Get_Groups_Schema"></a>
<a id="tocSsuccess_group_get_groups_schema"></a>
<a id="tocssuccess_group_get_groups_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "ce5cedd3c19185d96fa67750",
      "name": "petty furlough drat",
      "ownerId": "7e032a41eff088ed7ee55d33",
      "isGroup": true,
      "createdAt": "2024-06-16T08:57:04.657Z",
      "updatedAt": "2025-05-11T21:59:18.153Z",
      "participants": [
        {
          "id": "de28d19bea9e38f7effc8e92",
          "profileId": "e6f35ba74ad9f03f7b69ab68",
          "role": "OWNER",
          "name": "Franklin Schuster",
          "avatar": "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/25.jpg"
        }
      ],
      "lastMessage": {
        "id": "[",
        "content": "[",
        "senderId": "[",
        "fileUrl": "[",
        "createdAt": "[",
        "updatedAt": "[",
        "isRecalled": "[",
        "type": "[",
        "fileName": "["
      }
    }
  ]
}
```

### Attribute

| Name       | Type                                          | Required | Restrictions | Title | Description       |
| ---------- | --------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                        | true     | none         |       | HTTP status code  |
| message    | string                                        | true     | none         |       | Thông báo kết quả |
| data       | [[GroupResponseDTO](#schemagroupresponsedto)] | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Get_Groups_Schema">Error_400_Group_Get_Groups_Schema</h2>

<a id="schemaerror_400_group_get_groups_schema"></a>
<a id="schema_Error_400_Group_Get_Groups_Schema"></a>
<a id="tocSerror_400_group_get_groups_schema"></a>
<a id="tocserror_400_group_get_groups_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Lấy danh sách nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Get_Groups_Schema">Error_401_Group_Get_Groups_Schema</h2>

<a id="schemaerror_401_group_get_groups_schema"></a>
<a id="schema_Error_401_Group_Get_Groups_Schema"></a>
<a id="tocSerror_401_group_get_groups_schema"></a>
<a id="tocserror_401_group_get_groups_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_ParticipantIdsDTO">ParticipantIdsDTO</h2>

<a id="schemaparticipantidsdto"></a>
<a id="schema_ParticipantIdsDTO"></a>
<a id="tocSparticipantidsdto"></a>
<a id="tocsparticipantidsdto"></a>

```json
{
  "participantIds": ["21b1529f4a1ec026ed52ee7f", "c9c08b47f929fcb9bb7deb9a"]
}
```

### Attribute

| Name           | Type     | Required | Restrictions | Title | Description                                       |
| -------------- | -------- | -------- | ------------ | ----- | ------------------------------------------------- |
| participantIds | [string] | true     | none         |       | Danh sách ID của các thành viên cần thêm vào nhóm |

<h2 id="tocS_Success_Group_Add_Participant_Schema">Success_Group_Add_Participant_Schema</h2>

<a id="schemasuccess_group_add_participant_schema"></a>
<a id="schema_Success_Group_Add_Participant_Schema"></a>
<a id="tocSsuccess_group_add_participant_schema"></a>
<a id="tocssuccess_group_add_participant_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Add_Participant_Schema">Error_400_Group_Add_Participant_Schema</h2>

<a id="schemaerror_400_group_add_participant_schema"></a>
<a id="schema_Error_400_Group_Add_Participant_Schema"></a>
<a id="tocSerror_400_group_add_participant_schema"></a>
<a id="tocserror_400_group_add_participant_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Thêm thành viên vào nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Add_Participant_Schema">Error_401_Group_Add_Participant_Schema</h2>

<a id="schemaerror_401_group_add_participant_schema"></a>
<a id="schema_Error_401_Group_Add_Participant_Schema"></a>
<a id="tocSerror_401_group_add_participant_schema"></a>
<a id="tocserror_401_group_add_participant_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Group_Remove_Participant_Schema">Success_Group_Remove_Participant_Schema</h2>

<a id="schemasuccess_group_remove_participant_schema"></a>
<a id="schema_Success_Group_Remove_Participant_Schema"></a>
<a id="tocSsuccess_group_remove_participant_schema"></a>
<a id="tocssuccess_group_remove_participant_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Remove_Participant_Schema">Error_400_Group_Remove_Participant_Schema</h2>

<a id="schemaerror_400_group_remove_participant_schema"></a>
<a id="schema_Error_400_Group_Remove_Participant_Schema"></a>
<a id="tocSerror_400_group_remove_participant_schema"></a>
<a id="tocserror_400_group_remove_participant_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xóa thành viên khỏi nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Remove_Participant_Schema">Error_401_Group_Remove_Participant_Schema</h2>

<a id="schemaerror_401_group_remove_participant_schema"></a>
<a id="schema_Error_401_Group_Remove_Participant_Schema"></a>
<a id="tocSerror_401_group_remove_participant_schema"></a>
<a id="tocserror_401_group_remove_participant_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Group_Delete_Group_Schema">Success_Group_Delete_Group_Schema</h2>

<a id="schemasuccess_group_delete_group_schema"></a>
<a id="schema_Success_Group_Delete_Group_Schema"></a>
<a id="tocSsuccess_group_delete_group_schema"></a>
<a id="tocssuccess_group_delete_group_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Delete_Group_Schema">Error_400_Group_Delete_Group_Schema</h2>

<a id="schemaerror_400_group_delete_group_schema"></a>
<a id="schema_Error_400_Group_Delete_Group_Schema"></a>
<a id="tocSerror_400_group_delete_group_schema"></a>
<a id="tocserror_400_group_delete_group_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Xóa nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Delete_Group_Schema">Error_401_Group_Delete_Group_Schema</h2>

<a id="schemaerror_401_group_delete_group_schema"></a>
<a id="schema_Error_401_Group_Delete_Group_Schema"></a>
<a id="tocSerror_401_group_delete_group_schema"></a>
<a id="tocserror_401_group_delete_group_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_ChangeOwnerDTO">ChangeOwnerDTO</h2>

<a id="schemachangeownerdto"></a>
<a id="schema_ChangeOwnerDTO"></a>
<a id="tocSchangeownerdto"></a>
<a id="tocschangeownerdto"></a>

```json
{
  "newOwnerId": "1af1fc0adb5b8eaf067e1ae6"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description                                 |
| ---------- | ------ | -------- | ------------ | ----- | ------------------------------------------- |
| newOwnerId | string | true     | none         |       | ID của thành viên sẽ trở thành chủ nhóm mới |

<h2 id="tocS_Success_Group_Transfer_Ownership_Schema">Success_Group_Transfer_Ownership_Schema</h2>

<a id="schemasuccess_group_transfer_ownership_schema"></a>
<a id="schema_Success_Group_Transfer_Ownership_Schema"></a>
<a id="tocSsuccess_group_transfer_ownership_schema"></a>
<a id="tocssuccess_group_transfer_ownership_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Transfer_Ownership_Schema">Error_400_Group_Transfer_Ownership_Schema</h2>

<a id="schemaerror_400_group_transfer_ownership_schema"></a>
<a id="schema_Error_400_Group_Transfer_Ownership_Schema"></a>
<a id="tocSerror_400_group_transfer_ownership_schema"></a>
<a id="tocserror_400_group_transfer_ownership_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Chuyển quyền chủ nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Transfer_Ownership_Schema">Error_401_Group_Transfer_Ownership_Schema</h2>

<a id="schemaerror_401_group_transfer_ownership_schema"></a>
<a id="schema_Error_401_Group_Transfer_Ownership_Schema"></a>
<a id="tocSerror_401_group_transfer_ownership_schema"></a>
<a id="tocserror_401_group_transfer_ownership_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Success_Group_Get_Group_Info_Schema">Success_Group_Get_Group_Info_Schema</h2>

<a id="schemasuccess_group_get_group_info_schema"></a>
<a id="schema_Success_Group_Get_Group_Info_Schema"></a>
<a id="tocSsuccess_group_get_group_info_schema"></a>
<a id="tocssuccess_group_get_group_info_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "id": "ce5cedd3c19185d96fa67750",
    "name": "petty furlough drat",
    "ownerId": "7e032a41eff088ed7ee55d33",
    "isGroup": true,
    "createdAt": "2024-06-16T08:57:04.657Z",
    "updatedAt": "2025-05-11T21:59:18.153Z",
    "participants": [
      {
        "id": "[",
        "profileId": "[",
        "role": "[",
        "name": "[",
        "avatar": "["
      }
    ],
    "lastMessage": {
      "id": null,
      "content": null,
      "senderId": null,
      "fileUrl": null,
      "createdAt": null,
      "updatedAt": null,
      "isRecalled": null,
      "type": null,
      "fileName": null
    }
  }
}
```

### Attribute

| Name       | Type                                        | Required | Restrictions | Title | Description       |
| ---------- | ------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                      | true     | none         |       | HTTP status code  |
| message    | string                                      | true     | none         |       | Thông báo kết quả |
| data       | [GroupResponseDTO](#schemagroupresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_401_Group_Get_Group_Info_Schema">Error_401_Group_Get_Group_Info_Schema</h2>

<a id="schemaerror_401_group_get_group_info_schema"></a>
<a id="schema_Error_401_Group_Get_Group_Info_Schema"></a>
<a id="tocSerror_401_group_get_group_info_schema"></a>
<a id="tocserror_401_group_get_group_info_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_403_Group_Get_Group_Info_Schema">Error_403_Group_Get_Group_Info_Schema</h2>

<a id="schemaerror_403_group_get_group_info_schema"></a>
<a id="schema_Error_403_Group_Get_Group_Info_Schema"></a>
<a id="tocSerror_403_group_get_group_info_schema"></a>
<a id="tocserror_403_group_get_group_info_schema"></a>

```json
{
  "statusCode": 403,
  "message": "Người dùng không phải là thành viên của nhóm",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_RenameGroupDTO">RenameGroupDTO</h2>

<a id="schemarenamegroupdto"></a>
<a id="schema_RenameGroupDTO"></a>
<a id="tocSrenamegroupdto"></a>
<a id="tocsrenamegroupdto"></a>

```json
{
  "name": "Nhóm bạn thân"
}
```

### Attribute

| Name | Type   | Required | Restrictions | Title | Description      |
| ---- | ------ | -------- | ------------ | ----- | ---------------- |
| name | string | true     | none         |       | Tên mới của nhóm |

<h2 id="tocS_Success_Group_Rename_Group_Schema">Success_Group_Rename_Group_Schema</h2>

<a id="schemasuccess_group_rename_group_schema"></a>
<a id="schema_Success_Group_Rename_Group_Schema"></a>
<a id="tocSsuccess_group_rename_group_schema"></a>
<a id="tocssuccess_group_rename_group_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Rename_Group_Schema">Error_400_Group_Rename_Group_Schema</h2>

<a id="schemaerror_400_group_rename_group_schema"></a>
<a id="schema_Error_400_Group_Rename_Group_Schema"></a>
<a id="tocSerror_400_group_rename_group_schema"></a>
<a id="tocserror_400_group_rename_group_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Đổi tên nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Rename_Group_Schema">Error_401_Group_Rename_Group_Schema</h2>

<a id="schemaerror_401_group_rename_group_schema"></a>
<a id="schema_Error_401_Group_Rename_Group_Schema"></a>
<a id="tocSerror_401_group_rename_group_schema"></a>
<a id="tocserror_401_group_rename_group_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_UpdateGroupAvatarDTO">UpdateGroupAvatarDTO</h2>

<a id="schemaupdategroupavatardto"></a>
<a id="schema_UpdateGroupAvatarDTO"></a>
<a id="tocSupdategroupavatardto"></a>
<a id="tocsupdategroupavatardto"></a>

```json
{
  "file": "string"
}
```

### Attribute

| Name | Type           | Required | Restrictions | Title | Description                  |
| ---- | -------------- | -------- | ------------ | ----- | ---------------------------- |
| file | string(binary) | true     | none         |       | Ảnh đại diện của nhóm (file) |

<h2 id="tocS_Success_Group_Update_Group_Avatar_Schema">Success_Group_Update_Group_Avatar_Schema</h2>

<a id="schemasuccess_group_update_group_avatar_schema"></a>
<a id="schema_Success_Group_Update_Group_Avatar_Schema"></a>
<a id="tocSsuccess_group_update_group_avatar_schema"></a>
<a id="tocssuccess_group_update_group_avatar_schema"></a>

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "groupId": "4baaff3dac5e034bf6afb215"
  }
}
```

### Attribute

| Name       | Type                                            | Required | Restrictions | Title | Description       |
| ---------- | ----------------------------------------------- | -------- | ------------ | ----- | ----------------- |
| statusCode | number                                          | true     | none         |       | HTTP status code  |
| message    | string                                          | true     | none         |       | Thông báo kết quả |
| data       | [GroupIdResponseDTO](#schemagroupidresponsedto) | false    | none         |       | Dữ liệu trả về    |

<h2 id="tocS_Error_400_Group_Update_Group_Avatar_Schema">Error_400_Group_Update_Group_Avatar_Schema</h2>

<a id="schemaerror_400_group_update_group_avatar_schema"></a>
<a id="schema_Error_400_Group_Update_Group_Avatar_Schema"></a>
<a id="tocSerror_400_group_update_group_avatar_schema"></a>
<a id="tocserror_400_group_update_group_avatar_schema"></a>

```json
{
  "statusCode": 400,
  "message": "Cập nhật avatar nhóm thất bại",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |

<h2 id="tocS_Error_401_Group_Update_Group_Avatar_Schema">Error_401_Group_Update_Group_Avatar_Schema</h2>

<a id="schemaerror_401_group_update_group_avatar_schema"></a>
<a id="schema_Error_401_Group_Update_Group_Avatar_Schema"></a>
<a id="tocSerror_401_group_update_group_avatar_schema"></a>
<a id="tocserror_401_group_update_group_avatar_schema"></a>

```json
{
  "statusCode": 401,
  "message": "Không có quyền truy cập",
  "error": "Thông tin lỗi"
}
```

### Attribute

| Name       | Type   | Required | Restrictions | Title | Description |
| ---------- | ------ | -------- | ------------ | ----- | ----------- |
| statusCode | number | true     | none         |       | none        |
| message    | string | true     | none         |       | none        |
| error      | string | true     | none         |       | none        |
