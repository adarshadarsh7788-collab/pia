import React, { createContext, useContext, useState, useEffect } from 'react';
import { SECTOR_CONFIGS } from '../utils/sectorConfig';

const SectorContext = createContext();

export const useSector = () => {
  const context = useContext(SectorContext);
  if (!context) {
    throw new Error('useSector must be used within a SectorProvider');
  }
  return context;
};

export const SectorProvider = ({ children }) => {
  const [currentSector, setCurrentSector] = useState(() => {
    return null; // No sector-specific configuration
  });

  const [sectorConfig, setSectorConfig] = useState(() => {
    return null; // No sector-specific configuration
  });

  const changeSector = (newSector) => {
    // No sector changes needed - using generic ESG framework
    return;
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentSector' && e.newValue) {
        setCurrentSector(e.newValue);
        setSectorConfig(SECTOR_CONFIGS[e.newValue] || SECTOR_CONFIGS.healthcare);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    currentSector: null,
    sectorConfig: null,
    changeSector,
    availableSectors: [],
    getSectorConfig: () => null,
    isSectorActive: () => false
  };

  return (
    <SectorContext.Provider value={value}>
      {children}
    </SectorContext.Provider>
  );
};

export default SectorContext;