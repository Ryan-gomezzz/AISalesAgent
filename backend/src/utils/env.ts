const cache = new Map<string, string>();

export function requireEnv(key: string): string {
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  cache.set(key, value);
  return value;
}

export function optionalEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  cache.set(key, value);
  return value;
}

export const region = () => requireEnv('AWS_REGION');
