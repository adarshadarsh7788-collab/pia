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
    return localStorage.getItem('currentSector') || 'manufacturing';
  });

  const [sectorConfig, setSectorConfig] = useState(() => {
    return SECTOR_CONFIGS[currentSector] || SECTOR_CONFIGS.manufacturing;
  });

  const changeSector = (newSector) => {
    if (SECTOR_CONFIGS[newSector]) {
      setCurrentSector(newSector);
      setSectorConfig(SECTOR_CONFIGS[newSector]);
      localStorage.setItem('currentSector', newSector);
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('sectorChanged', { 
        detail: { sector: newSector, config: SECTOR_CONFIGS[newSector] } 
      }));
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentSector' && e.newValue) {
        setCurrentSector(e.newValue);
        setSectorConfig(SECTOR_CONFIGS[e.newValue] || SECTOR_CONFIGS.manufacturing);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    currentSector,
    sectorConfig,
    changeSector,
    availableSectors: Object.keys(SECTOR_CONFIGS),
    getSectorConfig: (sector) => SECTOR_CONFIGS[sector],
    isSectorActive: (sector) => currentSector === sector
  };

  return (
    <SectorContext.Provider value={value}>
      {children}
    </SectorContext.Provider>
  );
};

export default SectorContext;