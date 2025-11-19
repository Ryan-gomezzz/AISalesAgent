# AISalesAgent

AI-driven outbound qualification calls that bridge Twilio Media Streams → Amazon Transcribe → AWS Bedrock (Claude) → Amazon Polly, while persisting leads into DynamoDB and notifying humans via SES.

## Architecture
- **Frontend (React + Vite + Tailwind):** lead intake form and token-protected admin dashboard.
- **Backend (Serverless Framework, Node 18):** Lambdas for inquiry intake, call initiation worker (SQS), Twilio status webhooks, post-call processing, and admin lead listing.
- **Session Manager (Node 18, ECS Fargate):** WebSocket server that speaks Twilio Media Streams, streams audio to Amazon Transcribe, queries Bedrock (Claude) for replies, synthesizes audio via Polly, and stores recordings/transcripts in S3.
- **Infra:** CloudFormation template for the Fargate service + IAM policies.
- **Data Plane:** DynamoDB table (`AISalesAgentLeads`), SQS queues (`aisalesagent-call-queue-*`, `aisalesagent-postcall-queue-*`), S3 buckets for recordings/transcripts, SES for email, GitHub Actions for CI/CD.

```
Web Form → submitInquiry (Lambda) → DynamoDB + SQS → Twilio outbound call → Twilio Media Stream ↔ Session Manager ↔ Transcribe/B edrock/Polly → S3/DynamoDB → PostCallProcessor → SES + Admin UI
```

## Repository Layout
```
backend/          # Serverless Lambdas (submitInquiry, Twilio callbacks, post-call, admin)
session-manager/  # ECS-ready Node WebSocket server (Twilio Media Streams)
frontend/         # React SPA for lead intake + admin
infra/            # CloudFormation + IAM policy snippets
prompts/          # Persona + Bedrock templates (dialogue + extract & score)
docs/             # Cost estimate + test plan
AISalesAgent.postman_collection.json
```

## Backend Highlights
- `submitInquiryHandler` validates payloads (Zod), writes provisional leads to DynamoDB, and pushes an SQS job.
- `initiateCallWorker` (same file, SQS trigger) calls Twilio REST to start the outbound call and stores the `callSid`.
- `twilioStatusCallbackHandler` verifies signatures, mirrors call state into DynamoDB, and records timestamps.
- `postCallProcessorHandler` consumes SQS or HTTPS events, fetches transcripts from S3, invokes Bedrock with the strict JSON template, validates the output, updates DynamoDB, and sends SES notifications.
- `listLeadsHandler` powers the admin dashboard with a simple header token check.
- `services/` wraps DynamoDB DocumentClient, SQS, SES, Twilio, Bedrock, and S3 interactions.
- Serverless template provisions DynamoDB, SQS queues, S3 buckets, IAM, and API Gateway routes.

## Session Manager Highlights
- WebSocket server (ws) with per-call `Session` that:
  1. Accepts Twilio Media Streams (bidirectional) with consent reminder.
  2. Streams 16 kHz PCM audio to Amazon Transcribe Streaming.
  3. Uses a sliding window `BedrockAgent` (Claude 3.5 Sonnet) for replies; plays a "thinking" clip if responses take >800 ms.
  4. Synthesizes replies via Polly (neural voice) and streams audio back to Twilio.
  5. Records raw audio + transcripts to S3 and invokes the backend post-call webhook when the call ends.
- Confidence heuristics request clarification when ASR confidence < 0.7.
- Configured via `.env`/task definition; ships with Dockerfile + ECS task definition JSON.

## Frontend Highlights
- Tailwind-driven UI with responsive lead form and admin page.
- Admin route gated by `VITE_FRONTEND_KEY`; request headers send the token (`x-frontend-key`).
- Components live in `src/components` with typed API client in `src/lib/api.ts`.

## Getting Started
1. **Clone & install**
   ```bash
   git clone <repo>
   cd AISalesAgent
   (cd backend && npm install)
   (cd session-manager && npm install)
   (cd frontend && npm install)
   ```
2. **Configure environment files**
   - `backend/.env` → copy from [`backend/env.example`](backend/env.example) (Serverless injects table/queue names in AWS, but you need them for local/offline use).
   - `session-manager/.env` → copy from [`session-manager/env.example`](session-manager/env.example) and set S3 buckets + post-call webhook.
   - `frontend/.env` → copy from [`frontend/env.example`](frontend/env.example) for `VITE_API_BASE_URL` + admin token.
3. **Run Locally**
   ```bash
   # Backend (API Gateway emulation)
   cd backend
   npx serverless offline --stage local --httpPort 3000

   # Session manager WebSocket server
   cd ../session-manager
   npm run dev

   # Frontend
   cd ../frontend
   npm run dev
   ```
4. **Expose WebSocket for Twilio**
   ```bash
   ngrok http 8080
   ```
   Use the `wss://<id>.ngrok-free.app/twilio` URL as the `<Stream>` target in your TwiML (already emitted by `startOutboundCall`).
5. **Connect Twilio**
   - Configure `TWILIO_STATUS_CALLBACK_URL` to your API Gateway/Serverless endpoint.
   - Point outbound call `From` number to your verified Twilio number.

## Environment Variables
- **Backend**
  - `AWS_REGION`, `SESSION_MANAGER_HOST`, `BEDROCK_MODEL_ID`, `FRONTEND_KEY`
  - `SQS_CALL_QUEUE_URL`, `POST_CALL_QUEUE_URL`, `DYNAMODB_TABLE_NAME` (auto-populated in deployed stacks)
  - `SES_FROM_EMAIL`, `SES_TO_EMAIL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_STATUS_CALLBACK_URL`
