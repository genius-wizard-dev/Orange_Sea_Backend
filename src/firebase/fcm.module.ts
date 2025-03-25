import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FcmService } from './fcm.service';

@Module({
  providers: [FcmService],
  exports: [FcmService],
})
export class FcmModule {
  constructor() {

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  }
}
