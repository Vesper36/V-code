'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminClient } from '@/lib/api/admin';

interface CreateKeyDialogProps {
  onSuccess: () => void;
}

export function CreateKeyDialog({ onSuccess }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [quota, setQuota] = useState('');
  const [unlimitedQuota, setUnlimitedQuota] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    setLoading(true);

    try {
      const client = getAdminClient();

      const data: any = {
        name: name.trim(),
        unlimited_quota: unlimitedQuota,
      };

      if (!unlimitedQuota && quota) {
        const usd = parseFloat(quota);
        if (isNaN(usd) || usd < 0) {
          toast.error('Invalid quota amount');
          setLoading(false);
          return;
        }
        data.remain_quota = Math.floor(usd * 500000);
      }

      await client.createToken(data);

      toast.success('Key created successfully');
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setQuota('');
    setUnlimitedQuota(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Create a new API key with custom quota and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Key Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production Key"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Unlimited Quota</Label>
                <p className="text-sm text-muted-foreground">
                  Allow unlimited API usage
                </p>
              </div>
              <Switch
                checked={unlimitedQuota}
                onCheckedChange={setUnlimitedQuota}
              />
            </div>

            {!unlimitedQuota && (
              <div className="grid gap-2">
                <Label htmlFor="quota">Initial Quota (USD)</Label>
                <Input
                  id="quota"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  placeholder="e.g., 10.00"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for $0 initial quota
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
