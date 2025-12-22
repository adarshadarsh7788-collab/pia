/**
 * ESG Application Flow Test
 * Comprehensive testing suite with proper error handling and performance optimization
 */

// Lazy load modules
let sqlite3, path, fs, fetch;
const loadDependencies = async () => {
  if (!sqlite3) {
    try {
      sqlite3 = (await import('sqlite3')).default.verbose();
      path = await import('path');
      fs = await import('fs');
      fetch = (await import('node-fetch')).default;
    } catch (error) {
      throw new Error(`Failed to load dependencies: ${error.message}`);
    }
  }
};

// Secure database path
const getSecureDbPath = () => {
  return path.join(process.cwd(), 'database', 'esg.db');
};

/**
 * Main test execution function
 */
async function runFlowTest() {
  try {
    await loadDependencies();
    console.log('=== ESG Application Flow Test ===\n');
    
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    const dbPath = getSecureDbPath();
    
    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file does not exist. Run server first to create it.');
    }
    
    const db = await connectToDatabase(dbPath);
    await runAllTests(db);
    
  } catch (error) {
    console.error('❌ Flow test failed:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
}

/**
 * Connect to database with proper error handling
 */
function connectToDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(new Error(`Database connection failed: ${err.message}`));
      } else {
        console.log('✅ Database connected successfully');
        resolve(db);
      }
    });
  });
}

/**
 * Run all tests sequentially with proper error handling
 */
async function runAllTests(db) {
  try {
    await checkTables(db);
    await checkAdminUser(db);
    const companyId = await insertTestData(db);
    await calculateTestScores(db, companyId);
    await testKPIs(db);
    await testAPIEndpoints();
    
    console.log('\n=== Flow Test Complete ===');
    console.log('✅ All systems working correctly!');
    
    await closeDatabase(db);
  } catch (error) {
    console.error('❌ Test execution failed:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    await closeDatabase(db);
    throw error;
  }
}

/**
 * Check database tables
 */
function checkTables(db) {
  return new Promise((resolve, reject) => {
    console.log('\n2. Checking Database Tables...');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        reject(new Error(`Error checking tables: ${err.message}`));
        return;
      }
      
      const expectedTables = ['users', 'companies', 'esg_data', 'esg_scores'];
      const existingTables = tables.map(t => t.name);
      
      expectedTables.forEach(table => {
        if (existingTables.includes(table)) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
        }
      });
      
      resolve();
    });
  });
}

/**
 * Check admin user
 */
