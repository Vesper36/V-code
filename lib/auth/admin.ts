// Admin authentication - server-side session based

export interface AdminUser {
  username: string;
  loginTime: number;
}

const ADMIN_SESSION_KEY = 'admin_session';

// Login via server API (credentials validated server-side)
export async function adminLogin(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { success: false, error: data?.error || 'Login failed' };
    }

    const data = await response.json();
    // Save minimal client-side session info (for UI display only)
    saveAdminSession({ username: data.username, loginTime: Date.now() });
    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// Logout via server API
export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/auth', { method: 'DELETE' });
  } catch {
    // Ignore network errors on logout
  }
  clearAdminSession();
}

// Check if session is valid (server-side check)
export async function checkAdminSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/auth');
    if (response.ok) {
      const data = await response.json();
      return data.authenticated === true;
    }
    return false;
  } catch {
    return false;
  }
}

// Client-side session helpers (for UI display only, not security)
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
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

// Quick client-side check (for initial render, not authoritative)
export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
