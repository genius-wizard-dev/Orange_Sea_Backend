# Socket Event Documentation

## Giới thiệu

Tài liệu này mô tả các sự kiện WebSocket được sử dụng trong hệ thống Orange Sea Backend. WebSocket cung cấp kết nối hai chiều giữa client và server, cho phép giao tiếp thời gian thực cho các tính năng như nhắn tin, thông báo và cập nhật trạng thái.

## Thiết lập kết nối

Kết nối đến namespace `/ws`:

```javascript
const socket = io('https://your-backend-url/ws', {
  transports: ['websocket'],
  autoConnect: true,
});
```

## Sự kiện từ Client đến Server

### Đăng ký kết nối

```javascript
socket.emit('register', {
  profileId: 'user-profile-id',
  deviceId: 'device-id',
});
```

### Cập nhật thông tin

```javascript
socket.emit('updateProfile');
```

### Cập nhật mật khẩu

```javascript
socket.emit('updatePassword');
```

### Đặt lại mật khẩu

```javascript
socket.emit('resetPassword', { profileId: 'user-profile-id' });
```

### Xử lý kết bạn

```javascript
socket.emit('handleFriend', { friendShipId: 'friendship-id' });
```

### Hủy kết bạn

```javascript
socket.emit('deleteFriend', { friendShipId: 'friendship-id' });
```

### Xử lý nhóm

```javascript
socket.emit('handleGroup', { groupId: 'group-id' });
```

### Xử lý thành viên nhóm

```javascript
socket.emit('handleMemberGroup', { groupId: 'group-id' });
```

### Mở nhóm chat

```javascript
socket.emit('open', { profileId: 'user-profile-id', groupId: 'group-id' });
```

### Đóng nhóm chat

```javascript
socket.emit('close', { profileId: 'user-profile-id', groupId: 'group-id' });
```

### Gửi tin nhắn

```javascript
socket.emit('sendMessage', { messageId: 'message-id' });
```

### Thu hồi tin nhắn

```javascript
socket.emit('recallMessage', { messageId: 'message-id' });
```

### Chỉnh sửa tin nhắn

```javascript
socket.emit('editMessage', { messageId: 'message-id' });
```

### Xóa tin nhắn

```javascript
socket.emit('deleteMessage', { messageId: 'message-id' });
```

## Sự kiện từ Server đến Client

### Trạng thái bạn bè

```javascript
socket.on('friendOnline', (data) => {
  // data: { profileId: 'friend-profile-id' }
});

socket.on('friendOffline', (data) => {
  // data: { profileId: 'friend-profile-id' }
});

socket.on('friendStatus', (data) => {
  // data: { online: ['friend-id-1', 'friend-id-2'], offline: ['friend-id-3'] }
});

socket.on('friendDeleted', (data) => {
  // data: { success: true, message: 'Thông báo hủy kết bạn', friendshipId: 'friendship-id' }
});
```

### Yêu cầu kết bạn

```javascript
socket.on('friendShip', (data) => {
  // data: {
  //   receivedRequests: [...], // Yêu cầu kết bạn nhận được
  //   sendingRequests: [...] // Yêu cầu kết bạn đã gửi
  // }
});

socket.on('handleFriend', () => {
  // Cập nhật trạng thái kết bạn
});
```

### Quản lý nhóm

```javascript
socket.on('handleGroup', (data) => {
  // data: { groupId: 'group-id' }
});

socket.on('handleMemberGroup', (data) => {
  // data: { groupId: 'group-id' }
});

socket.on('memberOpenGroup', (data) => {
  // data: { profileId: 'user-profile-id' }
});

socket.on('memberCloseGroup', (data) => {
  // data: { profileId: 'user-profile-id' }
});
```

### Cập nhật profile

```javascript
socket.on('profileUpdated', () => {
  // Thông báo khi profile được cập nhật
});

socket.on('passwordUpdated', () => {
  // Thông báo khi mật khẩu được cập nhật
});

socket.on('passwordReset', () => {
  // Thông báo khi mật khẩu được đặt lại
});
```

### Tin nhắn

