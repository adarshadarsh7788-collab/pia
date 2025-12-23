import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

let sequelize = null;

// Database type mappings
const DB_TYPES = {
  SQLITE: 'sqlite',
  POSTGRES: 'postgres',
  MYSQL: 'mysql',
  MARIADB: 'mariadb',
  MSSQL: 'mssql'
};

// Default configurations for each database type
const DEFAULT_CONFIGS = {
  [DB_TYPES.SQLITE]: {
    dialect: 'sqlite',
    storage: './database.sqlite'
  },
  [DB_TYPES.POSTGRES]: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432
  },
  [DB_TYPES.MYSQL]: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
  },
  [DB_TYPES.MARIADB]: {
    dialect: 'mariadb',
    host: 'localhost',
    port: 3306
  },
  [DB_TYPES.MSSQL]: {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433
  }
};

/**
 * Get database type from environment or default to SQLite
 * @returns {string} Database dialect
 */
const getDbType = () => {
  const dbType = process.env.DB_TYPE?.toLowerCase();
  if (process.env.USE_SQLITE === 'true') return DB_TYPES.SQLITE;
  
  switch (dbType) {
    case 'postgres':
    case 'postgresql':
      return DB_TYPES.POSTGRES;
    case 'mysql':
      return DB_TYPES.MYSQL;
    case 'mariadb':
      return DB_TYPES.MARIADB;
    case 'mssql':
    case 'sqlserver':
      return DB_TYPES.MSSQL;
    default:
      return DB_TYPES.SQLITE;
  }
};

/**
 * Build database configuration object with flexible options
 * @returns {object} Sequelize config object
 * @throws {Error} when required environment variables are missing
 */
const getDbConfig = () => {
  const dbType = getDbType();
  const baseConfig = { ...DEFAULT_CONFIGS[dbType] };
  
  // Common configuration
  const config = {
    ...baseConfig,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      timestamps: true,
      underscored: process.env.DB_UNDERSCORED === 'true',
      freezeTableName: process.env.DB_FREEZE_TABLE_NAME === 'true'
    }
  };

  // SQLite specific configuration
  if (dbType === DB_TYPES.SQLITE) {
    config.storage = process.env.SQLITE_STORAGE || baseConfig.storage;
    return config;
  }

  // Network database configuration
  const missing = [];
  if (!process.env.DB_NAME) missing.push('DB_NAME');
  if (!process.env.DB_USER) missing.push('DB_USER');
  
  if (missing.length) {
    throw new Error(
      `Missing required database environment variables: ${missing.join(', ')}.\n` +
      `Set these in your environment or use DB_TYPE=sqlite for local development.`
    );
  }

  // Network database settings
  Object.assign(config, {
    host: process.env.DB_HOST || baseConfig.host,
    port: parseInt(process.env.DB_PORT, 10) || baseConfig.port,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    }
  });

  // SSL configuration for production
  if (process.env.DB_SSL === 'true') {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    };
  }

  return config;
};

/**
 * Retry connection with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
const retryConnection = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = delay * Math.pow(2, i);
      console.warn(`Connection attempt ${i + 1} failed, retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

/**
 * Create and return a singleton Sequelize instance with flexible configuration
 * Supports multiple database types, connection retry, and comprehensive error handling
 *
 * @returns {Promise<Sequelize>} sequelize instance
 */
const createSequelize = async () => {
  if (sequelize) return sequelize;

  const config = getDbConfig();
  const dbType = config.dialect;
  const maxRetries = parseInt(process.env.DB_MAX_RETRIES, 10) || 3;

  try {
    sequelize = new Sequelize(config);
    
    // Test connection with retry logic
    await retryConnection(async () => {
      await sequelize.authenticate();
    }, maxRetries);

    if (process.env.NODE_ENV !== 'production') {
      console.info(`Database connection established using ${dbType.toUpperCase()}`);
      if (dbType !== 'sqlite') {
        console.info(`Connected to ${config.host}:${config.port}/${config.database}`);
      }
    }
    
    return sequelize;
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Database connection failed after ${maxRetries} attempts:`, error.message);
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('Configuration:', { ...config, password: config.password ? '[HIDDEN]' : undefined });
      console.error(error.stack);
    }
    
    sequelize = null;
    throw error;
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.info('Database connection closed');
  }
};

/**
 * Get current sequelize instance (without creating new one)
 * @returns {Sequelize|null} Current sequelize instance
 */
const getSequelize = () => sequelize;

export { closeConnection, getSequelize, DB_TYPES };

export default createSequelize;