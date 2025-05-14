export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
  type: 'access' | 'refresh';
  jti: string;
}

export interface DeviceData {
  ip: string;
  fcmToken: string;
  token: string;
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
