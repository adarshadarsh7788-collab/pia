const db = require('./database/db');
const fs = require('fs');
const path = require('path');

// Initialize audit system tables
const schemaPath = path.join(__dirname, 'database', 'audit-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing audit system:', err);
    process.exit(1);
  } else {
    console.log('✓ Audit system initialized successfully');
    console.log('✓ Tables created: audit_log, evidence_files, approval_workflows, approval_steps');
    console.log('✓ Tables created: notification_queue, compliance_reports, sync_log');
    process.exit(0);
  }
});
