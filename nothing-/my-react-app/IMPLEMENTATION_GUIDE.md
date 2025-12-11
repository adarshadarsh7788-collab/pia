# ESG Audit & Assurance Implementation Guide

## ✅ Implemented Features

### 1. **Immutable Audit Trail with Blockchain-Style Chaining**
- Hash-based chain linking for tamper detection
- Complete record of all data operations
- Integrity verification endpoint
- Database: `audit_log` table

### 2. **Server-Side File Storage**
- Local file system storage with S3 integration ready
- MD5 checksums for file integrity
- Evidence file management
- Database: `evidence_files` table

### 3. **Database Persistence**
- SQLite database with comprehensive schema
- All audit logs, workflows, and evidence stored persistently
- Indexed for performance

### 4. **Multi-Level Approval Workflows**
- 4-level approval: Site → Business Unit → Group ESG → Executive
- Email notifications at each level
- Workflow tracking and history
- Database: `approval_workflows`, `approval_steps` tables

### 5. **Email Notifications**
- Nodemailer integration
- Approval request notifications
- Status update notifications
- Audit alert notifications
- Queue-based retry mechanism
- Database: `notification_queue` table

### 6. **Real-Time Sync Across Users**
- WebSocket-based synchronization
- Multi-user collaboration support
- Automatic reconnection
- Event broadcasting
- Database: `sync_log` table

### 7. **Compliance Reporting**
- SOX compliance reports
- ISO 27001 reports
- GDPR compliance reports
- PDF generation with audit trail data
- Database: `compliance_reports` table

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd esg-backend
npm install nodemailer ws dotenv
```

2. **Initialize Database**
```bash
node initAuditSystem.js
```

3. **Configure Environment**
Copy `.env.example` to `.env` and configure:
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SITE_APPROVER_EMAIL=approver@company.com
# ... other settings
```

4. **Start Enhanced Server**
```bash
node server-enhanced.js
```

### Frontend Setup

1. **Configure API URL**
Create `.env` in frontend root:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

2. **Initialize Real-Time Sync**
In your main App component:
```javascript
import realtimeSyncClient from './services/realtimeSyncClient';

useEffect(() => {
  const userId = localStorage.getItem('currentUser');
  if (userId) {
    realtimeSyncClient.connect(userId);
  }
  return () => realtimeSyncClient.disconnect();
}, []);
```

## 📡 API Endpoints

### Audit Trail
- `GET /api/audit/audit-trail` - Get audit trail with filters
- `POST /api/audit/audit-trail` - Create audit entry
- `GET /api/audit/audit-trail/verify` - Verify chain integrity

### Evidence Files
- `POST /api/audit/evidence/upload` - Upload evidence file
- `GET /api/audit/evidence/:dataId` - Get files for data entry
- `GET /api/audit/evidence/file/:fileId` - Download file
- `DELETE /api/audit/evidence/:fileId` - Delete file

### Workflows
- `POST /api/audit/workflow/create` - Create approval workflow
- `POST /api/audit/workflow/:workflowId/approve` - Approve
- `POST /api/audit/workflow/:workflowId/reject` - Reject
- `GET /api/audit/workflow/:workflowId` - Get workflow details
- `GET /api/audit/workflow/pending/:level?` - Get pending approvals

### Compliance Reports
- `POST /api/audit/compliance/report/sox` - Generate SOX report
- `POST /api/audit/compliance/report/iso` - Generate ISO report
- `POST /api/audit/compliance/report/gdpr` - Generate GDPR report
- `GET /api/audit/compliance/reports` - List all reports

### Notifications
- `POST /api/audit/notifications/process` - Process notification queue

## 🔧 Usage Examples

### Creating Audit Entry
```javascript
await axios.post(`${API_URL}/audit/audit-trail`, {
  action: 'update',
  tableName: 'esg_data',
  recordId: '123',
  userId: 'user@company.com',
  userRole: 'data_entry',
  oldValues: { value: 100 },
  newValues: { value: 150 },
  metadata: { ipAddress: '192.168.1.1' }
});
```

### Uploading Evidence
```javascript
const file = {
  name: 'certificate.pdf',
  type: 'application/pdf',
  size: 102400,
  data: base64Data
};

await axios.post(`${API_URL}/audit/evidence/upload`, {
  dataId: 'ESG_001',
  file,
  uploadedBy: 'user@company.com',
  description: 'ISO certification'
});
```

### Creating Workflow
```javascript
await axios.post(`${API_URL}/audit/workflow/create`, {
  dataId: 'ESG_001',
  dataType: 'Emissions Data',
  submittedBy: 'user@company.com',
  submitterEmail: 'user@company.com'
});
```

### Real-Time Sync
```javascript
import realtimeSyncClient from './services/realtimeSyncClient';

// Subscribe to updates
realtimeSyncClient.subscribe('esg_data', (data) => {
  console.log('Data updated:', data);
  // Refresh UI
});

// Broadcast update
realtimeSyncClient.syncUpdate('esg_data', '123', 'update', {
  field: 'value',
  newValue: 150
});
```

## 🔒 Security Features

1. **Immutable Audit Log**: Blockchain-style hash chaining prevents tampering
2. **File Checksums**: MD5 verification for uploaded files
3. **Session Tracking**: All actions tied to user sessions
4. **IP Logging**: Track source of all operations
5. **Integrity Verification**: Endpoint to verify audit chain

## 📊 Database Schema

All tables created in `audit-schema.sql`:
- `audit_log` - Immutable audit entries with hash chain
- `evidence_files` - File metadata and storage paths
- `approval_workflows` - Workflow state management
- `approval_steps` - Individual approval actions
- `notification_queue` - Email notification queue
- `compliance_reports` - Generated compliance reports
- `sync_log` - Real-time sync event log

## 🎯 Production Considerations

### For AWS Deployment:
1. Replace local file storage with S3 (code ready in `fileStorageService.js`)
2. Use RDS instead of SQLite for scalability
3. Configure SES for email notifications
4. Use ALB with WebSocket support for real-time sync
5. Enable CloudWatch logging

### For Azure Deployment:
1. Use Azure Blob Storage for files
2. Azure SQL Database for persistence
3. SendGrid or Azure Communication Services for email
4. Azure SignalR for real-time sync

## 📝 Testing

Test audit chain integrity:
```bash
curl http://localhost:5000/api/audit/audit-trail/verify
```

Test notification queue:
```bash
curl -X POST http://localhost:5000/api/audit/notifications/process
```

## 🎉 Summary

All missing features have been implemented:
✅ Real-time sync across users (WebSocket)
✅ Server-side file storage (Local + S3 ready)
✅ Database persistence (SQLite with migration path)
✅ Email notifications (Nodemailer with queue)
✅ Audit log immutability (Hash chain verification)
✅ Compliance reporting (SOX, ISO, GDPR)

The system is now production-ready with enterprise-grade auditability and assurance capabilities.
