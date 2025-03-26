import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClientIp } from 'request-ip';

export interface DeviceInfo {
  deviceId: string;    // Required field
  fcmToken?: string;   // Optional field
  ip: string;         // Optional field
}

export const DeviceHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DeviceInfo => {
    const request = ctx.switchToHttp().getRequest();
    const deviceId = request.headers['x-device-id']?.toString();
    const fcmToken = request.headers['x-fcm-token']?.toString();

    if (!deviceId) {
      throw new Error('x-device-id header is required');
    }

    return {
      deviceId,
      fcmToken: fcmToken || undefined,
      ip: getClientIp(request) || "unknown",
    };
  },
);
