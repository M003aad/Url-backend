import validator from 'validator';
import ipaddr from 'ipaddr.js';
import dns from 'node:dns/promises';
import net from 'node:net';
import appError from '../../errors/appError.error.js'

function isPrivateIp(ipString) {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    const forbiddenRanges = [
      'unspecified',
      'loopback',
      'private',
      'linkLocal',
      'uniqueLocal',
      'carrierGradeNat',
      'broadcast',
      'reserved',
    ];

    return forbiddenRanges.includes(range);
  } catch {
    return true;
  }
}

export async function validateAndSanitizeUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new AppError('URL is required', 400, 'URL_REQUIRED');
  }

  const trimmedUrl = inputUrl.trim();

  const isValidFormat = validator.isURL(trimmedUrl, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false,
  });

  if (!isValidFormat) {
    throw new AppError('Invalid or unsupported URL format', 400, 'INVALID_URL_FORMAT');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    throw new AppError('Malformed URL structure', 400, 'MALFORMED_URL');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    throw new AppError('Access to local hostnames is forbidden', 400, 'SSRF_BLOCKED');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AppError(
        'Access to private or internal IP addresses is forbidden',
        400,
        'SSRF_BLOCKED',
      );
    }
  } else {
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const { address } of addresses) {
        if (isPrivateIp(address)) {
          throw new AppError(
            'URL resolves to an internal or private IP address',
            400,
            'SSRF_BLOCKED',
          );
        }
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Unable to resolve domain name', 400, 'DNS_RESOLUTION_FAILED');
    }
  }

  return parsedUrl.href;
}

export default validateAndSanitizeUrl;
