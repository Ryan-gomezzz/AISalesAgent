# Cost Estimate (50 calls/day)

| Component | Assumptions | Monthly Estimate |
| --- | --- | --- |
| Twilio Voice | 6 min avg per call @ $0.013/min outbound + $0.004 per media stream min | ~$390 |
| Transcribe Streaming | $0.0004/sec, 6 min call | ~$216 |
| Bedrock (Claude 3.5 Sonnet) | 1k output + 1k input tokens per turn, 10 turns/call, $0.003/$0.015 per 1k | ~$450 |
| Polly TTS | $16 per 1M chars, 500 chars/turn | ~$60 |
| S3 Storage | 50 recordings/day @ 1 MB + transcripts | <$5 |
| DynamoDB | Provisionless PAYG (< 1M RCU/WCU) | <$3 |
| SES | 1 email per call, first 62k free (in-region) | $0 |
| ECS Fargate | 2 tasks (1 vCPU, 2GB) running 24/7 + data transfer | ~$150 |
| CloudWatch + misc | Logs + metrics | ~$40 |

**Total ≈ $1.3k/month** with 20% contingency for spikes.
