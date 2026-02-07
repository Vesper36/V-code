'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
        <CardDescription>
          Latest API requests and usage logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Quota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No recent logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={`${log.created_at}-${i}`}>
                  <TableCell className="font-medium">
                    {new Date(log.created_at * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.model_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {log.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{log.token}</TableCell>
                  <TableCell className="text-right font-mono">
                    {log.quota}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
