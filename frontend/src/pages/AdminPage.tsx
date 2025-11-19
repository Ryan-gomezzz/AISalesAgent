import { FormEvent, useState } from 'react';
import { AdminLeads } from '../components/AdminLeads';

const configuredKey = import.meta.env.VITE_FRONTEND_KEY ?? '';

export function AdminPage() {
  const [input, setInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (event: FormEvent) => {
    event.preventDefault();
    if (!configuredKey || input === configuredKey) {
      setToken(input);
      setError(null);
    } else {
      setError('Invalid admin token.');
    }
  };

  if (token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Lead Inbox</h2>
          <p className="text-sm text-slate-400">Viewing secured lead data</p>
        </div>
        <AdminLeads token={token} />
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl bg-slate-800 p-6">
      <h2 className="text-xl font-semibold text-white">Admin access</h2>
      <p className="text-sm text-slate-400">
        Enter the frontend admin token to unlock the lead dashboard. You can rotate the token via the VITE_FRONTEND_KEY environment variable.
      </p>
      <form onSubmit={handleUnlock} className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Admin token"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button className="w-full rounded-lg bg-cyan-400/90 px-4 py-2 font-semibold text-slate-900">Unlock</button>
      </form>
    </div>
  );
}
