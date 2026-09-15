import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Cấu hình Firebase Client cho Mobile Expo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAco0MBg0sppTmSSOOjreeOaWiTvlRrmvY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "marketfu-1cdf7.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "marketfu-1cdf7",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "marketfu-1cdf7.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "286340231733",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:286340231733:web:1632e15aa97b2b030c377c",
};

// 2. Khởi tạo Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 3. Khởi tạo Firebase Auth với cơ chế lưu phiên tự động trên Mobile (AsyncStorage)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