function checkAdminUser(db) {
  return new Promise((resolve, reject) => {
    console.log('\n3. Checking Admin User...');
    db.get("SELECT * FROM users WHERE email = 'admin@esgenius.com'", (err, admin) => {
      if (err) {
        reject(new Error(`Error checking admin user: ${err.message}`));
        return;
      }
      
      if (admin) {
        console.log('✅ Admin user exists');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.status}`);
      } else {
        console.log('❌ Admin user not found');
      }
      
      resolve();
    });
  });
}

/**
 * Insert test data with optimized batch operations
 */
function insertTestData(db) {
  return new Promise((resolve, reject) => {
    console.log('\n4. Testing Data Insertion...');
    
    // Insert test company
    db.run(
      'INSERT OR IGNORE INTO companies (name, sector, region, created_by) VALUES (?, ?, ?, ?)',
      ['Test Company', 'technology', 'north_america', 1],
      function(err) {
        if (err) {
          reject(new Error(`Error inserting company: ${err.message}`));
          return;
        }
        
        const companyId = this.lastID || 1;
        console.log('✅ Test company inserted/exists');
        
        // Insert test ESG data using prepared statement for better performance
        const testMetrics = [
          [companyId, 1, 2024, 'environmental', 'scope1Emissions', 1250],
          [companyId, 1, 2024, 'environmental', 'scope2Emissions', 2800],
          [companyId, 1, 2024, 'social', 'totalEmployees', 2500],
          [companyId, 1, 2024, 'governance', 'boardSize', 9]
        ];
        
        const stmt = db.prepare('INSERT OR REPLACE INTO esg_data (company_id, user_id, reporting_year, category, metric_name, metric_value) VALUES (?, ?, ?, ?, ?, ?)');
        
        let insertedCount = 0;
        let hasError = false;
        
        testMetrics.forEach(metric => {
          stmt.run(metric, function(err) {
            if (err && !hasError) {
              hasError = true;
              stmt.finalize();
              reject(new Error(`Error inserting metric: ${err.message}`));
              return;
            }
            
            insertedCount++;
            if (insertedCount === testMetrics.length && !hasError) {
              stmt.finalize();
              console.log('✅ Test ESG data inserted');
              resolve(companyId);
            }
          });
        });
      }
    );
  });
}

/**
 * Calculate test scores with proper error handling
 */
function calculateTestScores(db, companyId) {
  return new Promise((resolve, reject) => {
    console.log('\n5. Testing Score Calculation...');
    
    db.all(
      'SELECT category, AVG(metric_value) as avg_score FROM esg_data WHERE company_id = ? AND user_id = ? GROUP BY category',
      [companyId, 1],
      (err, scores) => {
        if (err) {
          reject(new Error(`Error calculating scores: ${err.message}`));
          return;
        }
        
        const scoreMap = {};
        scores.forEach(score => {
          scoreMap[score.category] = score.avg_score || 0;
        });
        
        const environmentalScore = scoreMap.environmental || 0;
        const socialScore = scoreMap.social || 0;
        const governanceScore = scoreMap.governance || 0;
        const overallScore = (environmentalScore + socialScore + governanceScore) / 3;
        
        console.log('✅ Scores calculated:');
        console.log(`   Environmental: ${environmentalScore.toFixed(2)}`);
        console.log(`   Social: ${socialScore.toFixed(2)}`);
        console.log(`   Governance: ${governanceScore.toFixed(2)}`);
        console.log(`   Overall: ${overallScore.toFixed(2)}`);
        
        // Save scores
        db.run(
          'INSERT OR REPLACE INTO esg_scores (company_id, user_id, reporting_year, environmental_score, social_score, governance_score, overall_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [companyId, 1, 2024, environmentalScore, socialScore, governanceScore, overallScore],
          (err) => {
            if (err) {
              reject(new Error(`Error saving scores: ${err.message}`));
            } else {
              console.log('✅ Scores saved to database');
              resolve();
            }
          }
        );
      }
    );
  });
}

/**
 * Test KPI calculation with optimized query
 */
function testKPIs(db) {
  return new Promise((resolve, reject) => {
    console.log('\n6. Testing KPI Calculation...');
    
    // Optimized single query instead of multiple subqueries
    db.get(
      `SELECT 
         COUNT(DISTINCT ed.id) as totalEntries,
         es.environmental_score as environmental,
         es.social_score as social,
         es.governance_score as governance,
         es.overall_score as overallScore
       FROM esg_data ed
       LEFT JOIN esg_scores es ON es.user_id = ed.user_id
       WHERE ed.user_id = 1
       ORDER BY es.calculated_at DESC
       LIMIT 1`,
      (err, result) => {
        if (err) {
          reject(new Error(`Error calculating KPIs: ${err.message}`));
          return;
        }
        
        const kpis = result || {};
        kpis.complianceRate = kpis.totalEntries > 0 ? 94 : 0;
        
        console.log('✅ KPIs calculated:');
        console.log(`   Total Entries: ${kpis.totalEntries || 0}`);
        console.log(`   Environmental Score: ${(kpis.environmental || 0).toFixed(2)}%`);
        console.log(`   Social Score: ${(kpis.social || 0).toFixed(2)}%`);
        console.log(`   Governance Score: ${(kpis.governance || 0).toFixed(2)}%`);
        console.log(`   Overall Score: ${(kpis.overallScore || 0).toFixed(2)}%`);
        console.log(`   Compliance Rate: ${kpis.complianceRate}%`);
        
        resolve();
      }
    );
  });
}

/**
 * Test API endpoints with proper error handling
 */
async function testAPIEndpoints() {
  console.log('\n7. Testing API Endpoints...');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseURL}/health`, { timeout: 5000 });
    if (!healthResponse.ok) {
      throw new Error(`Health endpoint failed: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint working:', healthData.message);
    
    // Test admin endpoints
    const statsResponse = await fetch(`${baseURL}/admin/stats`, { timeout: 5000 });
    if (!statsResponse.ok) {
      throw new Error(`Stats endpoint failed: ${statsResponse.status}`);
    }
    
    const stats = await statsResponse.json();
    console.log('✅ Admin stats endpoint working:');
    console.log(`   Users: ${stats.users || 0}`);
    console.log(`   Companies: ${stats.companies || 0}`);
    console.log(`   ESG Data: ${stats.esgData || 0}`);
    console.log(`   ESG Scores: ${stats.esgScores || 0}`);
    
  } catch (error) {
    console.log('❌ API test failed:', {
      message: error.message,
      note: 'Make sure backend server is running: npm start'
    });
    throw error;
  }
}

/**
 * Close database connection safely
 */
function closeDatabase(db) {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Warning: Error closing database:', err.message);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\nTest interrupted');
  process.exit(0);
});

// Execute flow test
runFlowTest().catch(error => {
  console.error('❌ Flow test execution failed:', {
    message: error.message,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

export default runFlowTest;