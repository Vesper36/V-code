/**
 * Admin API Client for New API management endpoints
 */

// Admin API uses system access token from env var

export interface AdminToken {
  id: number;
  key: string;
  name: string;
  status: number; // 1: enabled, 2: disabled
  remain_quota: number;
  used_quota: number;
  unlimited_quota: boolean;
  created_time: number;
  accessed_time: number;
  expired_time: number;
  models: string[];
  group: string;
}

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: number;
  status: number;
  email: string;
  quota: number;
  used_quota: number;
  request_count: number;
  created_time: number;
  group: string;
}

export interface AdminChannel {
  id: number;
  type: number;
  key: string;
  name: string;
  status: number;
  models: string[];
  model_mapping: string;
  priority: number;
  weight: number;
}

export interface AdminLogItem {
  id: number;
  user_id: number;
  created_at: number;
  type: number;
  content: string;
  username: string;
  token_name: string;
  model_name: string;
  quota: number;
  prompt_tokens: number;
  completion_tokens: number;
  channel_id: number;
}

/**
 * Get an AdminAPIClient instance.
 * No token needed - auth is handled by httpOnly cookie via admin-proxy.
 */
export function getAdminClient(): AdminAPIClient {
  return new AdminAPIClient();
}

export class AdminAPIClient {
  private async fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api/admin-proxy?path=${encodeURIComponent(path)}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || errorData?.error?.message || response.statusText);
    }

    return await response.json();
  }

  // Token Management
  async getTokens(page: number = 1, perPage: number = 20): Promise<{ data: AdminToken[]; total: number }> {
    const result = await this.fetchAPI<any>(`/api/token/?p=${page - 1}&size=${perPage}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  async createToken(data: {
    name: string;
    remain_quota?: number;
    expired_time?: number;
    unlimited_quota?: boolean;
    models?: string[];
  }): Promise<AdminToken | null> {
    const result = await this.fetchAPI<any>('/api/token/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data || null;
  }

  async updateToken(id: number, data: Partial<AdminToken>): Promise<boolean> {
    await this.fetchAPI<any>('/api/token/', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    });
    return true;
  }

  async deleteToken(id: number): Promise<boolean> {
    await this.fetchAPI<any>(`/api/token/${id}/`, { method: 'DELETE' });
    return true;
  }

  async toggleTokenStatus(id: number, status: number): Promise<boolean> {
    await this.fetchAPI<any>('/api/token/', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    return true;
  }

  // User Management
  async getUsers(page: number = 1, perPage: number = 20): Promise<{ data: AdminUser[]; total: number }> {
    const result = await this.fetchAPI<any>(`/api/user/?p=${page - 1}&size=${perPage}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  async updateUserQuota(id: number, quota: number): Promise<boolean> {
    await this.fetchAPI<any>('/api/user/', {
      method: 'PUT',
      body: JSON.stringify({ id, quota }),
    });
    return true;
  }

  async updateUserStatus(id: number, status: number): Promise<boolean> {
    await this.fetchAPI<any>('/api/user/manage', {
      method: 'POST',
      body: JSON.stringify({ id, status, action: 'status' }),
    });
    return true;
  }

  // Log Management
  async getLogs(page: number = 1, perPage: number = 20): Promise<{ data: AdminLogItem[]; total: number }> {
    const result = await this.fetchAPI<any>(`/api/log/?p=${page - 1}&size=${perPage}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  async searchLogs(params: {
    keyword?: string;
    token_name?: string;
    model_name?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    page?: number;
    perPage?: number;
  }): Promise<{ data: AdminLogItem[]; total: number }> {
    const query = new URLSearchParams();
    query.set('p', String((params.page || 1) - 1));
    query.set('size', String(params.perPage || 20));
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.token_name) query.set('token_name', params.token_name);
    if (params.model_name) query.set('model_name', params.model_name);
    if (params.start_timestamp) query.set('start_timestamp', String(params.start_timestamp));
    if (params.end_timestamp) query.set('end_timestamp', String(params.end_timestamp));

    const result = await this.fetchAPI<any>(`/api/log/search?${query.toString()}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  // Channel Management
  async getChannels(page: number = 1, perPage: number = 20): Promise<{ data: AdminChannel[]; total: number }> {
    const result = await this.fetchAPI<any>(`/api/channel/?p=${page - 1}&size=${perPage}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  async createChannel(data: {
    name: string;
    type: number;
    key: string;
    base_url?: string;
    models: string;
    model_mapping?: string;
    priority?: number;
    weight?: number;
    group?: string;
  }): Promise<boolean> {
    await this.fetchAPI<any>('/api/channel/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return true;
  }

  async updateChannel(id: number, data: Partial<AdminChannel>): Promise<boolean> {
    await this.fetchAPI<any>('/api/channel/', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    });
    return true;
  }

  async deleteChannel(id: number): Promise<boolean> {
    await this.fetchAPI<any>(`/api/channel/${id}/`, { method: 'DELETE' });
    return true;
  }

  async toggleChannelStatus(id: number, status: number): Promise<boolean> {
    await this.fetchAPI<any>('/api/channel/', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    return true;
  }

  async testChannel(id: number, model: string): Promise<{ success: boolean; time?: number; error?: string }> {
    try {
      const result = await this.fetchAPI<any>(`/api/channel/test/${id}?model=${encodeURIComponent(model)}`);
      return { success: result.success !== false, time: result.time };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // User search
  async searchUsers(keyword: string, page: number = 1, perPage: number = 20): Promise<{ data: AdminUser[]; total: number }> {
    const result = await this.fetchAPI<any>(`/api/user/search?keyword=${encodeURIComponent(keyword)}&p=${page - 1}&size=${perPage}`);
    const paged = result.data || {};
    return { data: paged.items || [], total: paged.total || 0 };
  }

  // User group management
  async updateUserGroup(id: number, group: string): Promise<boolean> {
    await this.fetchAPI<any>('/api/user/', {
      method: 'PUT',
      body: JSON.stringify({ id, group }),
    });
    return true;
  }

  // System config
  async getSystemConfig(): Promise<Record<string, any>> {
    const result = await this.fetchAPI<any>('/api/option/');
    return result.data || {};
  }

  async updateSystemConfig(key: string, value: string): Promise<boolean> {
    await this.fetchAPI<any>('/api/option/', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
    return true;
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeTokens: number;
    totalQuota: number;
    usedQuota: number;
    todayConsumption: number;
    todayRequests: number;
  }> {
    const [users, tokens, logs] = await Promise.all([
      this.getUsers(1, 100),
      this.getTokens(1, 100),
      this.getLogs(1, 100),
    ]);

    let totalQuota = 0;
    let usedQuota = 0;
    let activeCount = 0;
    for (const t of tokens.data) {
      if (t.status === 1) activeCount++;
      totalQuota += t.remain_quota + t.used_quota;
      usedQuota += t.used_quota;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = Math.floor(todayStart.getTime() / 1000);

    let todayConsumption = 0;
    let todayRequests = 0;
    for (const log of logs.data) {
      if (log.created_at >= todayTs && log.type === 2) {
        todayConsumption += log.quota;
        todayRequests++;
      }
    }

    return {
      totalUsers: users.total,
      activeTokens: activeCount,
      totalQuota,
      usedQuota,
      todayConsumption,
      todayRequests,
    };
  }

  // Usage trend aggregated from logs
  async getUsageTrend(days: number = 7): Promise<Array<{
    date: string;
    requests: number;
    quota: number;
    tokens: number;
  }>> {
    const result = await this.getLogs(1, 100);
    const logs = result.data;

    const map = new Map<string, { requests: number; quota: number; tokens: number }>();

    // Initialize last N days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { requests: 0, quota: 0, tokens: 0 });
    }

    for (const log of logs) {
      if (log.type !== 2) continue;
      const date = new Date(log.created_at * 1000).toISOString().split('T')[0];
      const entry = map.get(date);
      if (entry) {
        entry.requests++;
        entry.quota += log.quota;
        entry.tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0);
      }
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  }

  // Model usage distribution from logs
  async getModelDistribution(): Promise<Array<{
    model: string;
    requests: number;
    quota: number;
    tokens: number;
  }>> {
    const result = await this.getLogs(1, 100);
    const logs = result.data;

    const map = new Map<string, { requests: number; quota: number; tokens: number }>();

    for (const log of logs) {
      if (log.type !== 2 || !log.model_name) continue;
      if (!map.has(log.model_name)) {
        map.set(log.model_name, { requests: 0, quota: 0, tokens: 0 });
      }
      const entry = map.get(log.model_name)!;
      entry.requests++;
      entry.quota += log.quota;
      entry.tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0);
    }

    return Array.from(map.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.requests - a.requests);
  }

  // Recent activity for dashboard
  async getRecentActivity(limit: number = 10): Promise<AdminLogItem[]> {
    const result = await this.getLogs(1, limit);
    return (result.data || []).slice(0, limit);
  }
}
