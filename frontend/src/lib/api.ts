import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'
});

export interface Lead {
  leadId: string;
  name?: string;
  phoneNumber: string;
  inquiryType: 'ca' | 'salon';
  inquiryDetails: string;
  status: string;
  score?: number;
  summary?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  tags?: string[];
}

export async function submitInquiry(payload: {
  name?: string;
  phoneNumber: string;
  inquiryType: 'ca' | 'salon';
  inquiryDetails: string;
  consent: boolean;
}) {
  const { data } = await api.post('/submit-inquiry', payload);
  return data as { status: string; inquiryId: string };
}

export async function fetchLeads(token: string) {
  const { data } = await api.get('/leads', {
    headers: {
      'x-frontend-key': token
    }
  });
  return data as Lead[];
}
