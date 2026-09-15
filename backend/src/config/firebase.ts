import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';
import { ENV } from './env';

let app: App | undefined;

if (!getApps().length) {
  try {
    let resolvedKeyPath = '';
    if (ENV.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const candidates = [
        ENV.FIREBASE_SERVICE_ACCOUNT_KEY,
        path.resolve(process.cwd(), ENV.FIREBASE_SERVICE_ACCOUNT_KEY),
        path.resolve(__dirname, '../../', ENV.FIREBASE_SERVICE_ACCOUNT_KEY),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          resolvedKeyPath = p;
          break;
        }
      }
    }

    if (resolvedKeyPath) {
      app = initializeApp({
        credential: cert(resolvedKeyPath),
      });
      console.log('✅ Firebase Admin SDK initialized with Service Account Key');
    } else if (ENV.FIREBASE_PROJECT_ID) {
      app = initializeApp({
        projectId: ENV.FIREBASE_PROJECT_ID,
      });
      console.log('⚠️ Firebase Admin SDK initialized with default projectId (no service account file)');
    }
  } catch (error) {
    console.warn('⚠️ Warning: Firebase Admin failed to initialize:', error);
  }
} else {
  app = getApps()[0];
}

export const firebaseAuth = app
  ? getAuth(app)
  : ({
      verifyIdToken: async () => {
        throw new Error('Firebase Admin SDK chưa được cấu hình Service Account Key.');
      },
    } as unknown as ReturnType<typeof getAuth>);

export const firebaseMessaging = app ? getMessaging(app) : undefined;
