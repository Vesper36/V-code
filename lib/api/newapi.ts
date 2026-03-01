import { QuotaInfo, UsageData, ModelStats } from '@/lib/types';

export interface LogItem {
  id: number;
  model_name: string;
  tokens: number;
  cost: number;
  created_at: string;
  is_stream: boolean;
}

export class NewAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchAPI<T>(path: string): Promise<T> {
    const response = await fetch(path, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      let message = response.statusText;
      try {
        const errorData = await response.json();
        message = errorData.error?.message || message;
      } catch { /* use default */ }
      throw new Error(message);
    }
    return response.json();
  }

  async getQuota(): Promise<QuotaInfo> {
    const result = await this.fetchAPI<any>('/api/v1/dashboard/billing/subscription');
    return {
      total_quota: result.hard_limit_usd ?? 0,
      used_quota: result.used ?? 0,
      remaining_quota: result.balance ?? 0,
    };
  }

  async getLogs(page = 1, perPage = 20): Promise<LogItem[]> {
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    const result = await this.fetchAPI<any>(
      `/api/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`
    );
    // billing/usage 不返回逐条日志，返回空数组
    return [];
  }

  async getUsage(startDate: string, endDate: string): Promise<UsageData[]> {
    const result = await this.fetchAPI<any>(
      `/api/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`
    );
    if (!result.daily_costs) return [];
    return result.daily_costs.map((item: any) => ({
      date: new Date(item.timestamp * 1000).toISOString().split('T')[0],
      total_calls: 0,
      total_tokens: 0,
      total_cost: item.line_items?.reduce((acc: number, cur: any) => acc + cur.cost, 0) ?? 0,
      cache_hits: 0,
    }));
  }

  async getModels(): Promise<ModelStats[]> {
    const result = await this.fetchAPI<any>('/api/v1/models');
    if (!result.data) return [];
    return result.data.map((m: any) => ({
      model_name: m.id,
      total_calls: 0,
      total_tokens: 0,
      total_cost: 0,
    }));
  }
}
