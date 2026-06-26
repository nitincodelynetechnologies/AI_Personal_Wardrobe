import { registerAs } from '@nestjs/config';
import { resolveServiceUrl } from './resolve-service-url';

export default registerAs('stylist', () => ({
  serviceUrl: resolveServiceUrl(
    process.env.PYTHON_STYLIST_URL ||
      process.env.STYLIST_SERVICE_URL ||
      process.env.CLOTHING_SERVICE_URL,
    process.env.STYLIST_SERVICE_HOST,
    process.env.STYLIST_SERVICE_PORT,
    'localhost',
    '8001',
  ),
  /** Skip Python stylist HTTP calls; use deterministic local analysis (default on for local dev). */
  serviceMock: process.env.CLOTHING_SERVICE_MOCK !== 'false',
  timeoutMs: parseInt(process.env.STYLIST_SERVICE_TIMEOUT_MS || '15000', 10),
  bgRemovalTimeoutMs: parseInt(process.env.STYLIST_BG_REMOVAL_TIMEOUT_MS || '45000', 10),
}));
