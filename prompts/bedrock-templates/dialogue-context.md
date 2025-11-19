## Context Template

```
[persona]
Call objective: qualify CA or Salon inquiry.
Call status: {status}
Most recent summary: {summary}
Conversation history (latest last):
{history}
Next action: {next_action}
```

- Replace `{history}` with alternating turns formatted as `Caller:` / `Agent:`.
- Keep only the last 6 turns to reduce token count.
- `{next_action}` should be one of `clarify_requirements`, `collect_budget`, `confirm_timeline`, `close_call`, or `escalate`.
- Feed the filled template to Bedrock before each response.
