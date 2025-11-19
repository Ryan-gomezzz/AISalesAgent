import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { region } from '../utils/env';

const s3 = new S3Client({ region: region() });

export async function getObjectAsString(bucket: string, key: string): Promise<string> {
  const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const body = await result.Body?.transformToString('utf-8');
  if (!body) {
    throw new Error(`Object ${bucket}/${key} is empty`);
  }
  return body;
}

export async function putJson(
  bucket: string,
  key: string,
  data: unknown,
  contentType = 'application/json'
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: contentType
    })
  );
}

export async function getSignedAssetUrl(bucket: string, key: string, expiresIn = 300): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}
