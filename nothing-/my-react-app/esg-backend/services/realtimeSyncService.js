const WebSocket = require('ws');
const db = require('../database/db');

class RealtimeSyncService {
  constructor() {
    this.clients = new Map();
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws/sync' });
    
    this.wss.on('connection', (ws, req) => {
      const userId = req.url.split('userId=')[1];
      this.clients.set(userId, ws);
      
      console.log(`Client connected: ${userId}`);
      
      ws.on('message', (message) => {
        this.handleMessage(userId, message);
      });
      
      ws.on('close', () => {
        this.clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
      });
      
      ws.send(JSON.stringify({ type: 'connected', userId }));
    });
  }

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'sync':
          this.logSyncEvent(data.entityType, data.entityId, data.action, userId);
          this.broadcastToOthers(userId, data);
          break;
        case 'ping':
          this.clients.get(userId)?.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  broadcastToOthers(senderId, data) {
    this.clients.forEach((ws, userId) => {
      if (userId !== senderId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'update',
          ...data,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  broadcastToAll(data) {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  notifyUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  logSyncEvent(entityType, entityId, action, userId) {
    db.run(`
      INSERT INTO sync_log (entity_type, entity_id, action, user_id, synced)
      VALUES (?, ?, ?, ?, 1)
    `, [entityType, entityId, action, userId], (err) => {
      if (err) console.error('Error logging sync event:', err);
    });
  }

  async getSyncLog(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM sync_log WHERE 1=1';
      const params = [];
      
      if (filters.entityType) {
        query += ' AND entity_type = ?';
        params.push(filters.entityType);
      }
      if (filters.entityId) {
        query += ' AND entity_id = ?';
        params.push(filters.entityId);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT 100';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new RealtimeSyncService();
