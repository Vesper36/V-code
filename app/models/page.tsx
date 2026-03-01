'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Loader2, RefreshCw, Activity } from 'lucide-react';

interface ModelItem {
  id: string;
  object: string;
  owned_by?: string;
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'gpt', label: 'GPT' },
  { key: 'claude', label: 'Claude' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'other', label: '其他' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

function categorizeModel(id: string): CategoryKey {
  const lower = id.toLowerCase();
  if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3') || lower.startsWith('dall-e')) return 'gpt';
  if (lower.startsWith('claude')) return 'claude';
  if (lower.startsWith('gemini')) return 'gemini';
  if (lower.startsWith('deepseek')) return 'deepseek';
  return 'other';
}

function getVendorColor(cat: CategoryKey): string {
  switch (cat) {
    case 'gpt': return 'bg-green-500/15 text-green-600 dark:text-green-400';
    case 'claude': return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
    case 'gemini': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
    case 'deepseek': return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400';
    default: return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
  }
}

function getVendorName(cat: CategoryKey): string {
  switch (cat) {
    case 'gpt': return 'OpenAI';
    case 'claude': return 'Anthropic';
    case 'gemini': return 'Google';
    case 'deepseek': return 'DeepSeek';
    default: return 'Other';
  }
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryKey>('all');

  const fetchModels = async () => {
    setLoading(true);
    setError('');
    try {
      const keys = JSON.parse(localStorage.getItem('api_keys') || '[]');
      const apiKey = keys[0]?.key;
      if (!apiKey) {
        setError('请先在密钥管理中添加 API Key');
        return;
      }
      const res = await fetch(`/api/proxy?path=${encodeURIComponent('/v1/models')}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`请求失败: ${res.status}`);
      const json = await res.json();
      const list: ModelItem[] = (json.data || []).sort((a: ModelItem, b: ModelItem) =>
        a.id.localeCompare(b.id)
      );
      setModels(list);
    } catch (e: any) {
      setError(e.message || '加载模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const filtered = useMemo(() => {
    let list = models;
    if (category !== 'all') {
      list = list.filter(m => categorizeModel(m.id) === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.id.toLowerCase().includes(q));
    }
    return list;
  }, [models, category, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: models.length };
    for (const m of models) {
      const cat = categorizeModel(m.id);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [models]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            模型状态
          </h1>
          <p className="text-muted-foreground mt-1">
            当前可用模型 {models.length} 个
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchModels} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模型..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <Button
              key={c.key}
              variant={category === c.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(c.key)}
            >
              {c.label}
              {categoryCounts[c.key] ? ` (${categoryCounts[c.key]})` : ''}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="glass">
          <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
            未找到匹配的模型
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(m => {
            const cat = categorizeModel(m.id);
            return (
              <Card key={m.id} className="glass hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-mono text-sm font-medium break-all leading-tight">
                      {m.id}
                    </h3>
                    <Badge variant="outline" className="shrink-0 bg-green-500/15 text-green-600 dark:text-green-400 border-0">
                      可用
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getVendorColor(cat)}`}>
                      {getVendorName(cat)}
                    </span>
                    {m.owned_by && m.owned_by !== getVendorName(cat).toLowerCase() && (
                      <span className="text-xs text-muted-foreground">{m.owned_by}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
