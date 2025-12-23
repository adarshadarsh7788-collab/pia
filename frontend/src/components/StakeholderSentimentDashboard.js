import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Button, Toast } from './ProfessionalUX';
import { StakeholderSentimentAnalysis } from '../modules/analytics/StakeholderSentimentAnalysis';

const StakeholderSentimentDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [sentimentResults, setSentimentResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState('all');

  const stakeholderTypes = [
    { id: 'all', name: 'All Stakeholders', icon: '👥' },
    { id: 'investors', name: 'Investors', icon: '💼' },
    { id: 'employees', name: 'Employees', icon: '👨‍💼' },
    { id: 'customers', name: 'Customers', icon: '🛒' },
    { id: 'communities', name: 'Communities', icon: '🏘️' },
    { id: 'regulators', name: 'Regulators', icon: '⚖️' },
    { id: 'suppliers', name: 'Suppliers', icon: '🚚' }
  ];

  const runSentimentAnalysis = async () => {
    setLoading(true);
    try {
      // Generate test data for sentiment analysis
      const stakeholderData = generateTestStakeholderData();
      const feedbackData = generateTestFeedbackData();
      const socialMediaData = generateTestSocialMediaData();
      
      const results = StakeholderSentimentAnalysis.analyzeSentiment(
        stakeholderData,
        feedbackData,
        socialMediaData
      );
      
      setSentimentResults(results);
      showToast('Sentiment analysis completed successfully', 'success');
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      showToast('Sentiment analysis failed', 'error');
    }
    setLoading(false);
  };

  const generateTestStakeholderData = () => ({
    investors: {
      feedback: [
        { text: 'Great ESG performance this quarter', date: '2024-01-15' },
        { text: 'Concerned about carbon emissions', date: '2024-01-20' },
        { text: 'Excellent sustainability initiatives', date: '2024-02-01' }
      ],
      responseRate: 75,
      participationRate: 68,
      surveys: [{ satisfactionScore: 78 }]
    },
    employees: {
      feedback: [
        { text: 'Happy with diversity programs', date: '2024-01-10' },
        { text: 'Need better work-life balance', date: '2024-01-25' },
        { text: 'Good safety measures implemented', date: '2024-02-05' }
      ],
      responseRate: 82,
      participationRate: 79,
      surveys: [{ satisfactionScore: 72 }]
    },
    customers: {
      feedback: [
        { text: 'Love the sustainable products', date: '2024-01-12' },
        { text: 'Disappointed with packaging waste', date: '2024-01-28' },
        { text: 'Excellent environmental commitment', date: '2024-02-03' }
      ],
      responseRate: 65,
      participationRate: 58,
      surveys: [{ satisfactionScore: 81 }]
    },
    communities: {
      feedback: [
        { text: 'Great community investment programs', date: '2024-01-18' },
        { text: 'Positive impact on local economy', date: '2024-02-02' }
      ],
      responseRate: 45,
      participationRate: 52,
      surveys: [{ satisfactionScore: 85 }]
    },
    regulators: {
      feedback: [
        { text: 'Good compliance with regulations', date: '2024-01-22' },
        { text: 'Transparent reporting appreciated', date: '2024-02-01' }
      ],
      responseRate: 90,
      participationRate: 88,
      surveys: [{ satisfactionScore: 88 }]
    },
    suppliers: {
      feedback: [
        { text: 'Fair supplier practices', date: '2024-01-16' },
        { text: 'Good partnership approach', date: '2024-01-30' }
      ],
      responseRate: 70,
      participationRate: 65,
      surveys: [{ satisfactionScore: 76 }]
    }
  });

  const generateTestFeedbackData = () => [
    { text: 'Positive ESG initiatives', date: '2024-01-15', stakeholder: 'investors' },
    { text: 'Great sustainability efforts', date: '2024-01-20', stakeholder: 'customers' },
    { text: 'Need improvement in diversity', date: '2024-01-25', stakeholder: 'employees' },
    { text: 'Excellent community programs', date: '2024-02-01', stakeholder: 'communities' }
  ];

  const generateTestSocialMediaData = () => ({
    twitter: { sentiment: 0.3, mentions: 150, engagement: 65 },
    linkedin: { sentiment: 0.5, mentions: 89, engagement: 78 },
    facebook: { sentiment: 0.2, mentions: 45, engagement: 52 },
    instagram: { sentiment: 0.4, mentions: 67, engagement: 71 },
    overallSentiment: 0.35,
    mentions: 351,
    engagement: 66.5
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.3) return '😊';
    if (sentiment < -0.3) return '😞';
    return '😐';
  };

  const renderOverallSentiment = () => {
    if (!sentimentResults.overallSentiment) return null;

    const { score, category, riskLevel } = sentimentResults.overallSentiment;

    return (
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Overall Stakeholder Sentiment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">{getSentimentIcon(score)}</div>
            <div className={`text-2xl font-bold ${getSentimentColor(score)}`}>
              {(score * 100).toFixed(1)}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>Sentiment Score</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${theme.text.primary} capitalize`}>
              {category}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>Category</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              riskLevel === 'high' ? 'text-red-600' : 
              riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
            } capitalize`}>
              {riskLevel}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>Risk Level</div>
          </div>
        </div>
      </div>
    );
  };

  const renderStakeholderSentiment = () => {
    if (!sentimentResults.sentimentByStakeholder) return null;

    return (
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Sentiment by Stakeholder
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(sentimentResults.sentimentByStakeholder).map(([stakeholder, data]) => (
            <div key={stakeholder} className={`p-4 border rounded-lg ${theme.bg.subtle}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${theme.text.primary} capitalize`}>
                  {stakeholder}
                </h4>
                <span className="text-2xl">
                  {stakeholderTypes.find(s => s.id === stakeholder)?.icon || '👥'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sentiment:</span>
                  <span className={getSentimentColor(data.overallSentiment)}>
                    {(data.overallSentiment * 100).toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className={theme.text.secondary}>
                    {data.engagementLevel?.level || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Satisfaction:</span>
                  <span className={theme.text.secondary}>
                    {data.satisfactionScore?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                
                {data.concerns && data.concerns.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-medium text-red-800">Concerns:</div>
                    {data.concerns.map((concern, index) => (
                      <div key={index} className="text-red-700">
                        {concern.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSentimentTrends = () => {
    if (!sentimentResults.sentimentTrends) return null;

    const { trendDirection, volatility } = sentimentResults.sentimentTrends;

    return (
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Sentiment Trends
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-2 ${theme.text.primary}`}>Trend Direction</h4>
            <div className={`text-lg font-semibold ${
              trendDirection === 'improving' ? 'text-green-600' : 
              trendDirection === 'declining' ? 'text-red-600' : 'text-gray-600'
            } capitalize`}>
              {trendDirection} {
                trendDirection === 'improving' ? '📈' : 
                trendDirection === 'declining' ? '📉' : '➡️'
              }
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium mb-2 ${theme.text.primary}`}>Volatility</h4>
            <div className={`text-lg font-semibold ${theme.text.secondary}`}>
              {(volatility * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSocialMediaSentiment = () => {
    if (!sentimentResults.socialMediaSentiment) return null;

    const { platforms, mentions, reputationScore } = sentimentResults.socialMediaSentiment;

    return (
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Social Media Sentiment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${theme.text.primary}`}>Platform Analysis</h4>
            <div className="space-y-2">
              {Object.entries(platforms).map(([platform, data]) => (
                <div key={platform} className="flex justify-between items-center">
                  <span className="capitalize">{platform}</span>
                  <div className="flex items-center space-x-2">
                    <span className={getSentimentColor(data.sentiment)}>
                      {(data.sentiment * 100).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({data.mentions} mentions)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 ${theme.text.primary}`}>Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Mentions:</span>
                <span className={theme.text.secondary}>{mentions}</span>
              </div>
              <div className="flex justify-between">
                <span>Reputation Score:</span>
                <span className={theme.text.secondary}>{reputationScore?.toFixed(1)}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!sentimentResults.recommendations || sentimentResults.recommendations.length === 0) return null;

    return (
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Recommendations
        </h3>
        
        <div className="space-y-3">
          {sentimentResults.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 border-l-4 rounded ${
                rec.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium capitalize">{rec.stakeholder}</div>
                  <div className="text-sm text-gray-600 mt-1">{rec.action}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority} priority
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">Timeline: {rec.timeline}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${theme.bg.gradient}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
            Stakeholder Sentiment Analysis
          </h1>
          <p className={`text-lg ${theme.text.secondary}`}>
            AI-powered sentiment tracking and stakeholder engagement insights
          </p>
        </div>

        <div className="mb-6">
          <Button
            variant="primary"
            onClick={runSentimentAnalysis}
            disabled={loading}
            className="mr-4"
          >
            {loading ? 'Analyzing...' : 'Run Sentiment Analysis'}
          </Button>
        </div>

        <div className="space-y-6">
          {renderOverallSentiment()}
          {renderStakeholderSentiment()}
          {renderSentimentTrends()}
          {renderSocialMediaSentiment()}
          {renderRecommendations()}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default StakeholderSentimentDashboard;