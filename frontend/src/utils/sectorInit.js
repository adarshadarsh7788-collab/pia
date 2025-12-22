// Initialize default sector if none is set
export const initializeSector = () => {
  const currentSector = localStorage.getItem('currentSector');
  
  if (!currentSector) {
    // Set manufacturing as default sector
    localStorage.setItem('currentSector', 'manufacturing');
    
    // Dispatch sector change event
    window.dispatchEvent(new CustomEvent('sectorChanged', { 
      detail: { sector: 'manufacturing' } 
    }));
    
    console.log('Initialized default sector: manufacturing');
  }
  
  return currentSector || 'manufacturing';
};

// Check if user should be redirected to sector selection
export const shouldShowSectorSelection = () => {
  const currentSector = localStorage.getItem('currentSector');
  const hasSeenSectorSelection = localStorage.getItem('hasSeenSectorSelection');
  
  // Show sector selection if no sector is set or user hasn't seen it before
  return !currentSector || !hasSeenSectorSelection;
};

// Mark that user has seen sector selection
export const markSectorSelectionSeen = () => {
  localStorage.setItem('hasSeenSectorSelection', 'true');
};

export default { initializeSector, shouldShowSectorSelection, markSectorSelectionSeen };