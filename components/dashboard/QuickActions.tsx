'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Key, BookOpen, Settings } from 'lucide-react';

export function QuickActions() {
  return (
    <Card className="col-span-4 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/keys">
            <Plus className="mr-2 h-4 w-4" /> Add New Key
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/keys">
            <Key className="mr-2 h-4 w-4" /> Manage Keys
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/tutorial">
            <BookOpen className="mr-2 h-4 w-4" /> View Tutorial
          </Link>
        </Button>
        <Button asChild className="w-full justify-start" variant="outline">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