```javascript
socket.on('unReadMessages', (data) => {
  // data: Danh sách tin nhắn chưa đọc
});

socket.on('messagesRead', (data) => {
  // data: {
  //   profileId: 'user-profile-id',
  //   groupId: 'group-id',
  //   messageIds: ['message-id-1', 'message-id-2']
  // }
});

socket.on('receiveMessage', (message) => {
  // message: Chi tiết tin nhắn mới
  // {
  //   id: 'message-id',
  //   content: 'Nội dung tin nhắn',
  //   type: 'TEXT|IMAGE|VIDEO|RAW',
  //   groupId: 'group-id',
  //   sender: { id: 'sender-id', name: 'Tên người gửi' },
  //   createdAt: timestamp
  //   ... các thông tin khác
  // }
});

socket.on('notifyMessage', (message) => {
  // Thông báo tin nhắn mới khi không mở nhóm chat
  // Cấu trúc giống receiveMessage
});

socket.on('messageRecall', (data) => {
  // data: { groupId: 'group-id', messageId: 'message-id' }
});

socket.on('notifyRecallMessage', (data) => {
  // data: { groupId: 'group-id', messageId: 'message-id' }
});

socket.on('messageEdit', (data) => {
  // data: { groupId: 'group-id', messageId: 'message-id' }
});

socket.on('notifyEditMessage', (data) => {
  // data: { groupId: 'group-id', messageId: 'message-id' }
});

socket.on('messageDelete', (data) => {
  // data: { groupId: 'group-id', messageId: 'message-id' }
});

socket.on('notifyMessageDelete', (data) => {
  // data: { groupId: 'group-id' }
});
```

## Xử lý lỗi

```javascript
socket.on('error', (error) => {
  // error: { message: 'Thông báo lỗi' }
});

socket.on('connect_error', (error) => {
  console.error('Lỗi kết nối:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Ngắt kết nối:', reason);
});
```

## Luồng hoạt động

### Đăng nhập và kết nối

1. Đăng nhập và nhận JWT token
2. Kết nối socket và gọi `register` với profileId và deviceId
3. Nhận trạng thái bạn bè (`friendStatus`), yêu cầu kết bạn (`friendShip`) và tin nhắn chưa đọc (`unReadMessages`)

### Chat nhóm

1. Mở nhóm chat: Gọi `open` với groupId
2. Nhận tin nhắn trong nhóm thông qua `receiveMessage`
3. Gửi tin nhắn mới: Gọi API backend để tạo tin nhắn, sau đó gọi `sendMessage` với messageId
4. Đóng nhóm chat: Gọi `close` với groupId

### Quản lý tin nhắn

1. Thu hồi: Gọi API backend, sau đó gọi `recallMessage` với messageId
2. Chỉnh sửa: Gọi API backend, sau đó gọi `editMessage` với messageId
3. Xóa: Gọi API backend, sau đó gọi `deleteMessage` với messageId

### Quản lý liên hệ

1. Xử lý yêu cầu kết bạn: Gọi API backend, sau đó gọi `handleFriend` với friendShipId

### Quản lý nhóm

1. Xử lý yêu cầu nhóm: Gọi API backend, sau đó gọi `handleGroup` với groupId
2. Xử lý thành viên: Gọi API backend, sau đó gọi `handleMemberGroup` với groupId

## Cấu trúc dữ liệu chi tiết

### Cấu trúc tin nhắn

```typescript
interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'RAW';
  groupId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string; // ISO timestamp
  updatedAt?: string;
  readBy?: string[]; // Danh sách ID người đã đọc
  recall?: boolean; // Tin nhắn đã bị thu hồi hay chưa
  media?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number; // Cho video
    size?: number; // Kích thước file
  };
}
```

### Cấu trúc dữ liệu yêu cầu kết bạn

```typescript
interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}
```

## Ví dụ tích hợp

### Thiết lập kết nối và xử lý đăng nhập

