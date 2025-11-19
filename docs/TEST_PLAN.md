# Test Plan

## Unit Tests
- `backend/tests/validators.test.ts`: validates form schema and consent logic.
- `backend/tests/leadSummary.test.ts`: validates Bedrock JSON parsing and score bounds.

Run: `cd backend && npm test`.

## Integration Smoke Tests
1. **Submit Inquiry API**
   - `curl -X POST http://localhost:3000/api/submit-inquiry ...`
   - Expect `200` + `inquiryId`.
2. **Twilio Status Callback**
   - Use Postman collection `Twilio Status Callback` with signature header from Twilio console or mock.
   - Verify DynamoDB item status becomes `in-progress`/`completed`.
3. **Post Call Processor**
   - Publish message to `aisalesagent-postcall-queue` with transcript/recording keys.
   - Check DynamoDB summary + SES email (use sandbox address).

## End-to-End Acceptance (local ngrok)
1. Start backend locally: `npm run dev` (using `serverless offline`).
2. Start session manager: `npm run dev` (port 8080).
3. Run ngrok: `ngrok http 8080` → copy `wss://` host to Twilio <Stream> URL + backend env `SESSION_MANAGER_HOST`.
4. Configure Twilio outbound caller + webhook to `https://<ngrok>.ngrok.io/api/twilio/status`.
5. Submit inquiry via frontend → Twilio initiates call.
6. Converse with AI, ensure filler prompt plays when responses take >0.8s.
7. After hangup, confirm DynamoDB updated to `qualified`/`rejected` and SES email arrives.
8. Open admin dashboard (`/admin`) → enter token → verify new lead row and recording playback via signed URL.

## Regression Checklist
- Invalid phone numbers rejected client + server side.
- Consent unchecked → 400.
- Missing Twilio signature → 403.
- Bedrock failure triggers polite fallback + marks lead for human follow-up (`status=failed`).
- ECS autoscaling alarm triggers when CPU > 50% for 2 mins (CloudWatch metric `ECSServiceAverageCPUUtilization`).
