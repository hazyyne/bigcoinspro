/**
 * Utility function to completely clear user session, storage, and cookies.
 * 
 * Đáp ứng đầy đủ các yêu cầu:
 * 1. Xóa sạch localStorage & sessionStorage
 * 2. Xóa toàn bộ Cookies phiên đăng nhập
 * 3. Hỗ trợ callback reset React State / Context hoặc Firebase signOut()
 * 4. Kèm thông báo console chi tiết sau khi hoàn tất
 */

export interface ClearSessionOptions {
  /** Xóa toàn bộ localStorage (mặc định: true) */
  clearLocalStorage?: boolean;
  /** Xóa toàn bộ sessionStorage (mặc định: true) */
  clearSessionStorage?: boolean;
  /** Xóa toàn bộ cookies của trang web / phiên đăng nhập (mặc định: true) */
  clearCookies?: boolean;
  /** Callback tùy chọn để reset State / Context trong React về null / false */
  onStateReset?: () => void;
  /** Callback tùy chọn để gọi Firebase signOut() hoặc API backend */
  onSignOut?: () => Promise<void> | void;
}

/**
 * Xóa toàn bộ cookies hiện có trên client
 */
export function clearAllCookies(): void {
  try {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (!name) return;

      // Xóa cookie ở path mặc định và root path
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
      
      // Xóa nếu có subdomain
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const rootDomain = domainParts.slice(-2).join('.');
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain};`;
      }
    });

    console.info('[AuthUtility] Đã dọn dẹp sạch toàn bộ Cookies phiên đăng nhập.');
  } catch (error) {
    console.error('[AuthUtility] Lỗi khi xóa Cookies:', error);
  }
}

/**
 * Hàm tiện ích chính: Xóa sạch phiên đăng nhập, bộ nhớ cục bộ, cookies và reset state
 */
export async function clearAllSessionData(options: ClearSessionOptions = {}): Promise<void> {
  const {
    clearLocalStorage = true,
    clearSessionStorage = true,
    clearCookies = true,
    onStateReset,
    onSignOut,
  } = options;

  console.group('[AuthUtility] Bắt đầu quy trình dọn dẹp phiên đăng nhập (Sign Out & Clear Session)');

  try {
    // 1. Gọi Firebase signOut hoặc backend API nếu có truyền vào
    if (onSignOut) {
      try {
        console.log('[AuthUtility] Đang thực thi signOut()...');
        await onSignOut();
        console.log('[AuthUtility] Đã gọi signOut() thành công.');
      } catch (err) {
        console.error('[AuthUtility] Lỗi khi thực thi signOut():', err);
      }
    }

    // 2. Xóa sạch localStorage
    if (clearLocalStorage && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
      console.log('[AuthUtility] Đã xóa sạch toàn bộ dữ liệu trong localStorage.');
    }

    // 3. Xóa sạch sessionStorage
    if (clearSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
      console.log('[AuthUtility] Đã xóa sạch toàn bộ dữ liệu trong sessionStorage.');
    }

    // 4. Xóa toàn bộ Cookies
    if (clearCookies) {
      clearAllCookies();
    }

    // 5. Reset React State / Context về trạng thái ban đầu (null / false)
    if (onStateReset) {
      console.log('[AuthUtility] Đang reset React State về giá trị ban đầu (null / false)...');
      onStateReset();
      console.log('[AuthUtility] Đã reset React State thành công.');
    }

    console.info('%c[AuthUtility] Đã đăng xuất và xóa sạch toàn bộ phiên thành công!', 'color: #10b981; font-weight: bold;');
  } catch (error) {
    console.error('[AuthUtility] Đã xảy ra lỗi trong quá trình dọn dẹp phiên:', error);
  } finally {
    console.groupEnd();
  }
}