```javascript
import { io } from 'socket.io-client';

// Tạo instance Socket.IO với token
function setupSocketConnection(token, profileId, deviceId) {
  const socket = io('https://your-backend-url/ws', {
    transports: ['websocket'],
    autoConnect: true,
    auth: {
      token,
    },
  });

  // Xử lý sự kiện kết nối
  socket.on('connect', () => {
    console.log('Đã kết nối socket, ID:', socket.id);

    // Đăng ký profile ID và device ID
    socket.emit('register', { profileId, deviceId }, (response) => {
      if (response.success) {
        console.log('Đăng ký socket thành công');
      } else {
        console.error('Lỗi đăng ký socket:', response.message);
      }
    });
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', (reason) => {
    console.log('Socket bị ngắt kết nối:', reason);

    if (reason === 'io server disconnect') {
      // Server ngắt kết nối, cần kết nối lại thủ công
      socket.connect();
    }
    // Nguyên nhân khác, tự động kết nối lại
  });

  return socket;
}
```

### Quản lý trạng thái online/offline của bạn bè

```javascript
// Theo dõi trạng thái bạn bè
function trackFriendStatus(socket, friendStore) {
  // Nhận danh sách bạn bè online/offline khi kết nối
  socket.on('friendStatus', (data) => {
    const { online, offline } = data;

    // Cập nhật store
    friendStore.updateOnlineStatus(online, offline);
  });

  // Khi bạn bè online
  socket.on('friendOnline', (data) => {
    const { profileId } = data;
    friendStore.setOnline(profileId, true);
  });

  // Khi bạn bè offline
  socket.on('friendOffline', (data) => {
    const { profileId } = data;
    friendStore.setOnline(profileId, false);
  });
}
```

### Xử lý tin nhắn nhóm

```javascript
// Xử lý tin nhắn nhóm
function handleGroupMessages(socket, messageStore) {
  // Mở nhóm chat
  function openGroup(profileId, groupId) {
    socket.emit('open', { profileId, groupId }, (response) => {
      if (response.success) {
        console.log('Đã mở nhóm chat:', groupId);
      } else {
        console.error('Lỗi khi mở nhóm chat:', response.message);
      }
    });
  }

  // Đóng nhóm chat
  function closeGroup(profileId, groupId) {
    socket.emit('close', { profileId, groupId }, (response) => {
      if (response.success) {
        console.log('Đã đóng nhóm chat:', groupId);
      } else {
        console.error('Lỗi khi đóng nhóm chat:', response.message);
      }
    });
  }

  // Lắng nghe tin nhắn mới
  socket.on('receiveMessage', (message) => {
    console.log('Nhận được tin nhắn mới:', message);
    messageStore.addMessage(message.groupId, message);
  });

  // Lắng nghe thông báo tin nhắn khi không mở nhóm
  socket.on('notifyMessage', (message) => {
    console.log('Thông báo tin nhắn mới:', message);
    messageStore.updateUnreadCount(message.groupId);
  });

  return {
    openGroup,
    closeGroup,
  };
}
```

## Mẹo xử lý lỗi và tối ưu hiệu suất

1. **Tự động kết nối lại**: Luôn triển khai cơ chế kết nối lại khi mất kết nối socket.

2. **Kiểm tra kết nối**: Kiểm tra trạng thái kết nối trước khi gửi sự kiện quan trọng.

3. **Xử lý lỗi**: Luôn xử lý lỗi từ server và hiển thị thông báo phù hợp cho người dùng.

4. **Quản lý tài nguyên**: Đóng kết nối socket khi không cần thiết để tiết kiệm tài nguyên.

5. **Debounce và throttle**: Áp dụng debounce hoặc throttle cho các sự kiện gửi đi thường xuyên.

6. **Phân chia module**: Tách mã xử lý socket thành các module riêng biệt dựa trên tính năng.

## Chú ý bảo mật

1. Luôn xác thực người dùng trước khi cho phép kết nối socket.

2. Kiểm tra quyền truy cập vào nhóm chat trước khi gửi và nhận tin nhắn.

3. Xác thực các tham số đầu vào để tránh các cuộc tấn công.

4. Sử dụng SSL/TLS cho kết nối socket để bảo vệ dữ liệu.
