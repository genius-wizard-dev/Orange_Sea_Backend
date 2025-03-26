// src/common/fcm/fcm.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  async sendNotificationToDevice(
    token: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const message: admin.messaging.Message = {
      token,
      notification: { title, body },
      data,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Push to device ${token} | messageId: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(`❌ Push to device ${token} failed: ${error.message}`);
      return { success: false, error };
    }
  }

  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<{ success: boolean; messageId?: string; error?: any }> {
    const message: admin.messaging.Message = {
      topic,
      notification: { title, body },
      data,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Push to topic "${topic}" | messageId: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(`❌ Push to topic "${topic}" failed: ${error.message}`);
      return { success: false, error };
    }
  }
}
