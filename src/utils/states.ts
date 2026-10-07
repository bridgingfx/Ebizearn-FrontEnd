/**
 * States/emirates/provinces by country ISO code.
 * Used for both campaign geo-targeting and contributor profiles.
 */
export const STATES_BY_COUNTRY: Record<string, string[]> = {
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  SA: ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Tabuk', 'Qassim', 'Hail', 'Jazan', 'Najran', 'Al Bahah', 'Al Jouf', 'Northern Borders'],
  QA: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Khor', 'Al Shamal', 'Al Daayen'],
  KW: ['Al Asimah', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer'],
  BH: ['Capital', 'Muharraq', 'Northern', 'Southern'],
  OM: ['Muscat', 'Dhofar', 'Ad Dakhiliyah', 'Al Batinah North', 'Al Batinah South', 'Ash Sharqiyah North', 'Ash Sharqiyah South'],
  IN: ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Bihar', 'Madhya Pradesh', 'Haryana'],
  PK: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad'],
  PH: ['Metro Manila', 'Cebu', 'Davao', 'Iloilo', 'Batangas', 'Pampanga', 'Cavite', 'Laguna'],
  BD: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'],
  LK: ['Western', 'Central', 'Southern', 'Northern', 'Eastern'],
  NP: ['Bagmati', 'Gandaki', 'Lumbini', 'Koshi', 'Madhesh'],
  US: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
  GB: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  CA: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
  AU: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  NG: ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna'],
  ZA: ['Gauteng', 'KwaZulu-Natal', 'Western Cape', 'Eastern Cape'],
  EG: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'],
  GE: ['Tbilisi', 'Adjara', 'Imereti', 'Kvemo Kartli', 'Kakheti'],
};

/** Get the states/emirates list for a country ISO code (empty array if none). */
export const getStatesForCountry = (iso: string): string[] =>
  STATES_BY_COUNTRY[iso?.toUpperCase()] || [];
