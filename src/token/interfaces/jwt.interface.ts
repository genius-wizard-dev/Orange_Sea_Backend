export interface JwtPayload {
  username: string;
  role: string;
  sub?: string;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh'; // Thêm loại token để phân biệt
  jti?: string; // Token ID duy nhất để có thể vô hiệu hóa token cụ thể
}

export interface DeviceData {
  ip: string;
  fcmToken?: string;
  lastLogin: string;
  refreshToken: string;
}

export interface UserDevices {
  [deviceId: string]: DeviceData;
}

export interface RefreshTokenRedisPayload {
  token: string;
  userId: string;
  fingerprint: string;
  expiresAt: Date;
}
