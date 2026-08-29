/**
 * Regional Emergency Services Configuration
 * Supports dynamic location-aware emergency numbers with country/region extensibility.
 */

export const EMERGENCY_CONFIG = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    emergencyNumber: '112',
    policeNumber: '100',
    ambulanceNumber: '108',
    womenHelpline: '1091',
    childHelpline: '1098',
    label: 'National Emergency Helpline (112 - All Emergencies)',
    description: 'Call 112 for Police, Ambulance, Fire, or Disaster Response across India.',
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    emergencyNumber: '911',
    label: 'Emergency Services (911)',
    description: 'Call 911 for immediate Police, Fire, or Medical response.',
  },
  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    emergencyNumber: '999',
    label: 'Emergency Services (999)',
    description: 'Call 999 for Police, Ambulance, or Fire emergencies.',
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union',
    flag: '🇪🇺',
    emergencyNumber: '112',
    label: 'European Emergency Number (112)',
    description: 'Call 112 for any emergency in EU member states.',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    flag: '🇦🇺',
    emergencyNumber: '000',
    label: 'Emergency Services (000)',
    description: 'Call 000 for Police, Ambulance, or Fire response.',
  },
};

// Default country for the current prototype is India
export const DEFAULT_COUNTRY = 'IN';

/**
 * Resolves the active emergency configuration.
 * @param {string} [countryCode] - 2-letter ISO country code. Defaults to DEFAULT_COUNTRY.
 * @returns {object} Emergency configuration object.
 */
export function getEmergencyConfig(countryCode = DEFAULT_COUNTRY) {
  const code = (countryCode || DEFAULT_COUNTRY).toUpperCase();
  return EMERGENCY_CONFIG[code] || EMERGENCY_CONFIG[DEFAULT_COUNTRY];
}

/**
 * Returns list of supported countries for selection.
 */
export function getSupportedCountries() {
  return Object.values(EMERGENCY_CONFIG);
}