- **Session Manager**
  - `S3_RECORDINGS_BUCKET`, `S3_TRANSCRIPTS_BUCKET`, `POST_CALL_WEBHOOK`
  - `BEDROCK_MODEL_ID`, `POLLY_VOICE`, `TRANSCRIBE_LANGUAGE`, `MAX_PARALLEL_SESSIONS`, `LOG_LEVEL`
- **Frontend**
  - `VITE_API_BASE_URL`, `VITE_FRONTEND_KEY`

## Testing
- **Unit** — `cd backend && npm test` (validators + Bedrock parser).
- **Frontend lint/build** — `npm run lint && npm run build`.
- **Session-manager build** — `npm run build` (tsc) and optional `npm run dev` for live reload.
- **Manual flows** — Use the included [Postman collection](./AISalesAgent.postman_collection.json) + [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for detailed steps, including ngrok-based end-to-end validation.

## Deployment
- **Backend:** `cd backend && npx serverless deploy --stage prod --region us-east-1`.
- **Session Manager:** build + push Docker image, then apply `infra/cloudformation/ecs-fargate.yml` (parameters documented in the template). Example snippet:
  ```bash
  aws cloudformation deploy \
    --stack-name AISalesAgent-ECS \
    --template-file infra/cloudformation/ecs-fargate.yml \
    --parameter-overrides \
        ImageUri=123456789012.dkr.ecr.us-east-1.amazonaws.com/aisalesagent:latest \
        VpcId=vpc-123 \
        PublicSubnets=subnet-1,subnet-2 \
        ListenerArn=arn:aws:elasticloadbalancing:... \
        SessionManagerHost=session.example.com \
        RecordingsBucket=aisalesagent-recordings-prod \
        TranscriptsBucket=aisalesagent-transcripts-prod \
        PostCallWebhook=https://api.example.com/prod/api/post-call \
        BedrockModelId=anthropic.claude-3-5-sonnet-20241022-v2:0 \
        PollyVoice=Joanna \
        TranscribeLanguage=en-US \
        MaxParallelSessions=25 \
    --capabilities CAPABILITY_NAMED_IAM
  ```
- **CI/CD:** `.github/workflows/ci.yml` runs lint/tests for all packages, then on `main` pushes it deploys the backend via Serverless, builds/pushes the session-manager Docker image to ECR, and re-applies the ECS CloudFormation stack. Provision the following GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SERVERLESS_STAGE`, `ECR_REPOSITORY`, `ECS_STACK_NAME`, `VPC_ID`, `PUBLIC_SUBNETS`, `CLUSTER_NAME`, `LISTENER_ARN`, `SESSION_MANAGER_HOST`, `RECORDINGS_BUCKET`, `TRANSCRIPTS_BUCKET`, `POST_CALL_WEBHOOK`, plus optional overrides for `BEDROCK_MODEL_ID`, `POLLY_VOICE`, `TRANSCRIBE_LANGUAGE`, `MAX_PARALLEL_SESSIONS`.

## Monitoring & Operations
- CloudWatch logs for Lambda + ECS (`/aws/lambda/*`, `/ecs/aisalesagent-session-manager`).
- Custom CloudWatch metric recommendations: `ActiveSessions`, `BedrockLatency`, `TranscribeReconnects` (instrumentation hooks available in `session-manager/src/logger.ts`).
- Configure SNS alarms for:
  - ECS CPU > 60% for 5 minutes (autoscaling policy already defined).
  - Lambda `Errors` metric > 1 within 5 minutes.
- Consent tracking (DynamoDB `consent` boolean + timestamp) ensures compliance.

## Security Notes
- All secrets are environment-driven; never commit credentials.
- Twilio webhooks validated via HMAC signatures before updates.
- Admin dashboard relies on `x-frontend-key` + backend comparison — rotate `FRONTEND_KEY` frequently and consider upgrading to Cognito for production.
- IAM policies kept least-privilege (see `infra/iam-policies/`).

## Demo & Acceptance Checklist
1. Submit a CA inquiry from the frontend.
2. Observe outbound call within 60 seconds; AI agent should confirm consent, ask qualification questions, and summarize.
3. Upon hangup, DynamoDB lead row updates (`status`, `score`, `summary`), S3 objects created, SES email received.
4. Admin dashboard lists the lead with playable recording (presigned URL from backend endpoint).
5. Refer to [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for scripted acceptance scenarios, including regression checks (invalid phone number, missing consent, Twilio signature rejection, failover path to human).
6. Provide a short screen recording (form submission → call → dashboard) when handing off.

## Cost Reference
See [docs/COST_ESTIMATE.md](docs/COST_ESTIMATE.md) for a 50-calls/day MVP estimate (~$1.3k/month, mostly Twilio + Bedrock).

## Sample Env Vars
- Backend: `backend/.env.example`
- Session manager: `session-manager/.env.example`
- Frontend: `frontend/.env.example`

## Future Enhancements
- Replace basic admin token with Cognito-hosted auth.
- Persist transcript snippets during the call (currently final transcript stored at end + periodic partial flush available via `SessionRecorder`).
- Instrument advanced analytics (lead conversion funnel, call latency histogram).
- Expand Postman collection with authenticated SES + DynamoDB queries once Stage-specific endpoints are live.

Happy calling! 🚀
