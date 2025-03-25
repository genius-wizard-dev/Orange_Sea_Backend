import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  async sendNotificationToDevice(token: string, title: string, body: string, data?: Record<string, string>) {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  }

  async sendNotificationToTopic(topic: string, title: string, body: string, data?: Record<string, string>) {
    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent to topic:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending to topic:', error);
      return { success: false, error };
    }
  }
}
