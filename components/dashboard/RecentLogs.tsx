'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogItem } from "@/lib/api/newapi";

interface RecentLogsProps {
  logs: LogItem[];
}

export function RecentLogs({ logs }: RecentLogsProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest API requests and usage logs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No recent logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={`${log.id}-${i}`}>
                  <TableCell className="font-medium">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.model_name}</TableCell>
                  <TableCell className="text-right">{log.tokens.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${log.cost.toFixed(4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
