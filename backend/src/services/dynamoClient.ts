import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';
import { LeadRecord, LeadStatus } from '../types/lead';
import { region, requireEnv } from '../utils/env';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: region() }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const tableName = requireEnv('DYNAMODB_TABLE_NAME');

export async function putLead(record: LeadRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: record
    })
  );
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  extra?: Record<string, unknown>
): Promise<void> {
  const now = new Date().toISOString();
  const names: UpdateCommandInput['ExpressionAttributeNames'] = {
    '#status': 'status',
    '#updatedAt': 'updatedAt'
  };
  const values: UpdateCommandInput['ExpressionAttributeValues'] = {
    ':status': status,
    ':updatedAt': now
  };
  let updateExpression = 'SET #status = :status, #updatedAt = :updatedAt';

  if (extra) {
    Object.entries(extra).forEach(([key, value], index) => {
      const attrName = `#extra${index}`;
      const attrValue = `:extra${index}`;
      names![attrName] = key;
      values![attrValue] = value;
      updateExpression += `, ${attrName} = ${attrValue}`;
    });
  }

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { leadId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    })
  );
}

export async function updateLeadSummary(
  leadId: string,
  fields: Partial<LeadRecord>
): Promise<void> {
  const now = new Date().toISOString();
  const entries = Object.entries(fields);
  if (!entries.length) return;

  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, unknown> = { ':updatedAt': now };
  const sets: string[] = ['#updatedAt = :updatedAt'];

  entries.forEach(([key, value], index) => {
    const nameKey = `#k${index}`;
    const valueKey = `:v${index}`;
    names[nameKey] = key;
    values[valueKey] = value;
    sets.push(`${nameKey} = ${valueKey}`);
  });

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { leadId },
      UpdateExpression: `SET ${sets.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    })
  );
}

export async function getLead(leadId: string): Promise<LeadRecord | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { leadId }
    })
  );
  return result.Item as LeadRecord | undefined;
}

export async function listRecentLeads(limit = 50): Promise<LeadRecord[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: tableName,
      Limit: limit
    })
  );
  return (result.Items ?? []) as LeadRecord[];
}
