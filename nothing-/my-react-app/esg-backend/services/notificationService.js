const nodemailer = require('nodemailer');
const db = require('../database/db');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async queueNotification(recipient, subject, body, type, relatedId = null) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notification_queue (recipient, subject, body, notification_type, related_id)
        VALUES (?, ?, ?, ?, ?)
      `, [recipient, subject, body, type, relatedId], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  async sendApprovalNotification(workflowId, approverEmail, dataType, submittedBy) {
    const subject = `ESG Approval Required: ${dataType}`;
    const body = `
      <h2>Approval Request</h2>
      <p>A new ${dataType} submission requires your approval.</p>
      <p><strong>Submitted by:</strong> ${submittedBy}</p>
      <p><strong>Workflow ID:</strong> ${workflowId}</p>
      <p>Please log in to the ESG platform to review and approve.</p>
      <a href="${process.env.APP_URL}/approvals/${workflowId}">Review Now</a>
    `;
    
    await this.queueNotification(approverEmail, subject, body, 'approval_request', workflowId);
    return this.processQueue();
  }

  async sendApprovalStatusNotification(workflowId, submitterEmail, status, comments) {
    const subject = `ESG Approval ${status.toUpperCase()}: Workflow ${workflowId}`;
    const body = `
      <h2>Approval Status Update</h2>
      <p>Your submission has been <strong>${status}</strong>.</p>
      <p><strong>Workflow ID:</strong> ${workflowId}</p>
      ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
      <a href="${process.env.APP_URL}/workflows/${workflowId}">View Details</a>
    `;
    
    await this.queueNotification(submitterEmail, subject, body, 'approval_status', workflowId);
    return this.processQueue();
  }

  async sendAuditAlertNotification(recipients, alertType, details) {
    const subject = `ESG Audit Alert: ${alertType}`;
    const body = `
      <h2>Audit Alert</h2>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Details:</strong> ${details}</p>
      <p>Please review the audit trail immediately.</p>
    `;
    
    for (const recipient of recipients) {
      await this.queueNotification(recipient, subject, body, 'audit_alert', null);
    }
    return this.processQueue();
  }

  async processQueue() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM notification_queue 
        WHERE status = 'pending' AND attempts < 3 
        ORDER BY created_at LIMIT 10
      `, async (err, rows) => {
        if (err) return reject(err);
        
        const results = [];
        for (const notification of rows) {
          try {
            await this.sendEmail(notification);
            await this.markAsSent(notification.id);
            results.push({ id: notification.id, status: 'sent' });
          } catch (error) {
            await this.incrementAttempts(notification.id);
            results.push({ id: notification.id, status: 'failed', error: error.message });
          }
        }
        resolve(results);
      });
    });
  }

  async sendEmail(notification) {
    if (!process.env.SMTP_USER) {
      console.log('Email notification (SMTP not configured):', notification.subject);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notification.recipient,
      subject: notification.subject,
      html: notification.body
    });
  }

  async markAsSent(notificationId) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE notification_queue 
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [notificationId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async incrementAttempts(notificationId) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE notification_queue 
        SET attempts = attempts + 1, status = CASE WHEN attempts >= 2 THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `, [notificationId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new NotificationService();
