/**
 * ESG Database Checker
 * Securely checks database status with proper error handling
 */

// Lazy load modules
let sqlite3, path;
const loadDependencies = async () => {
  if (!sqlite3) {
    try {
      sqlite3 = (await import('sqlite3')).default.verbose();
      path = await import('path');
    } catch (error) {
      throw new Error(`Failed to load dependencies: ${error.message}`);
    }
  }
};

// Secure path construction to prevent path traversal
const getSecureDbPath = () => {
  const baseDir = process.cwd();
  const dbDir = 'database';
  const dbFile = 'esg.db';
  return path.join(baseDir, dbDir, dbFile);
};

/**
 * Main database check function with comprehensive error handling
 */
async function checkDatabase() {
  try {
    await loadDependencies();
    const dbPath = getSecureDbPath();
    
    console.log('🔍 Checking ESG Database...');
    console.log('Database path:', dbPath);

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', {
            message: err.message,
            code: err.code,
            timestamp: new Date().toISOString()
          });
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        
        // Check tables with proper error handling
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            console.error('Error getting tables:', {
              message: err.message,
              timestamp: new Date().toISOString()
            });
            db.close();
            reject(err);
            return;
          }
          
          console.log('\n📋 Available Tables:');
          tables.forEach(table => console.log(`  - ${table.name}`));
          
          // Check ESG data with error handling
          db.all("SELECT COUNT(*) as count FROM esg_data", (err, result) => {
            if (err) {
              console.error('Error counting ESG data:', {
                message: err.message,
                timestamp: new Date().toISOString()
              });
            } else {
              console.log(`\n📊 Total ESG entries: ${result[0]?.count || 0}`);
            }
            
            // Show recent entries with error handling
            db.all(`
              SELECT c.name as company, e.category, e.metric_name, e.metric_value, e.created_at
              FROM esg_data e 
              JOIN companies c ON e.company_id = c.id 
              ORDER BY e.created_at DESC 
              LIMIT 5
            `, (err, data) => {
              if (err) {
                console.error('Error getting recent data:', {
                  message: err.message,
                  timestamp: new Date().toISOString()
                });
              } else {
                console.log('\n🕒 Recent ESG Entries:');
                if (!data || data.length === 0) {
                  console.log('  No data found');
                } else {
                  data.forEach((row, i) => {
                    console.log(`  ${i+1}. ${row.company} - ${row.category}.${row.metric_name}: ${row.metric_value} (${row.created_at})`);
                  });
                }
              }
              
              // Check companies with error handling
              db.all("SELECT * FROM companies ORDER BY created_at DESC LIMIT 3", (err, companies) => {
                if (err) {
                  console.error('Error getting companies:', {
                    message: err.message,
                    timestamp: new Date().toISOString()
                  });
                } else {
                  console.log('\n🏢 Recent Companies:');
                  if (!companies || companies.length === 0) {
                    console.log('  No companies found');
                  } else {
                    companies.forEach((company, i) => {
                      console.log(`  ${i+1}. ${company.name} (${company.sector}) - Created: ${company.created_at}`);
                    });
                  }
                }
                
                // Close database with error handling
                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', {
                      message: err.message,
                      timestamp: new Date().toISOString()
                    });
                    reject(err);
                  } else {
                    console.log('\n✅ Database check complete');
                    resolve();
                  }
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('❌ Database check failed:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Execute with proper error handling
checkDatabase().catch(error => {
  console.error('❌ Fatal error during database check:', {
    message: error.message,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

export default checkDatabase;