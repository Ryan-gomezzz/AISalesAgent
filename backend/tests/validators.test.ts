import { leadFormSchema } from '../src/utils/validators';

describe('leadFormSchema', () => {
  it('accepts valid payload', () => {
    const payload = {
      name: 'Test User',
      phoneNumber: '+14155551234',
      inquiryType: 'ca',
      inquiryDetails: 'Need help with California corporate filings.',
      consent: true
    } as const;

    expect(() => leadFormSchema.parse(payload)).not.toThrow();
  });

  it('rejects invalid phone numbers', () => {
    const payload = {
      phoneNumber: '4155551234',
      inquiryType: 'ca',
      inquiryDetails: 'Need help',
      consent: true
    } as const;

    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('requires consent checkbox', () => {
    const payload = {
      phoneNumber: '+14155551234',
      inquiryType: 'salon',
      inquiryDetails: 'Salon build out',
      consent: false
    } as const;

    expect(() => leadFormSchema.parse(payload)).toThrow(/literal/);
  });
});
