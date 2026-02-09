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
      toast.error('请输入密钥名称');
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
          toast.error('额度金额无效');
          setLoading(false);
          return;
        }
        data.remain_quota = Math.floor(usd * 500000);
      }

      await client.createToken(data);

      toast.success('密钥创建成功');
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || '创建密钥失败');
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
          创建密钥
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>创建新 API 密钥</DialogTitle>
          <DialogDescription>
            创建具有自定义额度和设置的新 API 密钥
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">密钥名称 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 生产环境密钥"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>无限额度</Label>
                <p className="text-sm text-muted-foreground">
                  允许无限制使用 API
                </p>
              </div>
              <Switch
                checked={unlimitedQuota}
                onCheckedChange={setUnlimitedQuota}
              />
            </div>

            {!unlimitedQuota && (
              <div className="grid gap-2">
                <Label htmlFor="quota">初始额度 (USD)</Label>
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
                  留空则初始额度为 $0
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
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建密钥'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
