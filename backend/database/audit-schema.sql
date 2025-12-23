-- Enhanced Audit & Assurance Schema

-- Immutable Audit Log with Blockchain-style Chain
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  previous_hash TEXT,
  current_hash TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_role TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_verified INTEGER DEFAULT 1,
  FOREIGN KEY (previous_hash) REFERENCES audit_log(current_hash)
);

-- Evidence Files Storage
CREATE TABLE IF NOT EXISTS evidence_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  s3_key TEXT,
  description TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT NOT NULL,
  is_deleted INTEGER DEFAULT 0
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id TEXT UNIQUE NOT NULL,
  data_id TEXT NOT NULL,
  data_type TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  current_level TEXT NOT NULL,
  status TEXT NOT NULL,
  completed_at DATETIME,
  metadata TEXT
);

-- Approval Steps
CREATE TABLE IF NOT EXISTS approval_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT NOT NULL,
  approver TEXT,
  approved_at DATETIME,
  comments TEXT,
  FOREIGN KEY (workflow_id) REFERENCES approval_workflows(workflow_id)
);

-- Email Notifications Queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  related_id TEXT,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME
);

-- Compliance Reports
CREATE TABLE IF NOT EXISTS compliance_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL,
  framework TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_by TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT,
  status TEXT DEFAULT 'completed',
  metadata TEXT
);

-- Real-time Sync Log
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id, table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_evidence_data ON evidence_files(data_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON approval_workflows(status, current_level);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON sync_log(entity_type, entity_id);
