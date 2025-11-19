import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CallQueueMessage, PostCallPayload } from '../types/lead';
import { region, requireEnv } from '../utils/env';

const sqs = new SQSClient({ region: region() });
const queueUrl = requireEnv('SQS_CALL_QUEUE_URL');
const postCallQueueUrl = requireEnv('POST_CALL_QUEUE_URL');

export async function enqueueCallJob(message: CallQueueMessage): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message)
    })
  );
}

export async function enqueuePostCallJob(payload: PostCallPayload): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: postCallQueueUrl,
      MessageBody: JSON.stringify(payload)
    })
  );
}
