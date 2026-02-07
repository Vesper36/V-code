'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store/useStore';
import { NewAPIClient, LogItem } from '@/lib/api/newapi';
import { QuotaInfo, UsageData, ModelStats } from '@/lib/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { UsageTrendChart } from '@/components/dashboard/UsageTrendChart';
import { ModelDistribution } from '@/components/dashboard/ModelDistribution';
import { RecentLogs } from '@/components/dashboard/RecentLogs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Activity, Database, Zap, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useI18n';

export default function Dashboard() {
  const { keys } = useStore();
  const t = useTranslation();
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [models, setModels] = useState<ModelStats[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Initialize selected key
  useEffect(() => {
    if (keys.length > 0 && !selectedKeyId) {
      setSelectedKeyId(keys[0].id);
    }
  }, [keys, selectedKeyId]);

  const selectedKey = useMemo(() => 
    keys.find(k => k.id === selectedKeyId), 
    [keys, selectedKeyId]
  );

  const fetchData = async (isRefresh = false) => {
    if (!selectedKey) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = new NewAPIClient(selectedKey.key);
      
      const [quotaData, logsData] = await Promise.all([
        client.getQuota(),
        client.getLogs(1, 100)
      ]);

      setQuota(quotaData);
      setLogs(logsData);

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [usageData, modelData] = await Promise.all([
         client.getUsage(startDate, endDate),
         client.getModels()
      ]);

      setUsage(usageData);
      setModels(modelData);
      
      if (isRefresh) toast.success('Dashboard updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedKey) {
      fetchData();
    }
  }, [selectedKey]);

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-muted/30 backdrop-blur-sm">
          <Wallet className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{t.keys.title}</h2>
        <p className="text-muted-foreground max-w-sm text-center">
          {t.keys.subtitle}
        </p>
        <Link href="/keys">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.keys.add}
          </Button>
        </Link>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (val: number | undefined) => {
      // NewAPI usually returns quota in raw units (e.g. 500000 = ), but here we assume the API returns USD or we need to convert?
      // Based on typical NewAPI: quota is 500000 per $. But let's assume the API client handles normalization or we display raw for now.
      // Re-reading NewAPIClient: it returns result.data.quota directly.
      // If it's standard OneAPI/NewAPI, 500000 units = .
      if (val === undefined) return '$0.00';
      
      // Let's assume the API returns standard OneAPI units and convert to USD
      const usd = val / 500000;
      return `${usd.toFixed(4)}`;
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
            <SelectTrigger className="w-full sm:w-[200px] glass">
              <SelectValue placeholder="Select API Key" />
            </SelectTrigger>
            <SelectContent>
              {keys.map((key) => (
                <SelectItem key={key.id} value={key.id}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="glass"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading && !refreshing ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {[...Array(4)].map((_, i) => (
             <Card key={i} className="h-32 animate-pulse bg-muted/50" />
           ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t.dashboard.remaining}
              value={formatCurrency(quota?.remaining_quota)}
              icon={Wallet}
              description={t.dashboard.balance}
              className="glass"
            />
            <StatCard
              title={t.dashboard.used}
              value={formatCurrency(quota?.used_quota)}
              icon={Activity}
              description="Since inception"
              className="glass"
            />
            <StatCard
              title={t.dashboard.requests}
              value={usage.reduce((acc, curr) => acc + curr.total_calls, 0).toLocaleString()}
              icon={Zap}
              description="Last 30 days"
              className="glass"
            />
            <StatCard
              title={t.dashboard.tokens}
               value={(usage.reduce((acc, curr) => acc + curr.total_tokens, 0) / 1000).toFixed(1) + 'k'}
              icon={Database}
              description="Last 30 days"
              className="glass"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <UsageTrendChart data={usage} />
            <ModelDistribution data={models} />
          </div>

          <div className="grid gap-4 md:grid-cols-1">
             <RecentLogs logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
}