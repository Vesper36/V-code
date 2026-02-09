import { QuotaInfo, UsageData, ModelStats } from '@/lib/types';

export interface LogItem {
  created_at: number;
  type: number;
  model_name: string;
  quota: number;
  content: string;
  token: number;
}

export class NewAPIClient {
  private static readonly BASE_URL = 'https://v-api.vesper36.top';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchProxy<T>(path: string): Promise<T> {
    const response = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'x-base-url': NewAPIClient.BASE_URL,
      },
    });

    if (!response.ok) {
       try {
         const errorData = await response.json();
         throw new Error(errorData.error?.message || response.statusText);
       } catch (e) {
         throw new Error(`API Error: ${response.statusText}`);
       }
    }

    return await response.json();
  }

  async getQuota(): Promise<QuotaInfo> {
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
        console.warn("Failed to fetch quota from /api/user/self", e);
    }
    
    // Fallback to OpenAI subscription endpoint
    try {
        const result = await this.fetchProxy<any>('/v1/dashboard/billing/subscription');
        if (result.hard_limit_usd !== undefined) {
             return {
                total_quota: result.hard_limit_usd,
                used_quota: 0,
                remaining_quota: result.hard_limit_usd,
                quota_type: 'subscription'
             }
        }
    } catch (e) {
         // Ignore
    }

    return { total_quota: 0, used_quota: 0, remaining_quota: 0 };
  }
  
  async getLogs(page: number = 1, perPage: number = 20): Promise<LogItem[]> {
    try {
      const result = await this.fetchProxy<any>(`/api/log/self?page=${page}&per_page=${perPage}`);
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
    } catch (e) {
      console.warn("Failed to fetch logs", e);
    }
    return [];
  }

  async getUsage(startDate: string, endDate: string): Promise<UsageData[]> {
      // Strategy 1: Aggregation from logs (Most accurate for New API)
      try {
        // Fetch last 1000 logs to aggregate stats (approx)
        // In a real app, we might need a dedicated stats endpoint or fetch more pages
        const logs = await this.getLogs(1, 100); 
        
        if (logs.length > 0) {
            const usageMap = new Map<string, UsageData>();
            
            logs.forEach(log => {
                const date = new Date(log.created_at * 1000).toISOString().split('T')[0];
                if (!usageMap.has(date)) {
                    usageMap.set(date, {
                        date,
                        total_calls: 0,
                        total_tokens: 0,
                        total_cost: 0,
                        cache_hits: 0
                    });
                }
                
                const stats = usageMap.get(date)!;
                stats.total_calls++;
                stats.total_tokens += log.token || 0;
                stats.total_cost += (log.quota || 0); // Quota is usually cost * 500000 or similar, but here we treat it as raw value for display
            });
            
            return Array.from(usageMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        }
      } catch (e) {
          console.warn("Failed to aggregate usage from logs", e);
      }

      // Strategy 2: /v1/dashboard/billing/usage
      try {
          const result = await this.fetchProxy<any>(`/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`);
          if (result.daily_costs) {
              return result.daily_costs.map((item: any) => ({
                  date: new Date(item.timestamp * 1000).toISOString().split('T')[0],
                  total_calls: 0, 
                  total_tokens: 0,
                  total_cost: item.line_items.reduce((acc: number, cur: any) => acc + cur.cost, 0),
                  cache_hits: 0
              }));
          }
      } catch (e) {
          console.warn("Failed to fetch usage from billing endpoint", e);
      }
      return [];
  }

  async getModels(): Promise<ModelStats[]> {
      try {
          // Aggregate from logs first as it reflects actual usage
          const logs = await this.getLogs(1, 100);
          if (logs.length > 0) {
               const modelMap = new Map<string, ModelStats>();
               
               logs.forEach(log => {
                   if (!modelMap.has(log.model_name)) {
                       modelMap.set(log.model_name, {
                           model_name: log.model_name,
                           total_calls: 0,
                           total_tokens: 0,
                           total_cost: 0
                       });
                   }
                   
                   const stats = modelMap.get(log.model_name)!;
                   stats.total_calls++;
                   stats.total_tokens += log.token || 0;
                   stats.total_cost += log.quota || 0;
               });
               
               return Array.from(modelMap.values()).sort((a, b) => b.total_calls - a.total_calls);
          }
      } catch (e) {
          // Ignore
      }

      // Fallback: Just list models
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