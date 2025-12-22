const API_BASE = 'http://localhost:5000/api';

class ReportsAPI {
  static async fetchDashboardSummary() {
    try {
      const response = await fetch(`${API_BASE}/reports/dashboard-summary`);
      return response.ok ? await response.json() : { success: false };
    } catch (error) {
      console.warn('ReportsAPI unavailable:', error.message);
      return { success: false };
    }
  }

  static async generateReport(type, data) {
    try {
      const response = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      return response.ok ? await response.json() : { success: false };
    } catch (error) {
      console.warn('Report generation failed:', error.message);
      return { success: false };
    }
  }
}

export default ReportsAPI;
