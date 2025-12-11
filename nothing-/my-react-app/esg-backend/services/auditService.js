const crypto = require('crypto');
const db = require('../database/db');

class AuditService {
  // Create immutable audit entry with blockchain-style chaining
  static async createAuditEntry(action, tableName, recordId, userId, userRole, oldValues, newValues, metadata = {}) {
    const lastEntry = await this.getLastAuditEntry();
    const previousHash = lastEntry ? lastEntry.current_hash : '0';
    
    const dataToHash = JSON.stringify({
      previousHash,
      action,
      tableName,
      recordId,
      userId,
      timestamp: new Date().toISOString(),
      oldValues,
      newValues
    });
    
    const currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO audit_log (previous_hash, current_hash, action, table_name, record_id, 
          user_id, user_role, old_values, new_values, ip_address, user_agent, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        previousHash,
        currentHash,
        action,
        tableName,
        recordId,
        userId,
        userRole,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        metadata.ipAddress || null,
        metadata.userAgent || null,
        metadata.sessionId || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, hash: currentHash });
      });
    });
  }

  static getLastAuditEntry() {
    return new Promise((resolve, reject) => {
      db.get('SELECT current_hash FROM audit_log ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Verify audit chain integrity
  static async verifyAuditChain(startId = 1, endId = null) {
    return new Promise((resolve, reject) => {
      const query = endId 
        ? 'SELECT * FROM audit_log WHERE id BETWEEN ? AND ? ORDER BY id'
        : 'SELECT * FROM audit_log WHERE id >= ? ORDER BY id';
      
      const params = endId ? [startId, endId] : [startId];
      
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        
        let isValid = true;
        let invalidEntries = [];
        
        for (let i = 0; i < rows.length; i++) {
          const entry = rows[i];
          const dataToHash = JSON.stringify({
            previousHash: entry.previous_hash,
            action: entry.action,
            tableName: entry.table_name,
            recordId: entry.record_id,
            userId: entry.user_id,
            timestamp: entry.timestamp,
            oldValues: entry.old_values,
            newValues: entry.new_values
          });
          
          const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
          
          if (expectedHash !== entry.current_hash) {
            isValid = false;
            invalidEntries.push(entry.id);
          }
          
          if (i > 0 && entry.previous_hash !== rows[i-1].current_hash) {
            isValid = false;
            invalidEntries.push(entry.id);
          }
        }
        
        resolve({ isValid, totalEntries: rows.length, invalidEntries });
      });
    });
  }

  static getAuditTrail(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM audit_log WHERE 1=1';
      const params = [];
      
      if (filters.recordId) {
        query += ' AND record_id = ?';
        params.push(filters.recordId);
      }
      if (filters.tableName) {
        query += ' AND table_name = ?';
        params.push(filters.tableName);
      }
      if (filters.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }
      if (filters.startDate) {
        query += ' AND timestamp >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ' AND timestamp <= ?';
        params.push(filters.endDate);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(filters.limit || 1000);
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({
          ...row,
          old_values: row.old_values ? JSON.parse(row.old_values) : null,
          new_values: row.new_values ? JSON.parse(row.new_values) : null
        })));
      });
    });
  }
}

module.exports = AuditService;
