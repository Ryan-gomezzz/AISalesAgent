import { FormEvent, useState } from 'react';
import { submitInquiry } from '../lib/api';
import clsx from 'clsx';

type InquiryType = 'ca' | 'salon';

const defaultState = {
  name: '',
  phoneNumber: '',
  inquiryType: 'ca' as InquiryType,
  inquiryDetails: '',
  consent: false
};

export function InquiryForm() {
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await submitInquiry({
        name: form.name || undefined,
        phoneNumber: form.phoneNumber,
        inquiryType: form.inquiryType,
        inquiryDetails: form.inquiryDetails,
        consent: form.consent
      });
      setResult(`Inquiry submitted! ID: ${response.inquiryId}`);
      setForm(defaultState);
    } catch (err) {
      setError('Unable to submit inquiry. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-slate-800 p-6 shadow-xl shadow-black/20">
      <div>
        <label className="text-sm font-medium text-slate-300">Name</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Phone (E.164)</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="+18885551212"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Inquiry Type</label>
        <select
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          name="inquiryType"
          value={form.inquiryType}
          onChange={handleChange}
        >
          <option value="ca">Creative Automation</option>
          <option value="salon">Salon</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Details</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          name="inquiryDetails"
          value={form.inquiryDetails}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about your needs"
          required
        />
      </div>
      <label className="flex items-start space-x-3 text-sm text-slate-300">
        <input
          type="checkbox"
          name="consent"
          checked={form.consent}
          onChange={handleChange}
          className="mt-1"
        />
        <span>I consent to receive an AI-driven phone call and understand the call is recorded.</span>
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {result && <p className="text-sm text-emerald-400">{result}</p>}
      <button
        disabled={loading}
        className={clsx(
          'w-full rounded-lg bg-cyan-400/90 px-4 py-2 font-semibold text-slate-900 transition',
          loading && 'opacity-70'
        )}
      >
        {loading ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
