import { QuotaInfo, UsageData, ModelStats } from '@/lib/types';

export class NewAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async fetchProxy<T>(path: string): Promise<T> {
    const response = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'x-base-url': this.baseUrl,
      },
    });

    if (!response.ok) {
       // Try to parse error message
       try {
         const errorData = await response.json();
         throw new Error(errorData.error?.message || response.statusText);
       } catch (e) {
         throw new Error(`API Error: ${response.statusText}`);
       }
    }

    const data = await response.json();
    return data;
  }

  async getQuota(): Promise<QuotaInfo> {
    // Strategy 1: /v1/dashboard/billing/subscription (OpenAI Standard)
    try {
        const result = await this.fetchProxy<any>('/v1/dashboard/billing/subscription');
        if (result.hard_limit_usd !== undefined) {
             return {
                total_quota: result.hard_limit_usd,
                used_quota: 0, // Need to fetch usage to know used quota
                remaining_quota: result.hard_limit_usd, // Placeholder
                quota_type: 'subscription'
             }
        }
    } catch (e) {
        // Ignore and try next
    }

    // Strategy 2: /api/user/self (New API User)
    try {
        const result = await this.fetchProxy<any>('/api/user/self');
        if (result.success && result.data) {
             return {
                total_quota: result.data.quota,
                used_quota: result.data.used_quota || 0,
                remaining_quota: result.data.quota - (result.data.used_quota || 0),
                quota_type: 'balance'
             }
        }
    } catch (e) {
        console.error("Failed to fetch quota from /api/user/self", e);
    }

    // Strategy 3: /dashboard/billing/credit_grants (Legacy)
    try {
        const result = await this.fetchProxy<any>('/dashboard/billing/credit_grants');
         if (result.total_granted) {
             return {
                total_quota: result.total_granted,
                used_quota: result.total_used,
                remaining_quota: result.total_available,
                quota_type: 'credit_grants'
             }
         }
    } catch (e) {
         // Ignore
    }

    return { total_quota: 0, used_quota: 0, remaining_quota: 0 };
  }
  
  async getUsage(startDate: string, endDate: string): Promise<UsageData[]> {
      // /v1/dashboard/billing/usage
      try {
          const result = await this.fetchProxy<any>(`/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`);
          // OpenAI usage format: { daily_costs: [{ timestamp: number, line_items: [{ name: string, cost: number }] }] }
          // Or New API might return simple list
          
          if (result.daily_costs) {
              return result.daily_costs.map((item: any) => ({
                  date: new Date(item.timestamp * 1000).toISOString().split('T')[0],
                  total_calls: 0, // Not provided by this endpoint usually
                  total_tokens: 0, // Not provided
                  total_cost: item.line_items.reduce((acc: number, cur: any) => acc + cur.cost, 0),
                  cache_hits: 0
              }));
          }
      } catch (e) {
          console.error("Failed to fetch usage", e);
      }
      return [];
  }

  async getModels(): Promise<ModelStats[]> {
      // Hard to get model stats without logs.
      // Maybe just list available models?
      // /v1/models
      try {
          const result = await this.fetchProxy<any>('/v1/models');
          if (result.data) {
              return result.data.map((m: any) => ({
                  model_name: m.id,
                  total_calls: 0,
                  total_tokens: 0,
                  total_cost: 0
              }));
          }
      } catch (e) {
          console.error("Failed to fetch models", e);
      }
      return [];
  }
}