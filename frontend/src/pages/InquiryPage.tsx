import { InquiryForm } from '../components/InquiryForm';

export function InquiryPage() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-3xl font-semibold text-white">Book a callback</h2>
        <p className="mt-4 text-slate-300">
          Tell us about your CA or salon inquiry. Our AI agent will review and call you within minutes to
          qualify your needs, summarize the call, and notify our human team.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-400">
          <li>• Validates consent before connecting</li>
          <li>• Streams audio to AWS Transcribe, Bedrock, Polly</li>
          <li>• Stores lead data securely in DynamoDB</li>
        </ul>
      </div>
      <InquiryForm />
    </div>
  );
}
