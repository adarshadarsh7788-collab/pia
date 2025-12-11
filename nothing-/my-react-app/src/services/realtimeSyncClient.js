class RealtimeSyncClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(userId) {
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/ws/sync?userId=${userId}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.attemptReconnect(userId);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'connected':
        console.log('Connected with userId:', data.userId);
        break;
      case 'update':
        this.notifyListeners(data.entityType, data);
        break;
      case 'pong':
        // Heartbeat response
        break;
    }
  }

  syncUpdate(entityType, entityId, action, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'sync',
        entityType,
        entityId,
        action,
        payload
      }));
    }
  }

  subscribe(entityType, callback) {
    if (!this.listeners.has(entityType)) {
      this.listeners.set(entityType, []);
    }
    this.listeners.get(entityType).push(callback);
  }

  unsubscribe(entityType, callback) {
    if (this.listeners.has(entityType)) {
      const callbacks = this.listeners.get(entityType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(entityType, data) {
    if (this.listeners.has(entityType)) {
      this.listeners.get(entityType).forEach(callback => callback(data));
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  attemptReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(userId), delay);
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new RealtimeSyncClient();
