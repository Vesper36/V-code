'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createApiKey } from '@/lib/api/gateway-admin';

interface CreateKeyDialogProps {
  onSuccess: () => void;
}

export function CreateKeyDialog({ onSuccess }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [totalQuota, setTotalQuota] = useState('');
  const [dailyQuota, setDailyQuota] = useState('');
  const [monthlyQuota, setMonthlyQuota] = useState('');
  const [allowedModels, setAllowedModels] = useState('');
  const [rpm, setRpm] = useState('60');
  const [tpm, setTpm] = useState('100000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入密钥名称');
      return;
    }
    setLoading(true);
    try {
      const models = allowedModels.trim()
        ? allowedModels.split(',').map(m => m.trim()).filter(Boolean)
        : [];
      await createApiKey({
        name: name.trim(),
        totalQuota: totalQuota ? parseFloat(totalQuota) : 0,
        dailyQuota: dailyQuota ? parseFloat(dailyQuota) : null,
        monthlyQuota: monthlyQuota ? parseFloat(monthlyQuota) : null,
        allowedModels: models,
        rpm: parseInt(rpm) || 60,
        tpm: parseInt(tpm) || 100000,
      });
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
    setName(''); setTotalQuota(''); setDailyQuota('');
    setMonthlyQuota(''); setAllowedModels('');
    setRpm('60'); setTpm('100000');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> 创建密钥
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>创建新 API 密钥</DialogTitle>
          <DialogDescription>创建具有自定义额度和设置的新 API 密钥</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key-name">密钥名称 *</Label>
              <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="例如: 生产环境密钥" required />
            </div>
            <div className="grid gap-2">
              <Label>允许模型</Label>
              <Input value={allowedModels} onChange={(e) => setAllowedModels(e.target.value)}
                placeholder="留空则允许所有模型" />
              <p className="text-xs text-muted-foreground">多个模型用逗号分隔</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>总额度 ($)</Label>
                <Input type="number" step="0.01" min="0" value={totalQuota}
                  onChange={(e) => setTotalQuota(e.target.value)} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>日额度 ($)</Label>
                <Input type="number" step="0.01" min="0" value={dailyQuota}
                  onChange={(e) => setDailyQuota(e.target.value)} placeholder="不限" />
              </div>
              <div className="grid gap-2">
                <Label>月额度 ($)</Label>
                <Input type="number" step="0.01" min="0" value={monthlyQuota}
                  onChange={(e) => setMonthlyQuota(e.target.value)} placeholder="不限" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>RPM</Label>
                <Input type="number" min="1" value={rpm} onChange={(e) => setRpm(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>TPM</Label>
                <Input type="number" min="1" value={tpm} onChange={(e) => setTpm(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>取消</Button>
            <Button type="submit" disabled={loading}>{loading ? '创建中...' : '创建密钥'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
