'use client';

import { useStore } from '@/lib/store/useStore';
import { KeyCard } from './KeyCard';
import { AddKeyDialog } from './AddKeyDialog';
import { APIKey } from '@/lib/types';

export function KeyList() {
  const { keys, removeKey, addKey } = useStore();

  const handleAddKey = (key: APIKey) => {
    addKey(key);
  };

  const handleDeleteKey = (id: string) => {
    removeKey(id);
  };

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">No API keys added yet.</p>
        <AddKeyDialog onAdd={handleAddKey} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
        <AddKeyDialog onAdd={handleAddKey} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {keys.map((key) => (
          <KeyCard key={key.id} apiKey={key} onDelete={handleDeleteKey} />
        ))}
      </div>
    </div>
  );
}
