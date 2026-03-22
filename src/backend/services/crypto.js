export class CryptoService {
  static async hashString(inputString) {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static generateSecureToken() {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `csx_${uuid}${timestamp}${randomSuffix}`;
  }

  static sanitizeInput(input) {
    if (!input) return "";
    return input.toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
}
