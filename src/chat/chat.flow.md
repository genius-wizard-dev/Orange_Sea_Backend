# Tài liệu luồng chat (Chat Flow)

## Mục lục

1. [Cấu trúc dữ liệu](#cấu-trúc-dữ-liệu)
2. [Loại tin nhắn](#loại-tin-nhắn)
3. [API Endpoints](#api-endpoints)
4. [Socket Events](#socket-events)
5. [Luồng xử lý](#luồng-xử-lý)
   - [Luồng kết nối](#luồng-kết-nối)
   - [Luồng gửi tin nhắn](#luồng-gửi-tin-nhắn)
   - [Luồng đọc tin nhắn](#luồng-đọc-tin-nhắn)
   - [Luồng thu hồi tin nhắn](#luồng-thu-hồi-tin-nhắn)
   - [Luồng xóa tin nhắn](#luồng-xóa-tin-nhắn)
   - [Luồng chuyển tiếp tin nhắn](#luồng-chuyển-tiếp-tin-nhắn)

## Cấu trúc dữ liệu

### Các model chính liên quan đến chat

#### Message

```prisma
model Message {
  id              String           @id @default(auto()) @map("_id") @db.ObjectId
  sender          Profile          @relation(fields: [senderId], references: [id], onDelete: Cascade)
  senderId        String           @db.ObjectId
  group           Group            @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId         String           @db.ObjectId
  content         String?
  imageUrl        String?
  videoUrl        String?
  stickerUrl      String?
  type            MessageType      @default(TEXT)
  isRecalled      Boolean          @default(false)
  recalledAt      DateTime?
  editedAt        DateTime?
  originalContent String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  readBy          ReadMessage[]
  deletedBy       DeletedMessage[]
  forwardedFrom   String?          @db.ObjectId
  forwardedAt     DateTime?

  @@index([groupId, createdAt(sort: Desc)])
  @@index([senderId])
}
```

#### ReadMessage

```prisma
model ReadMessage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId String   @db.ObjectId
  userId    String   @db.ObjectId
  readAt    DateTime @default(now())

  @@unique([messageId, userId])
  @@index([messageId])
}
```

#### DeletedMessage

```prisma
model DeletedMessage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId String   @db.ObjectId
  userId    String   @db.ObjectId
  deletedAt DateTime @default(now())

  @@unique([messageId, userId])
  @@index([messageId])
  @@index([userId])
}
```

## Loại tin nhắn

Enum `MessageType` định nghĩa các loại tin nhắn hỗ trợ trong hệ thống:

```prisma
enum MessageType {
  TEXT      // Tin nhắn văn bản thông thường
  IMAGE     // Tin nhắn hình ảnh
  VIDEO     // Tin nhắn video
  STICKER   // Tin nhắn sticker
}
```

## API Endpoints

### 1. Gửi tin nhắn

```
POST /chat/send
```

**Request Body:**

```json
{
  "groupId": "string",
  "message": "string",
  "type": "TEXT|IMAGE|VIDEO|STICKER",
  "senderId": "string"
}
```

**File Upload:**
Sử dụng FormData với trường `file` nếu gửi ảnh, video hoặc sticker.

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "messageId": "string",
    "groupId": "string",
    "senderId": "string"
  }
}
```

### 2. Upload sticker

```
POST /chat/sticker
```

**File Upload:**
Sử dụng FormData với trường `file` cho sticker.

**Response:**

```json
{
  "status": "success",
  "data": {
    "stickerUrl": "string"
  }
}
```

### 3. Thu hồi tin nhắn

```
PUT /chat/recall/:messageId
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "messageId": "string",
    "groupId": "string",
    "message": {
      // chi tiết tin nhắn
    }
  }
}
```

### 4. Xóa tin nhắn

```
DELETE /chat/delete/:messageId
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "Đã xóa tin nhắn thành công"
  }
}
```

### 5. Chuyển tiếp tin nhắn

```
POST /chat/forward
```

**Request Body:**

```json
{
  "messageId": "string",
  "targetGroupId": "string"
}
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "messageId": "string",
    "groupId": "string",
    "message": {
      // chi tiết tin nhắn
    }
  }
}
```

## Socket Events

### Kết nối socket

```javascript
// Kết nối tới namespace
const socket = io('/chat');
```

### Sự kiện client gửi lên server

| Sự kiện           | Dữ liệu                                                          | Mô tả                                       |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| `register`        | `{ profileId: string }`                                          | Đăng ký socket với profile ID               |
| `open`            | `{ profileId: string, groupId: string }`                         | Mở một cuộc trò chuyện                      |
| `leave`           | `{ profileId: string, groupId: string }`                         | Rời khỏi một cuộc trò chuyện                |
| `markAsRead`      | `{ profileId: string, groupId: string }`                         | Đánh dấu đã đọc tất cả tin nhắn trong group |
| `getUnreadCounts` | `{ profileId: string }`                                          | Lấy số tin nhắn chưa đọc theo group         |
| `send`            | `{ messageId: string, groupId: string, senderId: string }`       | Thông báo tin nhắn mới đã được gửi          |
| `recall`          | `{ messageId: string, groupId: string }`                         | Thông báo thu hồi tin nhắn                  |
| `delete`          | `{ messageId: string, groupId: string, userId: string }`         | Thông báo xóa tin nhắn                      |
| `forward`         | `{ messageId: string, targetGroupId: string, senderId: string }` | Thông báo chuyển tiếp tin nhắn              |

### Sự kiện server gửi xuống client

| Sự kiện               | Dữ liệu                                                                         | Mô tả                          |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| `initialUnreadCounts` | `[{ groupId: string, unreadCount: number }]`                                    | Số tin nhắn chưa đọc ban đầu   |
| `userStatusUpdate`    | `{ profileId: string, isOnline: boolean, isActive: boolean, groupId?: string }` | Cập nhật trạng thái người dùng |
| `messagesRead`        | `{ profileId: string, groupId: string, messageIds: string[] }`                  | Thông báo tin nhắn đã được đọc |
| `unreadCountUpdated`  | `[{ groupId: string, unreadCount: number }]`                                    | Cập nhật số tin nhắn chưa đọc  |
| `newMessage`          | `MessageObject`                                                                 | Thông báo tin nhắn mới         |
| `newNotification`     | `{ type: 'NEW_MESSAGE', groupId: string, message: MessageObject }`              | Thông báo có tin nhắn mới      |
| `messageRecalled`     | `{ messageId: string, groupId: string }`                                        | Thông báo tin nhắn bị thu hồi  |
| `messageDeleted`      | `{ messageId: string, userId: string }`                                         | Thông báo tin nhắn bị xóa      |
| `socketError`         | `{ message: string, error: string }`                                            | Thông báo lỗi socket           |

## Luồng xử lý

### Luồng kết nối

1. **Kết nối ban đầu**

   ```javascript
   // Frontend
   const socket = io('/chat');

   // Đăng ký profile
   socket.emit('register', { profileId: 'user-id' }, (response) => {
     if (response.status === 'success') {
       console.log('Đăng ký socket thành công');
     }
   });

   // Lắng nghe số tin nhắn chưa đọc ban đầu
   socket.on('initialUnreadCounts', (unreadCounts) => {
     // Hiển thị số tin nhắn chưa đọc
   });
   ```

2. **Lắng nghe sự kiện cập nhật trạng thái người dùng**

   ```javascript
   socket.on('userStatusUpdate', (data) => {
     // Cập nhật UI trạng thái người dùng (online/offline, active/inactive)
   });
   ```

3. **Ngắt kết nối**
   ```javascript
   // Khi người dùng đóng ứng dụng hoặc thoát
   socket.disconnect();
   ```

### Luồng gửi tin nhắn

1. **Gửi tin nhắn văn bản**

   ```javascript
   // Frontend gửi API request
   const sendTextMessage = async (groupId, message, senderId) => {
     try {
       const response = await axios.post('/chat/send', {
         groupId,
         message,
         type: 'TEXT',
         senderId,
       });

       if (response.data.status === 'success') {
         // Thông báo tin nhắn mới qua socket
         socket.emit('send', {
           messageId: response.data.data.messageId,
           groupId: response.data.data.groupId,
           senderId: response.data.data.senderId,
         });
       }
     } catch (error) {
       console.error('Lỗi khi gửi tin nhắn:', error);
     }
   };
   ```

2. **Gửi tin nhắn có file (ảnh hoặc video)**

   ```javascript
   const sendMediaMessage = async (groupId, file, type, senderId) => {
     try {
       const formData = new FormData();
       formData.append('file', file);
       formData.append('groupId', groupId);
       formData.append('type', type); // 'IMAGE' hoặc 'VIDEO'
       formData.append('senderId', senderId);

       const response = await axios.post('/chat/send', formData, {
         headers: {
           'Content-Type': 'multipart/form-data',
         },
       });

       if (response.data.status === 'success') {
         // Thông báo tin nhắn mới qua socket
         socket.emit('send', {
           messageId: response.data.data.messageId,
           groupId: response.data.data.groupId,
           senderId: response.data.data.senderId,
         });
       }
     } catch (error) {
       console.error('Lỗi khi gửi tin nhắn media:', error);
     }
   };
   ```

3. **Gửi sticker**

   ```javascript
   const sendSticker = async (groupId, stickerUrl, senderId) => {
     try {
       const response = await axios.post('/chat/send', {
         groupId,
         message: stickerUrl,
         type: 'STICKER',
         senderId,
       });

       if (response.data.status === 'success') {
         // Thông báo tin nhắn mới qua socket
         socket.emit('send', {
           messageId: response.data.data.messageId,
           groupId: response.data.data.groupId,
           senderId: response.data.data.senderId,
         });
       }
     } catch (error) {
       console.error('Lỗi khi gửi sticker:', error);
     }
   };
   ```

4. **Lắng nghe tin nhắn mới**

   ```javascript
   // Lắng nghe tin nhắn mới trong cuộc trò chuyện đang mở
   socket.on('newMessage', (message) => {
     // Hiển thị tin nhắn mới vào UI
   });

   // Lắng nghe thông báo tin nhắn mới khi không trong cuộc trò chuyện
   socket.on('newNotification', (notification) => {
     if (notification.type === 'NEW_MESSAGE') {
       // Hiển thị thông báo cho người dùng
     }
   });

   // Lắng nghe cập nhật số tin nhắn chưa đọc
   socket.on('unreadCountUpdated', (unreadCounts) => {
     // Cập nhật số tin nhắn chưa đọc trong UI
   });
   ```

### Luồng đọc tin nhắn

1. **Mở cuộc trò chuyện**

   ```javascript
   const openChat = (groupId, profileId) => {
     socket.emit('open', { groupId, profileId }, (response) => {
       if (response.status === 'success') {
         // Lưu trữ activeUsers
         const { activeUsers, lastMessages } = response;
         // Hiển thị tin nhắn gần nhất
       }
     });
   };
   ```

2. **Đánh dấu tin nhắn đã đọc**

   ```javascript
   const markAsRead = (groupId, profileId) => {
     socket.emit('markAsRead', { groupId, profileId }, (response) => {
       if (response.status === 'success') {
         console.log(`Đã đánh dấu đọc ${response.count} tin nhắn`);
       }
     });
   };
   ```

3. **Lắng nghe sự kiện đọc tin nhắn**
   ```javascript
   socket.on('messagesRead', (data) => {
     const { profileId, messageIds } = data;
     // Cập nhật UI để hiển thị tin nhắn đã được đọc
   });
   ```

### Luồng thu hồi tin nhắn

1. **Thu hồi tin nhắn**

   ```javascript
   const recallMessage = async (messageId) => {
     try {
       const response = await axios.put(`/chat/recall/${messageId}`);

       if (response.data.status === 'success') {
         const { groupId } = response.data.data;

         // Thông báo thu hồi tin nhắn qua socket
         socket.emit('recall', {
           messageId,
           groupId,
         });
       }
     } catch (error) {
       console.error('Lỗi khi thu hồi tin nhắn:', error);
     }
   };
   ```

2. **Lắng nghe sự kiện thu hồi tin nhắn**
   ```javascript
   socket.on('messageRecalled', ({ messageId, groupId }) => {
     // Cập nhật UI để hiển thị tin nhắn đã bị thu hồi
   });
   ```

### Luồng xóa tin nhắn

1. **Xóa tin nhắn**

   ```javascript
   const deleteMessage = async (messageId) => {
     try {
       const response = await axios.delete(`/chat/delete/${messageId}`);

       if (response.data.status === 'success') {
         // Thông báo xóa tin nhắn qua socket (chỉ cho người dùng hiện tại)
         socket.emit('delete', {
           messageId,
           userId: getCurrentUserId(),
         });
       }
     } catch (error) {
       console.error('Lỗi khi xóa tin nhắn:', error);
     }
   };
   ```

2. **Lắng nghe sự kiện xóa tin nhắn**
   ```javascript
   socket.on('messageDeleted', ({ messageId, userId }) => {
     // Ẩn tin nhắn từ UI cho người dùng hiện tại
   });
   ```

### Luồng chuyển tiếp tin nhắn

1. **Chuyển tiếp tin nhắn**

   ```javascript
   const forwardMessage = async (messageId, targetGroupId) => {
     try {
       const response = await axios.post('/chat/forward', {
         messageId,
         targetGroupId,
       });

       if (response.data.status === 'success') {
         const { messageId: newMessageId } = response.data.data;

         // Thông báo chuyển tiếp tin nhắn qua socket
         socket.emit('forward', {
           messageId: newMessageId,
           targetGroupId,
           senderId: getCurrentUserId(),
         });
       }
     } catch (error) {
       console.error('Lỗi khi chuyển tiếp tin nhắn:', error);
     }
   };
   ```

2. **Tin nhắn chuyển tiếp được xử lý như tin nhắn mới**
   ```javascript
   // Lắng nghe tin nhắn mới (bao gồm cả tin nhắn chuyển tiếp)
   socket.on('newMessage', (message) => {
     // Kiểm tra nếu tin nhắn được chuyển tiếp
     if (message.forwardedFrom) {
       // Hiển thị UI đặc biệt cho tin nhắn được chuyển tiếp
     } else {
       // Hiển thị UI bình thường
     }
   });
   ```

## Lưu ý quan trọng

1. **Xử lý tin nhắn offline**

   - Khi người dùng không online, tin nhắn vẫn được lưu vào database
   - Khi người dùng online trở lại, họ sẽ nhận được `initialUnreadCounts`
   - Khi mở cuộc trò chuyện, họ sẽ nhận được tin nhắn gần nhất từ endpoint `open`

2. **Phân biệt các loại xóa tin nhắn**

   - **Thu hồi (Recall)**: Tin nhắn bị ẩn đi cho tất cả người dùng
   - **Xóa (Delete)**: Tin nhắn chỉ bị ẩn cho người dùng thực hiện xóa

3. **Trạng thái hoạt động**
   - **Online**: Người dùng đang kết nối với hệ thống
   - **Active**: Người dùng đang mở và xem một cuộc trò chuyện cụ thể
