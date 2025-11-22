const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ReportsAPI {
  static async fetchComprehensiveReport() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/comprehensive`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch comprehensive report:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchPerformanceSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/performance/summary`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch performance summary:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchESGDataSources() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/esg/data-sources`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ESG data sources:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchEnvironmentalReport() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/sustainability/environmental`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch environmental report:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchSecuritySummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/security/summary`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch security summary:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchDeploymentHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/deployment/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch deployment health:', error);
      return { success: false, error: error.message };
    }
  }

  static async generatePDFReport(filename) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      return { success: false, error: error.message };
    }
  }

  static async fetchReportTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/types`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch report types:', error);
      return { success: false, error: error.message };
    }
  }

  // Dashboard summary data
  static async fetchDashboardSummary() {
    try {
      const [comprehensive, performance, dataSources] = await Promise.all([
        this.fetchComprehensiveReport(),
        this.fetchPerformanceSummary(),
        this.fetchESGDataSources()
      ]);

      return {
        success: true,
        data: {
          comprehensive: comprehensive.success ? comprehensive.data : null,
          performance: performance.success ? performance.data : null,
          dataSources: dataSources.success ? dataSources.data : null,
          summary: {
            totalReports: 0,
            performanceScore: 0,
            dataSourcesCount: 0,
            targetsMet: 0
          }
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ReportsAPI;