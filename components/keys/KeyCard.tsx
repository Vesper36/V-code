'use client';

import { APIKey } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/format';

interface KeyCardProps {
  apiKey: APIKey;
  onDelete: (id: string) => void;
}

export function KeyCard({ apiKey, onDelete }: KeyCardProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.key);
    toast.success('API Key copied to clipboard');
  };

  const maskedKey = apiKey.key.length > 10 
    ? `${apiKey.key.substring(0, 6)}...${apiKey.key.substring(apiKey.key.length - 4)}` 
    : '****';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{apiKey.name}</span>
          <span className="text-xs font-normal px-2 py-1 bg-muted rounded-full text-muted-foreground">
            {apiKey.platform}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
          <code className="text-sm font-mono truncate max-w-[200px]">{maskedKey}</code>
          <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Base URL: {apiKey.baseUrl}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Added: {formatDate(apiKey.createdAt)}
        </p>
      </CardContent>
      <CardFooter className="justify-between pt-2">
        <Button variant="ghost" size="sm" asChild>
          <a href={apiKey.baseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> Check Provider
          </a>
        </Button>
        <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(apiKey.id)}
            className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
