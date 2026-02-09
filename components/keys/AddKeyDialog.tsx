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
import { APIKey } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useI18n';

interface AddKeyDialogProps {
  onAdd: (key: APIKey) => void;
}

export function AddKeyDialog({ onAdd }: AddKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const t = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key || !baseUrl || !platform) return;

    const newKey: APIKey = {
      id: uuidv4(),
      name,
      key,
      baseUrl,
      platform,
      createdAt: Date.now(),
    };

    onAdd(newKey);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setKey('');
    setBaseUrl('');
    setPlatform('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t.keys.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>{t.keys.dialog.title}</DialogTitle>
          <DialogDescription>
            {t.keys.dialog.desc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t.keys.dialog.name}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.keys.dialog.placeholderName}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                {t.keys.dialog.key}
              </Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t.keys.dialog.placeholderKey}
                className="col-span-3"
                required
                type="password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseUrl" className="text-right">
                Base URL
              </Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
              <Input
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="OpenAI / Claude / etc"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t.keys.dialog.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
