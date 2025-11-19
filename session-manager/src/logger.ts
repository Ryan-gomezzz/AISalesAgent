import pino from 'pino';
import { env } from './config';

export const logger = pino({ level: env.logLevel });
