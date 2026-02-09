export interface APIKey {
  id: string;
  key: string;
  name: string;
  baseUrl: string;
  platform: string;
  createdAt: number;
}

export interface QuotaInfo {
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  quota_type?: string;
}

export interface UsageData {
  date: string;
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  cache_hits: number;
}

export interface ModelStats {
  model_name: string;
  total_calls: number;
  total_tokens: number;
  total_cost: number;
}

export interface UserStats {
  quota: QuotaInfo;
  usage_history: UsageData[];
  model_stats: ModelStats[];
}
