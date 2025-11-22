import express from 'express';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/framework-compliance/dashboard/:companyId - Enhanced dashboard data
router.get('/dashboard/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Get all compliance data for the company
    const complianceData = await models.FrameworkCompliance.findAll({
      where: { 
        companyId,
        reportingYear: year,
        isActive: true
      }
    });

    // Calculate framework-specific metrics
    const frameworkMetrics = {};
    const frameworks = ['GRI', 'SASB', 'TCFD', 'BRSR'];

    frameworks.forEach(framework => {
      const frameworkData = complianceData.filter(item => item.frameworkType === framework);
      
      frameworkMetrics[framework] = {
        totalRequirements: frameworkData.length,
        compliant: frameworkData.filter(item => item.complianceStatus === 'COMPLIANT').length,
        partial: frameworkData.filter(item => item.complianceStatus === 'PARTIAL').length,
        nonCompliant: frameworkData.filter(item => item.complianceStatus === 'NON_COMPLIANT').length,
        inProgress: frameworkData.filter(item => item.complianceStatus === 'IN_PROGRESS').length,
        notStarted: frameworkData.filter(item => item.complianceStatus === 'NOT_STARTED').length,
        avgComplianceScore: frameworkData.length > 0 ? 
          frameworkData.reduce((sum, item) => sum + (item.complianceScore || 0), 0) / frameworkData.length : 0,
        avgDataQuality: frameworkData.length > 0 ? 
          frameworkData.reduce((sum, item) => sum + (item.dataQualityScore || 0), 0) / frameworkData.length : 0,
        avgCompleteness: frameworkData.length > 0 ? 
          frameworkData.reduce((sum, item) => sum + (item.completenessScore || 0), 0) / frameworkData.length : 0,
        highMateriality: frameworkData.filter(item => item.materialityLevel === 'HIGH').length,
        verified: frameworkData.filter(item => item.verificationStatus === 'VERIFIED').length
      };
    });

    // Overall metrics
    const overallMetrics = {
      totalRequirements: complianceData.length,
      overallComplianceRate: complianceData.length > 0 ? 
        (complianceData.filter(item => item.complianceStatus === 'COMPLIANT').length / complianceData.length) * 100 : 0,
      avgDataQuality: complianceData.length > 0 ? 
        complianceData.reduce((sum, item) => sum + (item.dataQualityScore || 0), 0) / complianceData.length : 0,
      avgCompleteness: complianceData.length > 0 ? 
        complianceData.reduce((sum, item) => sum + (item.completenessScore || 0), 0) / complianceData.length : 0,
      criticalGaps: complianceData.filter(item => 
        item.materialityLevel === 'HIGH' && 
        ['NON_COMPLIANT', 'NOT_STARTED'].includes(item.complianceStatus)
      ).length,
      verificationRate: complianceData.length > 0 ? 
        (complianceData.filter(item => item.verificationStatus === 'VERIFIED').length / complianceData.length) * 100 : 0
    };

    // Risk analysis
    const riskAnalysis = {
      critical: complianceData.filter(item => item.riskLevel === 'CRITICAL').length,
      high: complianceData.filter(item => item.riskLevel === 'HIGH').length,
      medium: complianceData.filter(item => item.riskLevel === 'MEDIUM').length,
      low: complianceData.filter(item => item.riskLevel === 'LOW').length
    };

    // Materiality breakdown
    const materialityBreakdown = {
      high: complianceData.filter(item => item.materialityLevel === 'HIGH').length,
      medium: complianceData.filter(item => item.materialityLevel === 'MEDIUM').length,
      low: complianceData.filter(item => item.materialityLevel === 'LOW').length,
      notApplicable: complianceData.filter(item => item.materialityLevel === 'NOT_APPLICABLE').length
    };

    res.json({
      success: true,
      data: {
        frameworkMetrics,
        overallMetrics,
        riskAnalysis,
        materialityBreakdown,
        reportingYear: year,
        lastUpdated: new Date(),
        dataStatus: {
          totalRecords: complianceData.length,
          dataCompleteness: overallMetrics.avgCompleteness,
          dataQuality: overallMetrics.avgDataQuality,
          verificationCoverage: overallMetrics.verificationRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/framework-compliance/detailed/:companyId/:framework - Detailed framework data
router.get('/detailed/:companyId/:framework', async (req, res) => {
  try {
    const { companyId, framework } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const detailedData = await models.FrameworkCompliance.findAll({
      where: { 
        companyId,
        frameworkType: framework.toUpperCase(),
        reportingYear: year,
        isActive: true
      },
      order: [['materialityLevel', 'DESC'], ['complianceScore', 'ASC']]
    });

    // Group by standards
    const groupedData = {};
    detailedData.forEach(item => {
      if (!groupedData[item.standardId]) {
        groupedData[item.standardId] = [];
      }
      groupedData[item.standardId].push(item);
    });

    res.json({
      success: true,
      data: {
        framework,
        year,
        totalRequirements: detailedData.length,
        groupedData,
        summary: {
          compliant: detailedData.filter(item => item.complianceStatus === 'COMPLIANT').length,
          partial: detailedData.filter(item => item.complianceStatus === 'PARTIAL').length,
          nonCompliant: detailedData.filter(item => item.complianceStatus === 'NON_COMPLIANT').length,
          avgScore: detailedData.length > 0 ? 
            detailedData.reduce((sum, item) => sum + (item.complianceScore || 0), 0) / detailedData.length : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/framework-compliance/seed/:companyId - Seed sample data
router.post('/seed/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const currentYear = new Date().getFullYear();

    // Sample GRI Standards data
    const griData = [
      {
        companyId,
        frameworkType: 'GRI',
        frameworkVersion: '2021',
        standardId: 'GRI-2',
        requirementId: 'GRI-2-1',
        requirementTitle: 'Organizational details',
        materialityLevel: 'HIGH',
        complianceStatus: 'COMPLIANT',
        complianceScore: 95,
        dataQualityScore: 90,
        completenessScore: 100,
        evidenceType: 'DOCUMENT',
        evidenceQuality: 'EXCELLENT',
        riskLevel: 'LOW',
        assessmentDate: new Date(),
        reportingYear: currentYear,
        stakeholderRelevance: 'HIGH',
        businessImpact: 'MEDIUM',
        verificationStatus: 'VERIFIED'
      },
      {
        companyId,
        frameworkType: 'GRI',
        frameworkVersion: '2021',
        standardId: 'GRI-205',
        requirementId: 'GRI-205-1',
        requirementTitle: 'Operations assessed for risks related to corruption',
        materialityLevel: 'HIGH',
        complianceStatus: 'PARTIAL',
        complianceScore: 70,
        dataQualityScore: 75,
        completenessScore: 80,
        evidenceType: 'PROCESS',
        evidenceQuality: 'GOOD',
        riskLevel: 'MEDIUM',
        assessmentDate: new Date(),
        reportingYear: currentYear,
        stakeholderRelevance: 'VERY_HIGH',
        businessImpact: 'HIGH',
        verificationStatus: 'SELF_ASSESSED'
      },
      {
        companyId,
        frameworkType: 'GRI',
        frameworkVersion: '2021',
        standardId: 'GRI-302',
        requirementId: 'GRI-302-1',
        requirementTitle: 'Energy consumption within the organization',
        materialityLevel: 'HIGH',
        complianceStatus: 'COMPLIANT',
        complianceScore: 85,
        dataQualityScore: 88,
        completenessScore: 92,
        evidenceType: 'DATA',
        evidenceQuality: 'GOOD',
        riskLevel: 'MEDIUM',
        assessmentDate: new Date(),
        reportingYear: currentYear,
        stakeholderRelevance: 'HIGH',
        businessImpact: 'HIGH',
        verificationStatus: 'THIRD_PARTY'
      }
    ];

    // Sample SASB data
    const sasbData = [
      {
        companyId,
        frameworkType: 'SASB',
        frameworkVersion: '2023',
        standardId: 'TC-SI',
        requirementId: 'TC-SI-220a.1',
        requirementTitle: 'Data Security',
        materialityLevel: 'HIGH',
        complianceStatus: 'COMPLIANT',
        complianceScore: 92,
        dataQualityScore: 95,
        completenessScore: 90,
        evidenceType: 'CERTIFICATION',
        evidenceQuality: 'EXCELLENT',
        riskLevel: 'HIGH',
        assessmentDate: new Date(),
        reportingYear: currentYear,
        stakeholderRelevance: 'VERY_HIGH',
        businessImpact: 'VERY_HIGH',
        verificationStatus: 'VERIFIED'
      }
    ];

    // Sample TCFD data
    const tcfdData = [
      {
        companyId,
        frameworkType: 'TCFD',
        frameworkVersion: '2023',
        standardId: 'GOVERNANCE',
        requirementId: 'GOV-A',
        requirementTitle: 'Board oversight of climate-related risks and opportunities',
        materialityLevel: 'HIGH',
        complianceStatus: 'PARTIAL',
        complianceScore: 75,
        dataQualityScore: 80,
        completenessScore: 70,
        evidenceType: 'POLICY',
        evidenceQuality: 'GOOD',
        riskLevel: 'MEDIUM',
        assessmentDate: new Date(),
        reportingYear: currentYear,
        stakeholderRelevance: 'HIGH',
        businessImpact: 'HIGH',
        verificationStatus: 'SELF_ASSESSED'
      }
    ];

    const allSampleData = [...griData, ...sasbData, ...tcfdData];

    // Clear existing data for this company and year
    await models.FrameworkCompliance.destroy({
      where: { companyId, reportingYear: currentYear }
    });

    // Insert new sample data
    await models.FrameworkCompliance.bulkCreate(allSampleData);

    res.json({
      success: true,
      message: `Seeded ${allSampleData.length} framework compliance records`,
      data: { recordsCreated: allSampleData.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/framework-compliance/:id - Update compliance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRows] = await models.FrameworkCompliance.update(updateData, {
      where: { id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    const updatedRecord = await models.FrameworkCompliance.findByPk(id);

    res.json({
      success: true,
      message: 'Compliance record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;