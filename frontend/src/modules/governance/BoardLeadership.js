// Enhanced Board & Leadership Module
export class BoardLeadership {
  static boardRoles = ['chairman', 'ceo', 'independent_director', 'executive_director', 'audit_committee', 'compensation_committee'];
  static diversityMetrics = ['gender', 'age', 'ethnicity', 'expertise', 'tenure'];
  static governanceAreas = ['oversight', 'strategy', 'risk_management', 'compliance', 'succession_planning'];

  static assessBoardLeadership(boardData, meetingData, performanceData, compensationData) {
    try {
      const compositionAnalysis = this.analyzeBoardComposition(boardData);
      const diversityAssessment = this.assessBoardDiversity(boardData);
      const performanceEvaluation = this.evaluateBoardPerformance(performanceData, meetingData);
      const compensationAnalysis = this.analyzeCompensation(compensationData);
      const governanceEffectiveness = this.assessGovernanceEffectiveness(boardData, performanceData);
      
      return {
        compositionAnalysis,
        diversityAssessment,
        performanceEvaluation,
        compensationAnalysis,
        governanceEffectiveness,
        overallGovernanceScore: this.calculateGovernanceScore(compositionAnalysis, diversityAssessment, performanceEvaluation),
        recommendations: this.generateGovernanceRecommendations(compositionAnalysis, diversityAssessment, performanceEvaluation)
      };
    } catch (error) {
      console.error('Board & leadership analysis failed:', error);
      return this.getDefaultBoardAnalysis();
    }
  }

  static analyzeBoardComposition(boardData) {
    const members = boardData.members || [];
    
    return {
      totalMembers: members.length,
      independentDirectors: members.filter(m => m.independent).length,
      executiveDirectors: members.filter(m => !m.independent).length,
      independenceRatio: members.length > 0 ? (members.filter(m => m.independent).length / members.length) * 100 : 0,
      averageTenure: this.calculateAverageTenure(members),
      skillsMatrix: this.analyzeSkillsMatrix(members),
      committees: this.analyzeCommittees(boardData.committees)
    };
  }

  static assessBoardDiversity(boardData) {
    const members = boardData.members || [];
    const diversity = {};
    
    this.diversityMetrics.forEach(metric => {
      diversity[metric] = this.calculateDiversityMetric(members, metric);
    });
    
    return {
      byMetric: diversity,
      overallDiversityScore: this.calculateOverallDiversityScore(diversity),
      representation: this.analyzeRepresentation(members),
      trends: this.analyzeDiversityTrends(boardData.historical)
    };
  }

  static evaluateBoardPerformance(performanceData, meetingData) {
    const meetings = meetingData.meetings || [];
    const evaluations = performanceData.evaluations || [];
    
    return {
      meetingAttendance: this.calculateMeetingAttendance(meetings),
      decisionEffectiveness: this.assessDecisionEffectiveness(performanceData),
      strategicOversight: this.evaluateStrategicOversight(evaluations),
      riskOversight: this.evaluateRiskOversight(evaluations),
      stakeholderEngagement: this.assessStakeholderEngagement(performanceData),
      performanceRatings: this.analyzePerformanceRatings(evaluations)
    };
  }

  static analyzeCompensation(compensationData) {
    const compensation = compensationData || {};
    
    return {
      executiveCompensation: this.analyzeExecutiveCompensation(compensation.executive),
      directorCompensation: this.analyzeDirectorCompensation(compensation.directors),
      payForPerformance: this.assessPayForPerformance(compensation),
      peerBenchmarking: this.benchmarkCompensation(compensation),
      disclosureCompliance: this.assessCompensationDisclosure(compensation),
      shareholderApproval: this.trackShareholderApproval(compensation.approvals)
    };
  }

  static assessGovernanceEffectiveness(boardData, performanceData) {
    return {
      oversightEffectiveness: this.measureOversightEffectiveness(performanceData),
      complianceOversight: this.assessComplianceOversight(boardData),
      riskManagement: this.evaluateRiskManagement(performanceData),
      successionPlanning: this.assessSuccessionPlanning(boardData.succession),
      stakeholderRelations: this.evaluateStakeholderRelations(performanceData),
      ethicalLeadership: this.assessEthicalLeadership(boardData, performanceData)
    };
  }

