import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// ============================================================================
// 1. CẤU HÌNH GOOGLE SIGN-IN CLIENT
// ============================================================================
const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '286340231733-gh3a161bch9t883cu5nm5c80e22lpplt.apps.googleusercontent.com';

const ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '286340231733-qgivinnpgkh481i8ghvsp021cbo53eir.apps.googleusercontent.com';

let GoogleSignin: any = null;
let statusCodes: any = {};
let isNativeAvailable = false;

try {
  // Nạp module native @react-native-google-signin/google-signin (chỉ có khi chạy native APK / Dev Client)
  const RNGoogleSignin = require('@react-native-google-signin/google-signin');
  if (RNGoogleSignin?.GoogleSignin && typeof RNGoogleSignin.GoogleSignin.hasPlayServices === 'function') {
    GoogleSignin = RNGoogleSignin.GoogleSignin;
    statusCodes = RNGoogleSignin.statusCodes || {};
    isNativeAvailable = true;
  }
} catch {
  // Đang chạy trên Expo Go chuẩn -> Không có native module Play Services
  isNativeAvailable = false;
}

let isConfigured = false;

export function configureGoogleSignIn() {
  if (!isNativeAvailable || isConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });
    isConfigured = true;
  } catch (err) {
    console.warn('[GoogleSignIn] Configure error:', err);
    isNativeAvailable = false;
  }
}

export type GoogleSignInResult =
  | { success: true; user?: any; token?: string; refreshToken?: string; idToken?: string }
  | { success: false; cancelled: boolean; error: string };

/**
 * Đăng nhập bằng tài khoản Google chuẩn (100% Google Thật):
 * - CHẾ ĐỘ 1 (Chuẩn Shopee / TikTok): Native Android Play Services Bottom Sheet (yêu cầu Dev Client / APK)
 * - CHẾ ĐỘ 2 (Khi chạy trên Expo Go): Mở Google OAuth xịn chính thức của Google (accounts.google.com)
 */
export async function signInWithGoogle(campus: string = 'HÒA LẠC'): Promise<GoogleSignInResult> {
  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 1: BẢN NATIVE (DEV CLIENT / APK) -> BẬT BOTTOM SHEET GOOGLE PLAY SERVICES
  // --------------------------------------------------------------------------
  if (isNativeAvailable) {
    configureGoogleSignIn();
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      // Hỗ trợ cả 2 định dạng response của thư viện (v13+ và v16+)
      const userInfo = (response as any)?.data ?? response;
      const idToken: string | null = userInfo?.idToken ?? userInfo?.serverAuthCode ?? null;

      if (!idToken) {
        return {
          success: false,
          cancelled: false,
          error: 'Google không trả về ID Token. Vui lòng kiểm tra lại Web Client ID trong Google Cloud Console.',
        };
      }

      return {
        success: true,
        idToken,
      };
    } catch (error: any) {
      console.log('[Google Native Sign-In Error]:', error);

      if (
        error.code === statusCodes?.SIGN_IN_CANCELLED ||
        error.code === '12501' ||
        error.message?.includes('cancel')
      ) {
        return { success: false, cancelled: true, error: 'Bạn đã hủy chọn tài khoản Google' };
      }

      if (error.code === statusCodes?.IN_PROGRESS) {
        return { success: false, cancelled: false, error: 'Đang trong quá trình kết nối với Google...' };
      }

      if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, cancelled: false, error: 'Thiết bị chưa cài đặt hoặc chưa cập nhật Google Play Services' };
      }

      // Lỗi Code 10 (DEVELOPER_ERROR) phổ biến nhất do sai SHA-1 hoặc sai package name
      if (String(error.code) === '10' || error.message?.includes('DEVELOPER_ERROR')) {
        return {
          success: false,
          cancelled: false,
          error:
            'Lỗi cấu hình Google (Code 10 - DEVELOPER_ERROR):\n' +
            'Mã SHA-1 của máy bạn chưa được thêm vào Firebase/Google Cloud Console cho app com.fu.secondhandmarket.\n' +
            'Mã SHA-1: 8C:CD:27:A3:65:4F:D8:5B:E3:06:47:B2:2E:51:63:BF:32:73:B2:55',
        };
      }

      return {
        success: false,
        cancelled: false,
        error: error?.message || 'Đăng nhập Google qua Google Play Services thất bại',
      };
    }
  }

  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 2: ĐANG CHẠY TRÊN EXPO GO (CHƯA CHẠY DEV CLIENT NATIVE)
  // --------------------------------------------------------------------------
  // Lưu ý: Expo Go không chứa mã Java native của Google Play Services,
  // do đó không thể bật Bottom Sheet của Android trong Expo Go.
  // Chúng ta hướng dẫn người dùng chạy bản Native hoặc dùng Google OAuth xịn.
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'fu-market',
      path: 'auth/google',
    });

    const state = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 15);

    // Mở trang đăng nhập CHÍNH THỨC của Google (accounts.google.com)
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(WEB_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&state=${state}` +
      `&nonce=${nonce}`;

    const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Parse id_token từ URL hash callback (#id_token=...)
      const hashPart = result.url.includes('#') ? result.url.split('#')[1] : '';
      const params = new URLSearchParams(hashPart);
      const idToken = params.get('id_token');

      if (idToken) {
        return {
          success: true,
          idToken,
        };
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, cancelled: true, error: 'Bạn đã hủy đăng nhập Google' };
    }

    return {
      success: false,
      cancelled: false,
      error:
        'Để có trải nghiệm chọn tài khoản trượt từ dưới lên (Bottom Sheet) 100% như Shopee/TikTok, ' +
        'vui lòng chạy bản Native Build: `npx expo run:android`. ' +
        '(Expo Go mặc định không hỗ trợ native Google Play Services)',
    };
  } catch (err: any) {
    return {
      success: false,
      cancelled: false,
      error: err?.message || 'Không thể mở phiên đăng nhập Google',
    };
  }
}

export async function signOutGoogle(): Promise<void> {
  if (isNativeAvailable) {
    try {
      configureGoogleSignIn();
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
  }
}
