import EncryptionService from './encryption';

class SecureStorage {
  constructor() {
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  // Initialize with user password
  async initialize(password) {
    this.encryptionKey = password;
    this.isInitialized = true;
    
    // Store encrypted flag
    localStorage.setItem('encryption_enabled', 'true');
  }

  // Check if encryption is enabled
  isEncryptionEnabled() {
    return localStorage.getItem('encryption_enabled') === 'true';
  }

  // Set encrypted item
  async setItem(key, value) {
    if (!this.isInitialized || !this.encryptionKey) {
      // Fallback to regular storage if not initialized
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }

    try {
      await EncryptionService.encryptAndStore(key, value, this.encryptionKey);
    } catch (error) {
      console.error('Secure storage error:', error);
      throw error;
    }
  }

  // Get encrypted item
  async getItem(key) {
    if (!this.isInitialized || !this.encryptionKey) {
      // Fallback to regular storage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }

    try {
      return await EncryptionService.retrieveAndDecrypt(key, this.encryptionKey);
    } catch (error) {
      console.error('Secure retrieval error:', error);
      // Fallback to unencrypted if decryption fails
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }

  // Remove item
  removeItem(key) {
    localStorage.removeItem(key);
  }

  // Clear all
  clear() {
    localStorage.clear();
    this.isInitialized = false;
    this.encryptionKey = null;
  }

  // Migrate existing data to encrypted storage
  async migrateToEncrypted(password) {
    const keys = Object.keys(localStorage);
    const dataToMigrate = {};

    // Collect all data
    keys.forEach(key => {
      if (key !== 'encryption_enabled') {
        try {
          dataToMigrate[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          dataToMigrate[key] = localStorage.getItem(key);
        }
      }
    });

    // Initialize encryption
    await this.initialize(password);

    // Re-encrypt all data
    for (const [key, value] of Object.entries(dataToMigrate)) {
      await this.setItem(key, value);
    }

    return Object.keys(dataToMigrate).length;
  }
}

export default new SecureStorage();
