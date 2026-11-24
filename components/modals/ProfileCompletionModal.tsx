import React, { useState } from 'react';
import { UserCircle, MapPin, Phone, Briefcase, CheckCircle, Users, Calendar } from 'lucide-react';

// Popular countries with their phone codes and validation
const COUNTRIES = [
  { name: 'Pakistan', code: 'PK', phoneCode: '+92', phoneLength: 10, cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'] },
  { name: 'India', code: 'IN', phoneCode: '+91', phoneLength: 10, cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'] },
  { name: 'United States', code: 'US', phoneCode: '+1', phoneLength: 10, cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'] },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', phoneLength: 10, cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'] },
  { name: 'Canada', code: 'CA', phoneCode: '+1', phoneLength: 10, cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'] },
  { name: 'Australia', code: 'AU', phoneCode: '+61', phoneLength: 9, cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Sunshine Coast'] },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', phoneLength: 9, cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain', 'Khor Fakkan', 'Dibba Al-Fujairah'] },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', phoneLength: 9, cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Abha'] },
  { name: 'Bangladesh', code: 'BD', phoneCode: '+880', phoneLength: 10, cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Narayanganj'] },
  { name: 'Germany', code: 'DE', phoneCode: '+49', phoneLength: 10, cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'] },
  { name: 'France', code: 'FR', phoneCode: '+33', phoneLength: 9, cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'] },
  { name: 'Turkey', code: 'TR', phoneCode: '+90', phoneLength: 10, cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin'] },
  { name: 'Nigeria', code: 'NG', phoneCode: '+234', phoneLength: 10, cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna', 'Maiduguri', 'Zaria', 'Aba'] },
  { name: 'Egypt', code: 'EG', phoneCode: '+20', phoneLength: 10, cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'Tanta', 'Asyut'] },
  { name: 'South Africa', code: 'ZA', phoneCode: '+27', phoneLength: 9, cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley'] },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'rather_not_say', label: 'Rather not say' },
];

const AGE_RANGES = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_25', label: '18 - 25' },
  { value: '26_35', label: '26 - 35' },
  { value: '36_45', label: '36 - 45' },
  { value: '46_55', label: '46 - 55' },
  { value: '56_above', label: '56 and above' },
];

interface ProfileCompletionModalProps {
  userName: string;
  onComplete: (profileData: {
    country: string;
    city: string;
    phone: string;
    role: string;
    gender: string;
    ageRange: string;
  }) => void;
  isSubmitting?: boolean;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  userName,
  onComplete,
  isSubmitting = false
}) => {
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'country':
        return !value ? 'Country is required' : '';
      case 'city':
        if (!value.trim()) return 'City is required';
        // Basic city name validation for custom input
        if (isCustomCity) {
          if (value.trim().length < 2) {
            return 'City name must be at least 2 characters';
          }
          if (!/^[a-zA-Z\s\-\.]+$/.test(value)) {
            return 'City name can only contain letters, spaces, hyphens, and periods';
          }
        }
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!selectedCountry) return 'Please select a country first';
        
        // Remove all non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');
        const expectedLength = selectedCountry.phoneLength;
        
        if (digitsOnly.length !== expectedLength) {
          return `Phone number must be ${expectedLength} digits for ${selectedCountry.name}`;
        }
        return '';
      case 'role':
        return !value.trim() ? 'Title/Role is required' : '';
      case 'gender':
        return !value ? 'Please select your gender' : '';
      case 'ageRange':
        return !value ? 'Please select your age range' : '';
      default:
        return '';
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = COUNTRIES.find(c => c.code === countryCode);
    setSelectedCountry(country || null);
    setCity(''); // Reset city when country changes
    setIsCustomCity(false); // Reset custom city state
    setPhoneNumber(''); // Reset phone number
    
    if (touched.country) {
      setErrors(prev => ({ ...prev, country: validateField('country', country?.name || '') }));
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check if user selected "Other (Type your city)"
    if (value === '__custom__') {
      setIsCustomCity(true);
      setCity('');
    } else {
      setCity(value);
      setIsCustomCity(false);
    }
    
    if (touched.city) {
      setErrors(prev => ({ ...prev, city: validateField('city', value) }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, and dashes
    const value = e.target.value;
    const sanitized = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(sanitized);
    
    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: validateField('phone', sanitized) }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRole(value);
    if (touched.role) {
      setErrors(prev => ({ ...prev, role: validateField('role', value) }));
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGender(value);
    if (touched.gender) {
      setErrors(prev => ({ ...prev, gender: validateField('gender', value) }));
    }
  };

  const handleAgeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAgeRange(value);
    if (touched.ageRange) {
      setErrors(prev => ({ ...prev, ageRange: validateField('ageRange', value) }));
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    const newTouched: {[key: string]: boolean} = {};
    
    const fieldsToValidate = {
      country: selectedCountry?.name || '',
      city: city,
      phone: phoneNumber,
      role: role,
      gender: gender,
      ageRange: ageRange
    };

    Object.entries(fieldsToValidate).forEach(([field, value]) => {
      newTouched[field] = true;
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0 && selectedCountry) {
      // Format phone number with country code
      const fullPhoneNumber = `${selectedCountry.phoneCode} ${phoneNumber}`;
      
      onComplete({
        country: selectedCountry.name,
        city: city,
        phone: fullPhoneNumber,
        role: role,
        gender: gender,
        ageRange: ageRange
      });
    } else {
      // Focus first error field
      const firstError = Object.keys(newErrors)[0];
      document.getElementById(firstError)?.focus();
    }
  };

  const isFormValid = selectedCountry && city.trim() && phoneNumber.trim() && 
                      role.trim() && gender && ageRange &&
                      Object.values(errors).every(e => !e);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[--color-primary] to-[--color-secondary] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, {userName}! 👋</h2>
              <p className="text-white/90 text-sm mt-1">Let's complete your profile</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To get started on FOGSLY, we need a few more details to personalize your experience.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ✨ <strong>Note:</strong> All fields are required to complete your registration.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Dropdown */}
            <div>
              <label 
                htmlFor="country" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                Country *
              </label>
              <select
                id="country"
                value={selectedCountry?.code || ''}
                onChange={handleCountryChange}
                onBlur={(e) => handleBlur('country', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.country && touched.country 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && touched.country && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.country}
                </p>
              )}
            </div>

            {/* City Dropdown/Input */}
            <div>
              <label 
                htmlFor="city" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                City *
              </label>
              {!isCustomCity ? (
                <select
                  id="city"
                  value={city}
                  onChange={handleCityChange}
                  onBlur={(e) => handleBlur('city', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.city && touched.city 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                  }`}
                  disabled={isSubmitting || !selectedCountry}
                >
                  <option value="">
                    {selectedCountry ? 'Select your city' : 'Select a country first'}
                  </option>
                  {selectedCountry?.cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                  {selectedCountry && (
                    <option value="__custom__">🔍 Other (Type your city)</option>
                  )}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (touched.city) {
                        setErrors(prev => ({ ...prev, city: validateField('city', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('city', e.target.value)}
                    placeholder="Enter your city name"
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.city && touched.city 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCity(false);
                      setCity('');
                    }}
                    className="text-xs text-[--color-primary] hover:underline"
                  >
                    ← Back to city list
                  </button>
                </div>
              )}
              {errors.city && touched.city && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.city}
                </p>
              )}
            </div>

            {/* Phone Number with Country Code */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <div className="flex gap-2">
                {/* Country Code Display */}
                <div className="w-24 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center">
                  {selectedCountry?.phoneCode || '+00'}
                </div>
                {/* Phone Input */}
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  placeholder={selectedCountry ? `${selectedCountry.phoneLength} digits` : 'Select country first'}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.phone && touched.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                  }`}
                  disabled={isSubmitting || !selectedCountry}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.phone}
                </p>
              )}
              {selectedCountry && (
                <p className="text-gray-500 text-xs mt-1">
                  Enter {selectedCountry.phoneLength} digits for {selectedCountry.name}
                </p>
              )}
            </div>

            {/* Title/Role */}
            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Briefcase className="w-4 h-4 inline mr-1" />
                Your Title/Role *
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={handleRoleChange}
                onBlur={(e) => handleBlur('role', e.target.value)}
                placeholder="e.g., Web Developer, Graphic Designer"
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.role && touched.role 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                }`}
                disabled={isSubmitting}
              />
              {errors.role && touched.role && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.role}
                </p>
              )}
            </div>

            {/* Gender Dropdown */}
            <div>
              <label 
                htmlFor="gender" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Users className="w-4 h-4 inline mr-1" />
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={handleGenderChange}
                onBlur={(e) => handleBlur('gender', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.gender && touched.gender 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select your gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              {errors.gender && touched.gender && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.gender}
                </p>
              )}
            </div>

            {/* Age Range Dropdown */}
            <div>
              <label 
                htmlFor="ageRange" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Age Range *
              </label>
              <select
                id="ageRange"
                value={ageRange}
                onChange={handleAgeRangeChange}
                onBlur={(e) => handleBlur('ageRange', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.ageRange && touched.ageRange 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[--color-primary]'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select your age range</option>
                {AGE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              {errors.ageRange && touched.ageRange && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.ageRange}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Completing Profile...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Continue
                </span>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            You can update these details later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
};

// Test function to show modal in console
if (typeof window !== 'undefined') {
  (window as any).testProfileModal = () => {
    console.log('To test the profile modal, add this code to your console:');
    console.log(`
// Import React and ReactDOM first if not available
const modalContainer = document.createElement('div');
document.body.appendChild(modalContainer);

// You can trigger it from AuthPage state or call this to show:
// setShowProfileCompletion(true);

console.log('Note: The modal is controlled by AuthPage state.');
console.log('To show it, signup with a new account or set showProfileCompletion state to true');
    `);
  };
}

export default ProfileCompletionModal;
