// Jest setup file
process.env.NODE_ENV = 'test'
process.env.AWS_REGION = 'ap-south-1'
process.env.BEDROCK_MODEL = 'anthropic.claude-v2'
process.env.MOCK_BEDROCK = 'true'
process.env.S3_BUCKET_NAME = 'test-bucket'
process.env.DYNAMODB_TABLE = 'test-table'
process.env.FRONTEND_KEY = 'test-key'

