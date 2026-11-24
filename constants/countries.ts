// List of countries with their full names and phone codes
export interface Country {
  name: string;
  code: string;
  phoneCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US', phoneCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', phoneCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', phoneCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', phoneCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', phoneCode: '+33', flag: '🇫🇷' },
  { name: 'Pakistan', code: 'PK', phoneCode: '+92', flag: '🇵🇰' },
  { name: 'India', code: 'IN', phoneCode: '+91', flag: '🇮🇳' },
  { name: 'China', code: 'CN', phoneCode: '+86', flag: '🇨🇳' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', phoneCode: '+82', flag: '🇰🇷' },
  { name: 'Singapore', code: 'SG', phoneCode: '+65', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: 'QA', phoneCode: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', phoneCode: '+965', flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', phoneCode: '+973', flag: '🇧🇭' },
  { name: 'Oman', code: 'OM', phoneCode: '+968', flag: '🇴🇲' },
  { name: 'Turkey', code: 'TR', phoneCode: '+90', flag: '🇹🇷' },
  { name: 'Egypt', code: 'EG', phoneCode: '+20', flag: '🇪🇬' },
  { name: 'South Africa', code: 'ZA', phoneCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'NG', phoneCode: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: 'KE', phoneCode: '+254', flag: '🇰🇪' },
  { name: 'Brazil', code: 'BR', phoneCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', phoneCode: '+52', flag: '🇲🇽' },
  { name: 'Argentina', code: 'AR', phoneCode: '+54', flag: '🇦🇷' },
  { name: 'Spain', code: 'ES', phoneCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'IT', phoneCode: '+39', flag: '🇮🇹' },
  { name: 'Netherlands', code: 'NL', phoneCode: '+31', flag: '🇳🇱' },
  { name: 'Belgium', code: 'BE', phoneCode: '+32', flag: '🇧🇪' },
  { name: 'Switzerland', code: 'CH', phoneCode: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: 'SE', phoneCode: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', phoneCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', phoneCode: '+45', flag: '🇩🇰' },
  { name: 'Finland', code: 'FI', phoneCode: '+358', flag: '🇫🇮' },
  { name: 'Poland', code: 'PL', phoneCode: '+48', flag: '🇵🇱' },
  { name: 'Russia', code: 'RU', phoneCode: '+7', flag: '🇷🇺' },
  { name: 'Ukraine', code: 'UA', phoneCode: '+380', flag: '🇺🇦' },
  { name: 'Austria', code: 'AT', phoneCode: '+43', flag: '🇦🇹' },
  { name: 'Portugal', code: 'PT', phoneCode: '+351', flag: '🇵🇹' },
  { name: 'Greece', code: 'GR', phoneCode: '+30', flag: '🇬🇷' },
  { name: 'Ireland', code: 'IE', phoneCode: '+353', flag: '🇮🇪' },
  { name: 'New Zealand', code: 'NZ', phoneCode: '+64', flag: '🇳🇿' },
  { name: 'Malaysia', code: 'MY', phoneCode: '+60', flag: '🇲🇾' },
  { name: 'Thailand', code: 'TH', phoneCode: '+66', flag: '🇹🇭' },
  { name: 'Indonesia', code: 'ID', phoneCode: '+62', flag: '🇮🇩' },
  { name: 'Philippines', code: 'PH', phoneCode: '+63', flag: '🇵🇭' },
  { name: 'Vietnam', code: 'VN', phoneCode: '+84', flag: '🇻🇳' },
  { name: 'Bangladesh', code: 'BD', phoneCode: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: 'LK', phoneCode: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: 'NP', phoneCode: '+977', flag: '🇳🇵' },
];

// Helper function to find country by name
export const findCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
};

// Helper function to get country names for autocomplete
export const getCountryNames = (): string[] => {
  return COUNTRIES.map(c => c.name);
};

// Helper function to validate country name
export const isValidCountryName = (name: string): boolean => {
  return COUNTRIES.some(c => c.name.toLowerCase() === name.toLowerCase());
};

// Phone validation patterns by country
export const PHONE_PATTERNS: Record<string, RegExp> = {
  'US': /^(\+1|1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  'GB': /^(\+44|0)?[\s.-]?7\d{3}[\s.-]?\d{6}$/,
  'CA': /^(\+1|1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  'AU': /^(\+61|0)?[\s.-]?[2-478]\d{8}$/,
  'PK': /^(\+92|0)?[\s.-]?3\d{2}[\s.-]?\d{7}$/,
  'IN': /^(\+91|0)?[\s.-]?[6-9]\d{9}$/,
  'AE': /^(\+971|0)?[\s.-]?5[0-9]{8}$/,
  'SA': /^(\+966|0)?[\s.-]?5\d{8}$/,
  'DE': /^(\+49|0)?[\s.-]?1[5-7]\d{8,9}$/,
  'FR': /^(\+33|0)?[\s.-]?[67]\d{8}$/,
};

// Get phone pattern by country code
export const getPhonePattern = (countryCode: string): RegExp => {
  return PHONE_PATTERNS[countryCode] || /^[\d\s\-\+\(\)]{7,20}$/;
};

// Get phone placeholder by country
export const getPhonePlaceholder = (countryCode: string): string => {
  const placeholders: Record<string, string> = {
    'US': '+1 (555) 123-4567',
    'GB': '+44 7xxx xxxxxx',
    'CA': '+1 (555) 123-4567',
    'AU': '+61 4xx xxx xxx',
    'PK': '+92 3xx xxxxxxx',
    'IN': '+91 xxxxx xxxxx',
    'AE': '+971 5x xxx xxxx',
    'SA': '+966 5x xxx xxxx',
    'DE': '+49 1xx xxxxxxxx',
    'FR': '+33 6xx xx xx xx',
  };
  return placeholders[countryCode] || 'Enter phone number';
};
