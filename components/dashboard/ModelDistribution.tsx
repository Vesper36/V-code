'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelStats } from '@/lib/types';

interface ModelDistributionProps {
  data: ModelStats[];
}

export function ModelDistribution({ data }: ModelDistributionProps) {
  // Sort by total calls descending and take top 10
  const sortedData = [...data].sort((a, b) => b.total_calls - a.total_calls).slice(0, 10);

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Top Models</CardTitle>
        <CardDescription>
          Most used models by call count.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart layout="vertical" data={sortedData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="model_name"
              type="category"
              width={100}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar dataKey="total_calls" fill="#adfa1d" radius={[0, 4, 4, 0]} name="Calls" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
