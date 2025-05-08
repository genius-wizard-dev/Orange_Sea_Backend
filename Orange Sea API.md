---
title: Orange Sea API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Orange Sea API

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer<br/>Nhập token JWT của bạn

# Auth

<a id="opIdAuthController_register"></a>

## POST Đăng ký tài khoản mới và gửi OTP

POST /api/auth/register

> Body Parameters

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "USER"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RegisterDTO](#schemaregisterdto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Gửi OTP thành công|None|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Username hoặc email đã tồn tại|None|

<a id="opIdAuthController_resendOTP"></a>

## POST Gửi lại OTP sau 2 phút

POST /api/auth/resend-otp

> Body Parameters

```json
{
  "email": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ResendOtpDto](#schemaresendotpdto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Gửi lại OTP thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Không thể gửi lại OTP|None|

<a id="opIdAuthController_checkRegister"></a>

## POST Xác thực OTP và hoàn tất đăng ký

POST /api/auth/is-register

> Body Parameters

```json
{
  "key": "string",
  "email": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CheckRegister](#schemacheckregister)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đăng ký thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|OTP không hợp lệ hoặc hết hạn|None|

<a id="opIdAuthController_verifyOTP"></a>

## POST Xác thực OTP và hoàn tất đăng ký

POST /api/auth/verify-otp

> Body Parameters

```json
{
  "email": "string",
  "otp": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RegisterOtpVerifyDTO](#schemaregisterotpverifydto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đăng ký thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|OTP không hợp lệ hoặc hết hạn|None|

<a id="opIdAuthController_login"></a>

## POST Đăng nhập với username và mật khẩu

POST /api/auth/login

> Body Parameters

```json
{
  "username": "string",
  "password": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginDTO](#schemalogindto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đăng nhập thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Thiếu thông tin FCM token|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Thông tin đăng nhập không hợp lệ|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Lỗi server nội bộ|None|

<a id="opIdAuthController_refresh"></a>

## POST Làm mới access token bằng refresh token

POST /api/auth/refresh

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Làm mới token thành công|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Refresh token không hợp lệ hoặc hết hạn|None|

<a id="opIdAuthController_logout"></a>

## POST Đăng xuất và thu hồi token

POST /api/auth/logout

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đăng xuất thành công|None|

<a id="opIdAuthController_forgotPassword"></a>

## POST AuthController_forgotPassword

POST /api/auth/forgot-password

> Body Parameters

```json
{
  "email": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ForgotPasswordDTO](#schemaforgotpassworddto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|None|

<a id="opIdAuthController_resetPassword"></a>

## POST AuthController_resetPassword

POST /api/auth/reset-password

> Body Parameters

```json
{
  "newPassword": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ResetPasswordDTO](#schemaresetpassworddto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|None|

# Profile

<a id="opIdProfileController_getMyProfile"></a>

## GET Lấy thông tin profile của người dùng hiện tại

GET /api/profile/me

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lấy thông tin thành công|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không có quyền truy cập|None|

<a id="opIdProfileController_updateMyProfile"></a>

## PUT Cập nhật profile của người dùng hiện tại

PUT /api/profile/me

> Body Parameters

```yaml
name: ""
phone: "0912345678"
bio: ""
gender: ""
avatar: ""
birthday: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|
|» name|body|string| no |Tên đầy đủ|
|» phone|body|string| no |Số điện thoại|
|» bio|body|string| no |Tiểu sử|
|» gender|body|string| no |Giới tính|
|» avatar|body|string(binary)| no |Ảnh đại diện (file upload)|
|» birthday|body|string| no |Ngày sinh (định dạng ISO)|

#### Enum

|Name|Value|
|---|---|
|» gender|M|
|» gender|F|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cập nhật thành công|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không có quyền truy cập|None|

<a id="opIdProfileController_getProfileById"></a>

## GET Lấy thông tin profile theo ID

GET /api/profile/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lấy thông tin thành công|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không có quyền truy cập|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Không tìm thấy profile|None|

<a id="opIdProfileController_findProfileByUsername"></a>

## GET Tìm kiếm profile theo username

GET /api/profile/username/{username}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|username|path|string| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tìm kiếm thành công|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không có quyền truy cập|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Không tìm thấy profile|None|

# Chat

<a id="opIdChatController_sendMessage"></a>

## POST Gửi tin nhắn đến nhóm chat

POST /api/chat/send

> Body Parameters

```yaml
groupId: ""
message: ""
type: TEXT
file: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|
|» groupId|body|string| yes |ID của nhóm chat|
|» message|body|string| no |Nội dung tin nhắn|
|» type|body|string| no |Loại tin nhắn|
|» file|body|object| no |File đính kèm (hình ảnh, video hoặc file)|

#### Enum

|Name|Value|
|---|---|
|» type|TEXT|
|» type|IMAGE|
|» type|VIDEO|
|» type|RAW|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tin nhắn đã được gửi thành công|[ApiResponseDto](#schemaapiresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Dữ liệu không hợp lệ|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không có quyền truy cập|None|

<a id="opIdChatController_recallMessage"></a>

## PUT Thu hồi tin nhắn

PUT /api/chat/recall/{messageId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|messageId|path|string| yes |ID của tin nhắn cần thu hồi|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tin nhắn đã được thu hồi thành công|[ApiResponseDto](#schemaapiresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Tin nhắn không tồn tại|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không có quyền thu hồi tin nhắn này|None|

<a id="opIdChatController_deleteMessage"></a>

## DELETE Xóa tin nhắn

DELETE /api/chat/delete/{messageId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|messageId|path|string| yes |ID của tin nhắn cần xóa|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tin nhắn đã được xóa thành công|[ApiResponseDto](#schemaapiresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Tin nhắn không tồn tại|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không có quyền xóa tin nhắn này|None|

<a id="opIdChatController_forwardMessage"></a>

## POST Chuyển tiếp tin nhắn

POST /api/chat/forward

> Body Parameters

```json
{
  "messageId": "123e4567-e89b-12d3-a456-426614174000",
  "targetGroupId": "123e4567-e89b-12d3-a456-426614174001"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ForwardMessageDto](#schemaforwardmessagedto)| no |none|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tin nhắn đã được chuyển tiếp thành công|[ApiResponseDto](#schemaapiresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Tin nhắn không tồn tại|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không có quyền chuyển tiếp tin nhắn|None|

<a id="opIdChatController_getMessages"></a>

## GET Lấy tin nhắn theo trang của nhóm chat

GET /api/chat/messages/{groupId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm chat|
|cursor|query|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "messages": [
      {}
    ],
    "nextCursor": "string",
    "hasMore": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách tin nhắn của nhóm chat|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Dữ liệu không hợp lệ|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Không có quyền truy cập|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|string|false|none||none|
|» statusCode|number|false|none||none|
|» data|object|false|none||none|
|»» messages|[object]|false|none||none|
|»» nextCursor|string¦null|false|none||none|
|»» hasMore|boolean|false|none||none|

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

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|messageId|path|string| yes |ID của tin nhắn cần chỉnh sửa|
|body|body|[EditMessageDto](#schemaeditmessagedto)| no |none|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tin nhắn đã được chỉnh sửa thành công|[ApiResponseDto](#schemaapiresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Tin nhắn không tồn tại hoặc không phải tin nhắn văn bản|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không có quyền chỉnh sửa tin nhắn này|None|

<a id="opIdChatController_getGroupMedia"></a>

## GET Lấy danh sách media (hình ảnh, video, file) của nhóm chat

GET /api/chat/media/{groupId}

> Body Parameters

```json
{
  "type": "IMAGE",
  "limit": 10,
  "cursor": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm chat|
|body|body|[GetMediaDto](#schemagetmediadto)| no |none|

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "media": [
      {}
    ],
    "nextCursor": "string",
    "hasMore": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách media của nhóm chat|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Dữ liệu không hợp lệ|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Không có quyền truy cập|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|string|false|none||none|
|» statusCode|number|false|none||none|
|» data|object|false|none||none|
|»» media|[object]|false|none||none|
|»» nextCursor|string¦null|false|none||none|
|»» hasMore|boolean|false|none||none|

# Account

<a id="opIdAccountController_getAccountById"></a>

## GET Lấy thông tin tài khoản theo ID

GET /api/account/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lấy thông tin tài khoản thành công|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Không tìm thấy tài khoản|None|

<a id="opIdAccountController_getAccountByUsername"></a>

## GET Lấy thông tin tài khoản theo username

GET /api/account/username/{username}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|username|path|string| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lấy thông tin tài khoản thành công|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Không tìm thấy tài khoản|None|

<a id="opIdAccountController_updatePassword"></a>

## PUT Cập nhật mật khẩu tài khoản

PUT /api/account/{id}/password

> Body Parameters

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |none|
|body|body|[UpdatePasswordDTO](#schemaupdatepassworddto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cập nhật mật khẩu thành công|None|

# Friend

<a id="opIdFriendshipController_sendFriendRequest"></a>

## POST Gửi yêu cầu kết bạn

POST /api/friend

> Body Parameters

```json
{
  "receiverId": "profile-id"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateFriendshipDto](#schemacreatefriendshipdto)| no |none|

> Response Examples

> 201 Response

```json
{
  "id": "friendShip-id",
  "status": "PENDING",
  "message": "Yêu cầu kết bạn đã được gửi thành công"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Yêu cầu kết bạn đã được gửi|[FriendshipResponseDto](#schemafriendshipresponsedto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Yêu cầu không hợp lệ|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

<a id="opIdFriendshipController_getFriends"></a>

## GET Lấy danh sách bạn bè

GET /api/friend

> Response Examples

> 200 Response

```json
[
  {
    "id": "friendShip-id",
    "profileId": "profile-id",
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Hello world",
    "phone": "0912345678",
    "email": "example@gmail.com",
    "birthday": "2000-01-01"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách bạn bè|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[FriendResponse](#schemafriendresponse)]|false|none||none|
|» id|string|true|none||ID của mối quan hệ bạn bè|
|» profileId|string|true|none||ID của profile người dùng|
|» name|object¦null|false|none||Tên người dùng|
|» avatar|object¦null|false|none||URL hình đại diện của người dùng|
|» bio|object¦null|false|none||Thông tin giới thiệu|
|» phone|object¦null|false|none||Số điện thoại|
|» email|object¦null|false|none||Email người dùng|
|» birthday|object¦null|false|none||Ngày sinh|

<a id="opIdFriendshipController_getReceivedRequests"></a>

## GET Lấy danh sách yêu cầu kết bạn đã nhận

GET /api/friend/requests/received

> Response Examples

> 200 Response

```json
[
  {
    "id": "friendShip-id",
    "profileId": "profile-id",
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Hello world",
    "phone": "0912345678",
    "email": "example@gmail.com",
    "birthday": "2000-01-01"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách yêu cầu kết bạn đã nhận|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[FriendResponse](#schemafriendresponse)]|false|none||none|
|» id|string|true|none||ID của mối quan hệ bạn bè|
|» profileId|string|true|none||ID của profile người dùng|
|» name|object¦null|false|none||Tên người dùng|
|» avatar|object¦null|false|none||URL hình đại diện của người dùng|
|» bio|object¦null|false|none||Thông tin giới thiệu|
|» phone|object¦null|false|none||Số điện thoại|
|» email|object¦null|false|none||Email người dùng|
|» birthday|object¦null|false|none||Ngày sinh|

<a id="opIdFriendshipController_getSentRequests"></a>

## GET Lấy danh sách yêu cầu kết bạn đã gửi

GET /api/friend/requests/sent

> Response Examples

> 200 Response

```json
[
  {
    "id": "friendShip-id",
    "profileId": "profile-id",
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Hello world",
    "phone": "0912345678",
    "email": "example@gmail.com",
    "birthday": "2000-01-01"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách yêu cầu kết bạn đã gửi|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[FriendResponse](#schemafriendresponse)]|false|none||none|
|» id|string|true|none||ID của mối quan hệ bạn bè|
|» profileId|string|true|none||ID của profile người dùng|
|» name|object¦null|false|none||Tên người dùng|
|» avatar|object¦null|false|none||URL hình đại diện của người dùng|
|» bio|object¦null|false|none||Thông tin giới thiệu|
|» phone|object¦null|false|none||Số điện thoại|
|» email|object¦null|false|none||Email người dùng|
|» birthday|object¦null|false|none||Ngày sinh|

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

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |ID của yêu cầu kết bạn|
|body|body|[HandleFriendRequestDto](#schemahandlefriendrequestdto)| no |none|

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "message": "Yêu cầu kết bạn đã được chấp nhận"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Yêu cầu kết bạn đã được xử lý|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Yêu cầu không hợp lệ|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|string|false|none||none|
|» message|string|false|none||none|

<a id="opIdFriendshipController_deleteFriendship"></a>

## PUT Xóa mối quan hệ bạn bè

PUT /api/friend/delete/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |ID của mối quan hệ bạn bè|

> Response Examples

> 200 Response

```json
{
  "status": "success",
  "message": "Mối quan hệ bạn bè đã được xóa"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Mối quan hệ bạn bè đã được xóa|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Yêu cầu không hợp lệ|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» status|string|false|none||none|
|» message|string|false|none||none|

<a id="opIdFriendshipController_searchUser"></a>

## GET Tìm kiếm người dùng

GET /api/friend/search/{keyword}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|keyword|path|string| yes |Từ khóa tìm kiếm (tên người dùng hoặc số điện thoại)|

> Response Examples

> 200 Response

```json
[
  {
    "id": "profile-id",
    "username": "user123",
    "name": "Nguyễn Văn A",
    "avatar": "https://example.com/avatar.jpg",
    "relation": "NONE"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách người dùng tìm thấy|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[UserSearchResponseDto](#schemausersearchresponsedto)]|false|none||none|
|» id|string|true|none||ID của người dùng|
|» username|string|true|none||Tên đăng nhập|
|» name|object¦null|false|none||Tên hiển thị của người dùng|
|» avatar|object¦null|false|none||URL hình đại diện của người dùng|
|» relation|string|false|none||Trạng thái mối quan hệ với người dùng hiện tại|

#### Enum

|Name|Value|
|---|---|
|relation|NONE|
|relation|FRIEND|
|relation|PENDING_SENT|
|relation|PENDING_RECEIVED|
|relation|REJECTED|

<a id="opIdFriendshipController_isFriend"></a>

## GET Kiểm tra mối quan hệ bạn bè

GET /api/friend/check/{profileId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|profileId|path|string| yes |ID của profile cần kiểm tra mối quan hệ|

> Response Examples

> 200 Response

```json
{
  "isFriend": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Trạng thái mối quan hệ bạn bè|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Không được phép|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» isFriend|boolean|false|none||none|

# Group

<a id="opIdGroupController_createGroup"></a>

## POST Tạo nhóm mới hoặc cuộc trò chuyện trực tiếp

POST /api/group

> Body Parameters

```json
{
  "name": "Nhóm học tập",
  "participantIds": [
    "profile-id-1",
    "profile-id-2"
  ],
  "isGroup": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateGroupDto](#schemacreategroupdto)| no |none|

> Response Examples

> 201 Response

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

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Nhóm đã được tạo thành công|[GroupResponseDto](#schemagroupresponsedto)|

<a id="opIdGroupController_getGroups"></a>

## GET Lấy danh sách nhóm của người dùng hiện tại

GET /api/group

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách nhóm|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[GroupResponseDto](#schemagroupresponsedto)]|false|none||none|
|» id|string|true|none||ID của nhóm|
|» name|string|true|none||Tên nhóm|
|» ownerId|string|true|none||ID của chủ nhóm|
|» isGroup|boolean|true|none||Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp|
|» createdAt|string(date-time)|true|none||Thời gian tạo nhóm|
|» updatedAt|string(date-time)|true|none||Thời gian cập nhật nhóm|
|» participants|[[ParticipantDto](#schemaparticipantdto)]|true|none||Danh sách thành viên trong nhóm|
|»» id|string|true|none||ID của thành viên trong nhóm|
|»» userId|string|true|none||ID của hồ sơ người dùng|
|»» groupId|string|true|none||ID của nhóm|
|»» role|string|true|none||Vai trò trong nhóm|
|»» user|[ParticipantUserDto](#schemaparticipantuserdto)|true|none||Thông tin người dùng|
|»»» id|string|true|none||ID của hồ sơ người dùng|
|»»» name|string|true|none||Tên người dùng|
|»»» avatar|string|true|none||Ảnh đại diện|
|» messages|[[MessageDto](#schemamessagedto)]|true|none||Tin nhắn gần nhất trong nhóm|
|»» id|string|true|none||ID của tin nhắn|
|»» content|string|true|none||Nội dung tin nhắn|
|»» createdAt|string(date-time)|true|none||Thời gian tạo tin nhắn|

#### Enum

|Name|Value|
|---|---|
|role|OWNER|
|role|MEMBER|

<a id="opIdGroupController_addParticipant"></a>

## PUT Thêm thành viên vào nhóm

PUT /api/group/{groupId}/participant

> Body Parameters

```json
{
  "participantIds": "profile-id-1"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|
|body|body|[AddParticipantDto](#schemaaddparticipantdto)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Thành viên đã được thêm vào nhóm|None|

<a id="opIdGroupController_removeParticipant"></a>

## DELETE Xóa thành viên khỏi nhóm

DELETE /api/group/{groupId}/participant

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|
|participantId|path|string| yes |ID của thành viên cần xóa|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Thành viên đã bị xóa khỏi nhóm|None|

<a id="opIdGroupController_deleteGroup"></a>

## DELETE Xóa nhóm

DELETE /api/group/{groupId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm cần xóa|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Nhóm đã được xóa thành công|None|

<a id="opIdGroupController_getGroupInfo"></a>

## GET Lấy thông tin của nhóm

GET /api/group/{groupId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|

> Response Examples

> 200 Response

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

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Thông tin chi tiết của nhóm|[GroupResponseDto](#schemagroupresponsedto)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Người dùng không phải là thành viên của nhóm|None|

<a id="opIdGroupController_leaveGroup"></a>

## DELETE Rời khỏi nhóm

DELETE /api/group/{groupId}/leave

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm muốn rời|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đã rời khỏi nhóm thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Không thể rời khỏi nhóm (không phải nhóm hoặc bạn là chủ nhóm)|None|

<a id="opIdGroupController_transferOwnership"></a>

## PUT Chuyển quyền chủ nhóm

PUT /api/group/{groupId}/owner

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Đã chuyển quyền chủ nhóm thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Không thể chuyển quyền chủ nhóm|None|

<a id="opIdGroupController_searchGroups"></a>

## GET Tìm kiếm nhóm theo tên

GET /api/group/search/{keyword}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|keyword|path|string| yes |Từ khóa tìm kiếm|

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

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Danh sách nhóm phù hợp với từ khóa tìm kiếm|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[GroupResponseDto](#schemagroupresponsedto)]|false|none||none|
|» id|string|true|none||ID của nhóm|
|» name|string|true|none||Tên nhóm|
|» ownerId|string|true|none||ID của chủ nhóm|
|» isGroup|boolean|true|none||Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp|
|» createdAt|string(date-time)|true|none||Thời gian tạo nhóm|
|» updatedAt|string(date-time)|true|none||Thời gian cập nhật nhóm|
|» participants|[[ParticipantDto](#schemaparticipantdto)]|true|none||Danh sách thành viên trong nhóm|
|»» id|string|true|none||ID của thành viên trong nhóm|
|»» userId|string|true|none||ID của hồ sơ người dùng|
|»» groupId|string|true|none||ID của nhóm|
|»» role|string|true|none||Vai trò trong nhóm|
|»» user|[ParticipantUserDto](#schemaparticipantuserdto)|true|none||Thông tin người dùng|
|»»» id|string|true|none||ID của hồ sơ người dùng|
|»»» name|string|true|none||Tên người dùng|
|»»» avatar|string|true|none||Ảnh đại diện|
|» messages|[[MessageDto](#schemamessagedto)]|true|none||Tin nhắn gần nhất trong nhóm|
|»» id|string|true|none||ID của tin nhắn|
|»» content|string|true|none||Nội dung tin nhắn|
|»» createdAt|string(date-time)|true|none||Thời gian tạo tin nhắn|

#### Enum

|Name|Value|
|---|---|
|role|OWNER|
|role|MEMBER|

<a id="opIdGroupController_renameGroup"></a>

## POST Đổi tên nhóm

POST /api/group/{groupId}/rename

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tên nhóm đã được đổi thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Không thể đổi tên nhóm|None|

<a id="opIdGroupController_updateGroupAvatar"></a>

## PUT Cập nhật avatar nhóm

PUT /api/group/{groupId}/avatar

> Body Parameters

```yaml
avatar: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|groupId|path|string| yes |ID của nhóm|
|body|body|object| no |none|
|» avatar|body|string(binary)| yes |Ảnh đại diện của nhóm (file)|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Avatar nhóm đã được cập nhật thành công|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Không thể cập nhật avatar nhóm (không phải nhóm hoặc bạn không phải chủ nhóm)|None|

# Data Schema

<h2 id="tocS_SendMessageDto">SendMessageDto</h2>

<a id="schemasendmessagedto"></a>
<a id="schema_SendMessageDto"></a>
<a id="tocSsendmessagedto"></a>
<a id="tocssendmessagedto"></a>

```json
{
  "groupId": "string",
  "message": "string",
  "type": "TEXT",
  "file": {}
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|groupId|string|true|none||ID của nhóm chat|
|message|string|false|none||Nội dung tin nhắn|
|type|string|false|none||Loại tin nhắn|
|file|object|false|none||File đính kèm (hình ảnh, video hoặc file)|

#### Enum

|Name|Value|
|---|---|
|type|TEXT|
|type|IMAGE|
|type|VIDEO|
|type|RAW|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|status|string|true|none||Trạng thái của request|
|statusCode|number|true|none||Mã trạng thái HTTP|
|data|object|true|none||Dữ liệu trả về từ API|
|message|string|false|none||Thông báo lỗi (nếu có)|

<h2 id="tocS_ForwardMessageDto">ForwardMessageDto</h2>

<a id="schemaforwardmessagedto"></a>
<a id="schema_ForwardMessageDto"></a>
<a id="tocSforwardmessagedto"></a>
<a id="tocsforwardmessagedto"></a>

```json
{
  "messageId": "123e4567-e89b-12d3-a456-426614174000",
  "targetGroupId": "123e4567-e89b-12d3-a456-426614174001"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|messageId|string|true|none||ID của tin nhắn cần chuyển tiếp|
|targetGroupId|string|true|none||ID của nhóm chat đích để chuyển tiếp tin nhắn đến|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newContent|string|true|none||Nội dung mới của tin nhắn|

<h2 id="tocS_GetMediaDto">GetMediaDto</h2>

<a id="schemagetmediadto"></a>
<a id="schema_GetMediaDto"></a>
<a id="tocSgetmediadto"></a>
<a id="tocsgetmediadto"></a>

```json
{
  "type": "IMAGE",
  "limit": 10,
  "cursor": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|type|string|true|none||Loại media muốn lấy|
|limit|number|true|none||Số lượng media muốn lấy trong một trang|
|cursor|string|false|none||ID của tin nhắn dùng làm cursor để phân trang|

#### Enum

|Name|Value|
|---|---|
|type|IMAGE|
|type|VIDEO|
|type|RAW|

<h2 id="tocS_RegisterDTO">RegisterDTO</h2>

<a id="schemaregisterdto"></a>
<a id="schema_RegisterDTO"></a>
<a id="tocSregisterdto"></a>
<a id="tocsregisterdto"></a>

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "USER"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|username|string|true|none||Tên đăng nhập|
|email|string|true|none||Địa chỉ email|
|password|string|true|none||Mật khẩu|
|role|string|true|none||Vai trò của người dùng|

#### Enum

|Name|Value|
|---|---|
|role|USER|
|role|ADMIN|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string|true|none||Email đăng ký|

<h2 id="tocS_CheckRegister">CheckRegister</h2>

<a id="schemacheckregister"></a>
<a id="schema_CheckRegister"></a>
<a id="tocScheckregister"></a>
<a id="tocscheckregister"></a>

```json
{
  "key": "string",
  "email": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|key|string|true|none||Key xác thực|
|email|string|true|none||Email đăng ký|

<h2 id="tocS_RegisterOtpVerifyDTO">RegisterOtpVerifyDTO</h2>

<a id="schemaregisterotpverifydto"></a>
<a id="schema_RegisterOtpVerifyDTO"></a>
<a id="tocSregisterotpverifydto"></a>
<a id="tocsregisterotpverifydto"></a>

```json
{
  "email": "string",
  "otp": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string|true|none||Email đăng ký|
|otp|string|true|none||Mã OTP|

<h2 id="tocS_LoginDTO">LoginDTO</h2>

<a id="schemalogindto"></a>
<a id="schema_LoginDTO"></a>
<a id="tocSlogindto"></a>
<a id="tocslogindto"></a>

```json
{
  "username": "string",
  "password": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|username|string|false|none||The username|
|password|string|true|none||Mật khẩu|

<h2 id="tocS_ForgotPasswordDTO">ForgotPasswordDTO</h2>

<a id="schemaforgotpassworddto"></a>
<a id="schema_ForgotPasswordDTO"></a>
<a id="tocSforgotpassworddto"></a>
<a id="tocsforgotpassworddto"></a>

```json
{
  "email": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string|true|none||Email|

<h2 id="tocS_ResetPasswordDTO">ResetPasswordDTO</h2>

<a id="schemaresetpassworddto"></a>
<a id="schema_ResetPasswordDTO"></a>
<a id="tocSresetpassworddto"></a>
<a id="tocsresetpassworddto"></a>

```json
{
  "newPassword": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newPassword|string|true|none||Mật khẩu mới|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|name|string|false|none||Tên đầy đủ|
|phone|string|false|none||Số điện thoại|
|bio|string|false|none||Tiểu sử|
|gender|string|false|none||Giới tính|
|avatar|string(binary)|false|none||Ảnh đại diện (file upload)|
|birthday|string|false|none||Ngày sinh (định dạng ISO)|

#### Enum

|Name|Value|
|---|---|
|gender|M|
|gender|F|

<h2 id="tocS_UpdatePasswordDTO">UpdatePasswordDTO</h2>

<a id="schemaupdatepassworddto"></a>
<a id="schema_UpdatePasswordDTO"></a>
<a id="tocSupdatepassworddto"></a>
<a id="tocsupdatepassworddto"></a>

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|currentPassword|string|true|none||Mật khẩu hiện tại (bắt buộc khi thay đổi mật khẩu)|
|newPassword|string|true|none||Mật khẩu mới|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|receiverId|string|true|none||ID của người nhận lời mời kết bạn|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của mối quan hệ bạn bè|
|status|string|true|none||Trạng thái của mối quan hệ|
|message|string|true|none||Thông báo kết quả|

#### Enum

|Name|Value|
|---|---|
|status|PENDING|
|status|ACCEPTED|
|status|REJECTED|

<h2 id="tocS_FriendResponse">FriendResponse</h2>

<a id="schemafriendresponse"></a>
<a id="schema_FriendResponse"></a>
<a id="tocSfriendresponse"></a>
<a id="tocsfriendresponse"></a>

```json
{
  "id": "friendShip-id",
  "profileId": "profile-id",
  "name": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Hello world",
  "phone": "0912345678",
  "email": "example@gmail.com",
  "birthday": "2000-01-01"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của mối quan hệ bạn bè|
|profileId|string|true|none||ID của profile người dùng|
|name|object¦null|false|none||Tên người dùng|
|avatar|object¦null|false|none||URL hình đại diện của người dùng|
|bio|object¦null|false|none||Thông tin giới thiệu|
|phone|object¦null|false|none||Số điện thoại|
|email|object¦null|false|none||Email người dùng|
|birthday|object¦null|false|none||Ngày sinh|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|action|string|true|none||Hành động xử lý yêu cầu kết bạn|

#### Enum

|Name|Value|
|---|---|
|action|ACCEPT|
|action|REJECT|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của người dùng|
|username|string|true|none||Tên đăng nhập|
|name|object¦null|false|none||Tên hiển thị của người dùng|
|avatar|object¦null|false|none||URL hình đại diện của người dùng|
|relation|string|false|none||Trạng thái mối quan hệ với người dùng hiện tại|

#### Enum

|Name|Value|
|---|---|
|relation|NONE|
|relation|FRIEND|
|relation|PENDING_SENT|
|relation|PENDING_RECEIVED|
|relation|REJECTED|

<h2 id="tocS_CreateGroupDto">CreateGroupDto</h2>

<a id="schemacreategroupdto"></a>
<a id="schema_CreateGroupDto"></a>
<a id="tocScreategroupdto"></a>
<a id="tocscreategroupdto"></a>

```json
{
  "name": "Nhóm học tập",
  "participantIds": [
    "profile-id-1",
    "profile-id-2"
  ],
  "isGroup": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|name|string|false|none||Tên của nhóm|
|participantIds|[string]|true|none||Danh sách ID của thành viên tham gia nhóm|
|isGroup|boolean|false|none||Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của hồ sơ người dùng|
|name|string|true|none||Tên người dùng|
|avatar|string|true|none||Ảnh đại diện|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của thành viên trong nhóm|
|userId|string|true|none||ID của hồ sơ người dùng|
|groupId|string|true|none||ID của nhóm|
|role|string|true|none||Vai trò trong nhóm|
|user|[ParticipantUserDto](#schemaparticipantuserdto)|true|none||Thông tin người dùng|

#### Enum

|Name|Value|
|---|---|
|role|OWNER|
|role|MEMBER|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của tin nhắn|
|content|string|true|none||Nội dung tin nhắn|
|createdAt|string(date-time)|true|none||Thời gian tạo tin nhắn|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||ID của nhóm|
|name|string|true|none||Tên nhóm|
|ownerId|string|true|none||ID của chủ nhóm|
|isGroup|boolean|true|none||Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp|
|createdAt|string(date-time)|true|none||Thời gian tạo nhóm|
|updatedAt|string(date-time)|true|none||Thời gian cập nhật nhóm|
|participants|[[ParticipantDto](#schemaparticipantdto)]|true|none||Danh sách thành viên trong nhóm|
|messages|[[MessageDto](#schemamessagedto)]|true|none||Tin nhắn gần nhất trong nhóm|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|participantIds|[string]|true|none||ID của thành viên cần thêm vào nhóm|

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

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|avatar|string(binary)|true|none||Ảnh đại diện của nhóm (file)|

