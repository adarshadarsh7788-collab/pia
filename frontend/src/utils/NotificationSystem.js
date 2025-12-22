// ESG Notification and Reminder System
export class NotificationSystem {
  static notifications = [];
  static subscribers = new Map();
  static reminderSchedules = [];

  static initialize() {
    this.loadNotifications();
    this.loadReminderSchedules();
    this.startReminderEngine();
  }

  static subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }
    this.subscribers.get(userId).push(callback);
  }

  static unsubscribe(userId, callback) {
    if (this.subscribers.has(userId)) {
      const callbacks = this.subscribers.get(userId);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  static createNotification(type, title, message, userId, priority = 'medium', data = {}) {
    const notification = {
      id: this.generateNotificationId(),
      type,
      title,
      message,
      userId,
      priority,
      data,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false,
      actions: this.getNotificationActions(type)
    };

    this.notifications.unshift(notification);
    this.persistNotifications();
    this.notifySubscribers(userId, notification);
    
    return notification.id;
  }

  static generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getNotificationActions(type) {
    const actionMap = {
      'data_validation_failed': [
        { id: 'review', label: 'Review Data', action: 'navigate', target: '/data-entry' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
      ],
      'approval_pending': [
        { id: 'approve', label: 'Review & Approve', action: 'navigate', target: '/workflow' },
        { id: 'remind_later', label: 'Remind Later', action: 'snooze', duration: 3600000 }
      ],
      'deadline_approaching': [
        { id: 'complete', label: 'Complete Now', action: 'navigate', target: '/data-entry' },
        { id: 'extend', label: 'Request Extension', action: 'custom', handler: 'requestExtension' }
      ],
      'report_ready': [
        { id: 'view', label: 'View Report', action: 'navigate', target: '/reports' },
        { id: 'download', label: 'Download', action: 'custom', handler: 'downloadReport' }
      ]
    };

    return actionMap[type] || [
      { id: 'dismiss', label: 'Dismiss', action: 'dismiss' }
    ];
  }

  static notifySubscribers(userId, notification) {
    const userCallbacks = this.subscribers.get(userId) || [];
    const allCallbacks = this.subscribers.get('*') || [];
    
    [...userCallbacks, ...allCallbacks].forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Notification callback error:', error);
      }
    });
  }

  static markAsRead(notificationId, userId) {
    const notification = this.notifications.find(n => 
      n.id === notificationId && n.userId === userId
    );
    
    if (notification) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      this.persistNotifications();
      return true;
    }
    
    return false;
  }

  static markAsDismissed(notificationId, userId) {
    const notification = this.notifications.find(n => 
      n.id === notificationId && n.userId === userId
    );
    
    if (notification) {
      notification.dismissed = true;
      notification.dismissedAt = new Date().toISOString();
      this.persistNotifications();
      return true;
    }
    
    return false;
  }

  static getNotifications(userId, filters = {}) {
    let userNotifications = this.notifications.filter(n => 
      n.userId === userId || n.userId === '*'
    );

    // Apply filters
    if (filters.unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    if (filters.type) {
      userNotifications = userNotifications.filter(n => n.type === filters.type);
    }

    if (filters.priority) {
      userNotifications = userNotifications.filter(n => n.priority === filters.priority);
    }

    if (!filters.includeDismissed) {
      userNotifications = userNotifications.filter(n => !n.dismissed);
    }

    return userNotifications.slice(0, filters.limit || 50);
  }

  static getUnreadCount(userId) {
    return this.notifications.filter(n => 
      (n.userId === userId || n.userId === '*') && !n.read && !n.dismissed
    ).length;
  }

  // Automated notification triggers
  static notifyDataValidationFailed(userId, validationResults) {
    const errorCount = validationResults.errors?.length || 0;
    const warningCount = validationResults.warnings?.length || 0;
    
    return this.createNotification(
      'data_validation_failed',
      'Data Validation Issues',
      `Found ${errorCount} errors and ${warningCount} warnings in your ESG data submission.`,
      userId,
      errorCount > 0 ? 'high' : 'medium',
      { validationResults }
    );
  }

  static notifyApprovalPending(userId, pendingItems) {
    const count = Array.isArray(pendingItems) ? pendingItems.length : 1;
    
    return this.createNotification(
      'approval_pending',
      'Approval Required',
      `${count} ESG data ${count === 1 ? 'entry' : 'entries'} pending your approval.`,
      userId,
      'high',
      { pendingItems, count }
    );
  }

  static notifyDeadlineApproaching(userId, deadline, taskType) {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    return this.createNotification(
      'deadline_approaching',
      'Deadline Approaching',
      `${taskType} deadline is in ${daysLeft} days (${new Date(deadline).toLocaleDateString()}).`,
      userId,
      daysLeft <= 3 ? 'high' : 'medium',
      { deadline, taskType, daysLeft }
    );
  }

  static notifyReportReady(userId, reportType, reportId) {
    return this.createNotification(
      'report_ready',
      'Report Generated',
      `Your ${reportType} report has been generated and is ready for review.`,
      userId,
      'medium',
      { reportType, reportId }
    );
  }

  static notifyDataSubmitted(userId, submissionData) {
    const categoryCount = submissionData.categories?.length || 0;
    
    return this.createNotification(
      'data_submitted',
      'Data Submitted Successfully',
      `ESG data for ${categoryCount} categories has been submitted for review.`,
      userId,
      'low',
      { submissionData }
    );
  }

  // Reminder system
  static scheduleReminder(userId, type, scheduledFor, data = {}) {
    const reminder = {
      id: this.generateNotificationId(),
      userId,
      type,
      scheduledFor: new Date(scheduledFor).toISOString(),
      data,
      active: true,
      created: new Date().toISOString()
    };

    this.reminderSchedules.push(reminder);
    this.persistReminderSchedules();
    
    return reminder.id;
  }

  static cancelReminder(reminderId) {
    const reminder = this.reminderSchedules.find(r => r.id === reminderId);
    if (reminder) {
      reminder.active = false;
      this.persistReminderSchedules();
      return true;
    }
    return false;
  }

  static startReminderEngine() {
    // Check for due reminders every minute
    setInterval(() => {
      this.processReminders();
    }, 60000);
  }

  static processReminders() {
    const now = new Date();
    
    this.reminderSchedules
      .filter(r => r.active && new Date(r.scheduledFor) <= now)
      .forEach(reminder => {
        this.triggerReminder(reminder);
        reminder.active = false;
      });
    
    this.persistReminderSchedules();
  }

  static triggerReminder(reminder) {
    const reminderTypes = {
      'data_entry_due': () => this.notifyDeadlineApproaching(
        reminder.userId, 
        reminder.data.deadline, 
        'ESG Data Entry'
      ),
      'approval_reminder': () => this.notifyApprovalPending(
        reminder.userId, 
        reminder.data.pendingItems
      ),
      'report_generation': () => this.createNotification(
        'report_reminder',
        'Report Generation Reminder',
        `Time to generate your ${reminder.data.reportType} report.`,
        reminder.userId,
        'medium',
        reminder.data
      )
    };

    const handler = reminderTypes[reminder.type];
    if (handler) {
      handler();
    }
  }

  // Bulk operations
  static markAllAsRead(userId) {
    let count = 0;
    this.notifications
      .filter(n => (n.userId === userId || n.userId === '*') && !n.read)
      .forEach(n => {
        n.read = true;
        n.readAt = new Date().toISOString();
        count++;
      });
    
    this.persistNotifications();
    return count;
  }

  static clearDismissed(userId) {
    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => 
      !n.dismissed || (n.userId !== userId && n.userId !== '*')
    );
    
    this.persistNotifications();
    return originalLength - this.notifications.length;
  }

  // Persistence
  static persistNotifications() {
    try {
      localStorage.setItem('esg_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }

  static loadNotifications() {
    try {
      const stored = localStorage.getItem('esg_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  static persistReminderSchedules() {
    try {
      localStorage.setItem('esg_reminders', JSON.stringify(this.reminderSchedules));
    } catch (error) {
      console.error('Failed to persist reminders:', error);
    }
  }

  static loadReminderSchedules() {
    try {
      const stored = localStorage.getItem('esg_reminders');
      if (stored) {
        this.reminderSchedules = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
      this.reminderSchedules = [];
    }
  }

  // Statistics and analytics
  static getNotificationStats(userId) {
    const userNotifications = this.getNotifications(userId, { includeDismissed: true });
    
    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      dismissed: userNotifications.filter(n => n.dismissed).length,
      byType: this.groupBy(userNotifications, 'type'),
      byPriority: this.groupBy(userNotifications, 'priority'),
      recentActivity: userNotifications.filter(n => 
        new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
  }

  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  static clearAllNotifications(userId) {
    this.notifications = this.notifications.filter(n => 
      n.userId !== userId && n.userId !== '*'
    );
    this.persistNotifications();
  }
}

// Initialize the notification system
NotificationSystem.initialize();

export default NotificationSystem;