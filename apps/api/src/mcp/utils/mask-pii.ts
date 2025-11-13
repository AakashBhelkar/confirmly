import crypto from 'crypto';

/**
 * Mask PII (Personally Identifiable Information) fields
 */
export const maskPII = (data: any, fieldsToMask: string[] = ['email', 'phone', 'name']): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskPII(item, fieldsToMask));
  }

  const masked = { ...data };

  for (const field of fieldsToMask) {
    if (field in masked && masked[field]) {
      if (typeof masked[field] === 'string') {
        // Hash the value for consistent masking
        const hash = crypto.createHash('sha256').update(masked[field]).digest('hex');
        masked[field] = `[REDACTED:${hash.substring(0, 8)}]`;
      } else if (typeof masked[field] === 'object') {
        masked[field] = maskPII(masked[field], fieldsToMask);
      }
    }
  }

  // Recursively mask nested objects
  for (const key in masked) {
    if (typeof masked[key] === 'object' && masked[key] !== null && !Array.isArray(masked[key])) {
      masked[key] = maskPII(masked[key], fieldsToMask);
    }
  }

  return masked;
};

/**
 * Check if a field should be masked
 */
export const shouldMaskField = (field: string): boolean => {
  const piiFields = ['email', 'phone', 'name', 'address', 'password', 'token', 'apiKey', 'secret'];
  return piiFields.some((pii) => field.toLowerCase().includes(pii.toLowerCase()));
};

