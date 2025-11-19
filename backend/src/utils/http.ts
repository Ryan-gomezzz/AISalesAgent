import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
};

export function ok<T>(payload: T): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(payload)
  };
}

export function badRequest(message: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({ message })
  };
}

export function internalError(message: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ message })
  };
}

export function forbidden(message = 'Forbidden'): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 403,
    headers: corsHeaders,
    body: JSON.stringify({ message })
  };
}

export function noContent(): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: ''
  };
}
