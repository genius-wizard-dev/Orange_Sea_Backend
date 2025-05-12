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
    try {
      const message: admin.messaging.Message = {
        token,
        notification: { title, body },
        data,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Push to device ${token} | messageId: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(`❌ Push to device ${token} failed: ${error.message}`);
      return { success: false, error };
    }
  }

  async sendNotificationToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<{ success: boolean; results?: any[]; errors?: any[] }> {
    try {
      if (!tokens || tokens.length === 0) {
        return { success: false, errors: ['No tokens provided'] };
      }

      // Xử lý từng token riêng lẻ và sử dụng Promise.all để gửi song song
      const notificationPromises = tokens.map((token) =>
        this.sendNotificationToDevice(token, title, body, data),
      );

      const results = await Promise.all(notificationPromises);

      // Đếm số lượng thành công và thất bại
      const successCount = results.filter((result) => result.success).length;
      const failureCount = results.length - successCount;

      this.logger.log(
        `✅ Push to ${successCount}/${tokens.length} devices succeeded, ${failureCount} failed`,
      );

      return {
        success: successCount > 0,
        results,
      };
    } catch (error) {
      this.logger.error(`❌ Push to multiple devices failed: ${error.message}`);
      return { success: false, errors: [error] };
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
