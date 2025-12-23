// Client-side AES-256 Encryption Utility
class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  // Generate encryption key from password
  async generateKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('esg-platform-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data
  async encrypt(data, password) {
    try {
      const key = await this.generateKey(password);
      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: this.algorithm, iv },
        key,
        encoder.encode(JSON.stringify(data))
      );

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt data
  async decrypt(encryptedData, iv, password) {
    try {
      const key = await this.generateKey(password);
      const decrypted = await crypto.subtle.decrypt(
        { name: this.algorithm, iv: this.base64ToArrayBuffer(iv) },
        key,
        this.base64ToArrayBuffer(encryptedData)
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed - Invalid password or corrupted data');
    }
  }

  // Helper: ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encrypt and store in localStorage
  async encryptAndStore(key, data, password) {
    const { encrypted, iv } = await this.encrypt(data, password);
    localStorage.setItem(key, JSON.stringify({ encrypted, iv }));
  }

  // Retrieve and decrypt from localStorage
  async retrieveAndDecrypt(key, password) {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { encrypted, iv } = JSON.parse(stored);
    return await this.decrypt(encrypted, iv, password);
  }

  // Hash password (for verification)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hash);
  }
}

export default new EncryptionService();
