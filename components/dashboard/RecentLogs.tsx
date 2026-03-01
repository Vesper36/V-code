'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogItem } from "@/lib/api/newapi";
import { useTranslation } from "@/lib/i18n/useI18n";

interface RecentLogsProps {
  logs: LogItem[];
}

export function RecentLogs({ logs }: RecentLogsProps) {
  const t = useTranslation();
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t.dashboard.recent}</CardTitle>
        <CardDescription>{t.dashboard.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">时间</TableHead>
              <TableHead>模型</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">状态</TableHead>
              <TableHead className="text-right">费用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  暂无请求记录
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={`${log.id}-${i}`}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.model_name}</TableCell>
                  <TableCell className="text-right">{log.tokens.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.status_code >= 200 && log.status_code < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {log.status_code}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">${log.cost.toFixed(4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
