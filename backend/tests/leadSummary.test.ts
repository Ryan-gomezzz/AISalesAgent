import { parseExtractedLead } from '../src/utils/leadSummary';

describe('parseExtractedLead', () => {
  it('parses valid payload', () => {
    const input = {
      name: 'Jamie',
      phone: '+18005551212',
      serviceType: 'ca',
      requirements: 'Need bookkeeping',
      budget: '5k',
      timeframe: '2 weeks',
      decisionMaker: 'yes',
      score: 8,
      summary: 'Ready to move',
      followUpRecommended: true,
      tags: ['ca', 'hot']
    };

    expect(parseExtractedLead(input)).toMatchObject({ name: 'Jamie', score: 8 });
  });

  it('throws when score is out of bounds', () => {
    const input = {
      name: 'Jamie',
      phone: '+18005551212',
      requirements: 'Need help',
      score: 12,
      summary: 'bad',
      followUpRecommended: false,
      tags: []
    };

    expect(() => parseExtractedLead(input)).toThrow();
  });
});
