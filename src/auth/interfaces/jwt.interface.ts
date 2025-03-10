export interface JwtPayload {
  username: string;
  role: string;
  sub?: string;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh'; // Thêm loại token để phân biệt
  jti?: string; // Token ID duy nhất để có thể vô hiệu hóa token cụ thể
}

export interface RefreshTokenRedisPayload {
  token: string;
  userId: string;
  fingerprint: string;
  expiresAt: Date;
}
