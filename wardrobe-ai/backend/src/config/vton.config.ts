import { registerAs } from '@nestjs/config';
import { resolveServiceUrl } from './resolve-service-url';

export default registerAs('vton', () => ({
  serviceUrl: resolveServiceUrl(
    process.env.PYTHON_VTON_URL || process.env.VTON_SERVICE_URL,
    process.env.VTON_SERVICE_HOST,
    process.env.VTON_SERVICE_PORT,
    'localhost',
    '8002',
  ),
  /** When true, skip Python and use NestJS echo mock. Default: call Python vton-service. */
  serviceMock: process.env.VTON_MOCK === 'true',
  timeoutMs: parseInt(process.env.VTON_SERVICE_TIMEOUT_MS || '180000', 10),
}));
