/**
 * Resolves a service base URL from env vars.
 * Dotenv does not expand ${VAR} placeholders (unlike Docker Compose), so we
 * fall back to HOST + PORT when the explicit URL contains unresolved tokens.
 */
export function resolveServiceUrl(
  explicitUrl: string | undefined,
  host: string | undefined,
  port: string | undefined,
  defaultHost: string,
  defaultPort: string,
): string {
  if (explicitUrl && !explicitUrl.includes('${')) {
    return explicitUrl.replace(/\/$/, '');
  }

  const resolvedHost = host || defaultHost;
  const resolvedPort = port || defaultPort;
  return `http://${resolvedHost}:${resolvedPort}`;
}