  static calculateAverageTenure(members) {
    if (members.length === 0) return 0;
    const totalTenure = members.reduce((sum, member) => sum + (member.tenure || 0), 0);
    return totalTenure / members.length;
  }

  static analyzeSkillsMatrix(members) {
    const skills = {};
    members.forEach(member => {
      (member.skills || []).forEach(skill => {
        skills[skill] = (skills[skill] || 0) + 1;
      });
    });
    return skills;
  }

  static calculateDiversityMetric(members, metric) {
    const distribution = {};
    members.forEach(member => {
      const value = member[metric] || 'unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return {
      distribution,
      diversityIndex: this.calculateShannonIndex(distribution),
      representation: this.assessMetricRepresentation(distribution, metric)
    };
  }

  static calculateShannonIndex(distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    
    let index = 0;
    Object.values(distribution).forEach(count => {
      if (count > 0) {
        const proportion = count / total;
        index -= proportion * Math.log2(proportion);
      }
    });
    
    return index;
  }

  static calculateMeetingAttendance(meetings) {
    if (meetings.length === 0) return { overall: 0, byMember: {} };
    
    const attendanceByMember = {};
    let totalAttendance = 0;
    let totalPossible = 0;
    
    meetings.forEach(meeting => {
      (meeting.attendees || []).forEach(attendee => {
        attendanceByMember[attendee] = (attendanceByMember[attendee] || 0) + 1;
        totalAttendance++;
      });
      totalPossible += meeting.expectedAttendees || 0;
    });
    
    return {
      overall: totalPossible > 0 ? (totalAttendance / totalPossible) * 100 : 0,
      byMember: attendanceByMember,
      averagePerMeeting: meetings.length > 0 ? totalAttendance / meetings.length : 0
    };
  }

  static calculateGovernanceScore(composition, diversity, performance) {
    const compositionScore = Math.min(100, composition.independenceRatio + 20);
    const diversityScore = diversity.overallDiversityScore || 50;
    const performanceScore = performance.performanceRatings?.average || 70;
    
    return (compositionScore + diversityScore + performanceScore) / 3;
  }

  static generateGovernanceRecommendations(composition, diversity, performance) {
    const recommendations = [];
    
    if (composition.independenceRatio < 50) {
      recommendations.push({
        area: 'independence',
        priority: 'high',
        action: 'Increase board independence to meet governance standards',
        timeline: '12 months'
      });
    }
    
    if (diversity.overallDiversityScore < 60) {
      recommendations.push({
        area: 'diversity',
        priority: 'medium',
        action: 'Enhance board diversity across multiple dimensions',
        timeline: '18 months'
      });
    }
    
    if (performance.meetingAttendance?.overall < 80) {
      recommendations.push({
        area: 'engagement',
        priority: 'medium',
        action: 'Improve board member engagement and meeting attendance',
        timeline: '6 months'
      });
    }
    
    return recommendations;
  }

  static getDefaultBoardAnalysis() {
    return {
      compositionAnalysis: { totalMembers: 0, independentDirectors: 0, executiveDirectors: 0, independenceRatio: 0, averageTenure: 0, skillsMatrix: {}, committees: {} },
      diversityAssessment: { byMetric: {}, overallDiversityScore: 0, representation: {}, trends: {} },
      performanceEvaluation: { meetingAttendance: {}, decisionEffectiveness: 0, strategicOversight: 0, riskOversight: 0, stakeholderEngagement: 0, performanceRatings: {} },
      compensationAnalysis: { executiveCompensation: {}, directorCompensation: {}, payForPerformance: 0, peerBenchmarking: {}, disclosureCompliance: 0, shareholderApproval: {} },
      governanceEffectiveness: { oversightEffectiveness: 0, complianceOversight: 0, riskManagement: 0, successionPlanning: 0, stakeholderRelations: 0, ethicalLeadership: 0 },
      overallGovernanceScore: 0,
      recommendations: []
    };
  }
}

export default BoardLeadership;