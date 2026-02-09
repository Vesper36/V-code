// Admin authentication - simple fixed credentials

export interface AdminUser {
  username: string;
  loginTime: number;
}

const ADMIN_SESSION_KEY = 'admin_session';

export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  return username === adminUser && password === adminPass;
}

export function saveAdminSession(user: AdminUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  }
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const user: AdminUser = JSON.parse(raw);
    if (Date.now() - user.loginTime > 24 * 60 * 60 * 1000) {
      clearAdminSession();
      return null;
    }
    return user;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
