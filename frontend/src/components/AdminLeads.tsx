import { useEffect, useState } from 'react';
import { Lead, fetchLeads } from '../lib/api';

interface Props {
  token: string;
}

export function AdminLeads({ token }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLeads(token)
      .then((data) => {
        if (mounted) setLeads(data);
      })
      .catch(() => setError('Unable to load leads. Verify your admin token.'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return <p className="text-slate-300">Loading leads…</p>;
  }

  if (error) {
    return <p className="text-rose-400">{error}</p>;
  }

  if (!leads.length) {
    return <p className="text-slate-400">No leads yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-800/70 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3">Recording</th>
            <th className="px-4 py-3">Transcript</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-sm">
          {leads.map((lead) => (
            <tr key={lead.leadId}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-100">{lead.name ?? 'Unknown'}</p>
                <p className="text-xs text-slate-400">{lead.phoneNumber}</p>
              </td>
              <td className="px-4 py-3 text-slate-300">{lead.status}</td>
              <td className="px-4 py-3 font-semibold text-cyan-300">{lead.score ?? '—'}</td>
              <td className="px-4 py-3 text-slate-200">
                {lead.summary ?? 'Pending summary'}
                {lead.tags?.length ? (
                  <span className="mt-1 block text-xs uppercase tracking-wide text-slate-500">
                    {lead.tags.join(' • ')}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {lead.recordingUrl ? (
                  <audio src={lead.recordingUrl} controls className="w-48" preload="none" />
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </td>
              <td className="px-4 py-3">
                {lead.transcriptUrl ? (
                  <a
                    href={lead.transcriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 underline-offset-2 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
