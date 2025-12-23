const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...meta
    };
    console.log(JSON.stringify(logEntry));
    fs.appendFileSync(path.join(logsDir, 'app.log'), JSON.stringify(logEntry) + '\n');
  },

  error: (error, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message || error,
      stack: error.stack,
      ...meta
    };
    console.error(JSON.stringify(logEntry));
    fs.appendFileSync(path.join(logsDir, 'error.log'), JSON.stringify(logEntry) + '\n');
  },

  warn: (message, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...meta
    };
    console.warn(JSON.stringify(logEntry));
    fs.appendFileSync(path.join(logsDir, 'app.log'), JSON.stringify(logEntry) + '\n');
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        ...meta
      };
      console.log(JSON.stringify(logEntry));
    }
  }
};

module.exports = logger;