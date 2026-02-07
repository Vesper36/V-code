import { KeyList } from '@/components/keys/KeyList';

export default function KeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Key Management</h1>
      </div>
      <KeyList />
    </div>
  );
}
