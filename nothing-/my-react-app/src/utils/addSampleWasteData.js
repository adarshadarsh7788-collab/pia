// Add sample waste management data
export const addSampleWasteData = () => {
  const sampleWasteData = [
    {
      id: Date.now() + 1,
      companyName: localStorage.getItem('esg_company_name') || 'Sample Company',
      category: 'environmental',
      metric: 'wasteGenerated',
      value: 1200,
      unit: 'tons',
      reportingYear: new Date().getFullYear(),
      status: 'Submitted',
      timestamp: new Date().toISOString(),
      description: 'Total waste generated'
    },
    {
      id: Date.now() + 2,
      companyName: localStorage.getItem('esg_company_name') || 'Sample Company',
      category: 'environmental',
      metric: 'wasteRecycled',
      value: 840,
      unit: 'tons',
      reportingYear: new Date().getFullYear(),
      status: 'Submitted',
      timestamp: new Date().toISOString(),
      description: 'Waste recycled'
    }
  ];

  const existing = JSON.parse(localStorage.getItem('esgData') || '[]');
  const updated = [...existing, ...sampleWasteData];
  localStorage.setItem('esgData', JSON.stringify(updated));
  
  window.dispatchEvent(new CustomEvent('esgDataUpdated'));
  return sampleWasteData;
};
