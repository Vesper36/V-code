'use client';

import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiModules, type ApiEndpoint } from '@/lib/data/api-docs';
import {
  Search, FileCode, ChevronDown, ChevronRight, Copy, Check,
} from 'lucide-react';
import { toast } from 'sonner';

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  POST: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PUT: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${METHOD_STYLES[method] || ''}`}>
      {method}
    </span>
  );
}

export default function AdminApiDocsPage() {
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(apiModules.map(m => m.name)));
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState('');

  const filtered = useMemo(() => {
    if (!search) return apiModules;
    const q = search.toLowerCase();
    return apiModules
      .map(mod => ({
        ...mod,
        endpoints: mod.endpoints.filter(ep =>
          ep.path.toLowerCase().includes(q) ||
          ep.summary.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q)
        ),
      }))
      .filter(mod => mod.endpoints.length > 0);
  }, [search]);

  const toggleModule = (name: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyAsCurl = (ep: ApiEndpoint) => {
    const baseUrl = 'https://v-api.vesper36.top';
    let curl = `curl -X ${ep.method} '${baseUrl}${ep.path}'`;
    curl += ` \\\n  -H 'Authorization: Bearer YOUR_API_KEY'`;
    curl += ` \\\n  -H 'Content-Type: application/json'`;
    if (ep.method === 'POST' || ep.method === 'PUT') {
      curl += ` \\\n  -d '{}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopiedPath(ep.path);
    toast.success('cURL 已复制');
    setTimeout(() => setCopiedPath(''), 2000);
  };

  const totalEndpoints = apiModules.reduce((sum, m) => sum + m.endpoints.length, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileCode className="h-7 w-7 text-primary" />
            API 文档
          </h1>
          <p className="text-muted-foreground">
            {apiModules.length} 个模块，{totalEndpoints} 个接口
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索接口..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="space-y-4">
          {filtered.map(mod => {
            const isExpanded = expandedModules.has(mod.name);
            return (
              <Card key={mod.name} className="glass">
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => toggleModule(mod.name)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {mod.name}
                      <Badge variant="secondary" className="text-xs">{mod.endpoints.length}</Badge>
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">{mod.desc}</span>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    {mod.endpoints.map((ep, idx) => {
                      const epKey = `${mod.name}-${idx}`;
                      const isEpExpanded = expandedEndpoints.has(epKey);
                      return (
                        <div key={epKey} className="border rounded-lg overflow-hidden">
                          <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleEndpoint(epKey)}
                          >
                            <MethodBadge method={ep.method} />
                            <code className="text-sm font-mono flex-1">{ep.path}</code>
                            <span className="text-sm text-muted-foreground hidden sm:inline">{ep.summary}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => { e.stopPropagation(); copyAsCurl(ep); }}
                              title="复制 cURL"
                            >
                              {copiedPath === ep.path ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                          {isEpExpanded && (
                            <EndpointDetail endpoint={ep} />
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Card className="glass">
              <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                未找到匹配的接口
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function EndpointDetail({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <div className="border-t px-4 py-3 bg-muted/30 space-y-3">
      <p className="text-sm">{endpoint.summary}</p>
      {endpoint.params && endpoint.params.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">参数</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-xs">名称</th>
                  <th className="text-left p-2 font-medium text-xs">类型</th>
                  <th className="text-left p-2 font-medium text-xs">必填</th>
                  <th className="text-left p-2 font-medium text-xs">说明</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map(param => (
                  <tr key={param.name} className="border-b last:border-0">
                    <td className="p-2 font-mono text-xs">{param.name}</td>
                    <td className="p-2 text-xs text-muted-foreground">{param.type}</td>
                    <td className="p-2">
                      {param.required
                        ? <span className="text-xs text-red-500">*</span>
                        : <span className="text-xs text-muted-foreground">-</span>
                      }
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{param.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {endpoint.response && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">响应示例</p>
          <pre className="text-xs bg-background rounded p-3 overflow-x-auto font-mono">
            {endpoint.response}
          </pre>
        </div>
      )}
    </div>
  );
}
