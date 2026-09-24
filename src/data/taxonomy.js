// Controlled vocabularies (FR-03). In the real system these are admin-editable (FR-25).

export const HAZARDS = [
  { id: 'flood', en: 'Flood', bn: 'বন্যা' },
  { id: 'cyclone', en: 'Cyclone & storm surge', bn: 'ঘূর্ণিঝড় ও জলোচ্ছ্বাস' },
  { id: 'salinity', en: 'Salinity intrusion', bn: 'লবণাক্ততা' },
  { id: 'drought', en: 'Drought', bn: 'খরা' },
  { id: 'erosion', en: 'River erosion', bn: 'নদী ভাঙন' },
  { id: 'slr', en: 'Sea-level rise', bn: 'সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধি' },
  { id: 'flash', en: 'Flash flood', bn: 'আকস্মিক বন্যা' },
  { id: 'heat', en: 'Heat stress', bn: 'তাপপ্রবাহ' },
  { id: 'landslide', en: 'Landslide', bn: 'ভূমিধস' },
  { id: 'waterlogging', en: 'Waterlogging', bn: 'জলাবদ্ধতা' },
]

export const SECTORS = [
  { id: 'agriculture', en: 'Agriculture & food security', bn: 'কৃষি ও খাদ্য নিরাপত্তা' },
  { id: 'water', en: 'Water resources & WASH', bn: 'পানি সম্পদ ও ওয়াশ' },
  { id: 'drr', en: 'Disaster risk reduction', bn: 'দুর্যোগ ঝুঁকি হ্রাস' },
  { id: 'infrastructure', en: 'Infrastructure', bn: 'অবকাঠামো' },
  { id: 'nrm', en: 'Natural resource management', bn: 'প্রাকৃতিক সম্পদ ব্যবস্থাপনা' },
  { id: 'livelihood', en: 'Livelihoods', bn: 'জীবিকা' },
  { id: 'health', en: 'Health', bn: 'স্বাস্থ্য' },
]

export const INTERVENTION_TYPES = [
  { id: 'physical', en: 'Physical / structural', bn: 'ভৌত / কাঠামোগত' },
  { id: 'institutional', en: 'Institutional', bn: 'প্রাতিষ্ঠানিক' },
  { id: 'behavioural', en: 'Behavioural', bn: 'আচরণগত' },
]

export const ECOSYSTEMS = [
  { id: 'coastal', en: 'Coastal', bn: 'উপকূলীয়' },
  { id: 'haor', en: 'Haor (wetland basin)', bn: 'হাওর' },
  { id: 'char', en: 'Char (river island)', bn: 'চর' },
  { id: 'hill', en: 'Hill', bn: 'পাহাড়ি' },
  { id: 'barind', en: 'Barind (drought-prone)', bn: 'বরেন্দ্র' },
  { id: 'urban', en: 'Urban', bn: 'শহুরে' },
  { id: 'floodplain', en: 'Floodplain', bn: 'প্লাবনভূমি' },
]

export const STATUSES = [
  { id: 'past', en: 'Completed', bn: 'সম্পন্ন' },
  { id: 'ongoing', en: 'Ongoing', bn: 'চলমান' },
  { id: 'planned', en: 'Planned', bn: 'পরিকল্পিত' },
]

export const ACTOR_TYPES = [
  { id: 'gov', en: 'Government', bn: 'সরকার' },
  { id: 'ngo', en: 'NGO / INGO / CSO', bn: 'এনজিও / আইএনজিও / সিএসও' },
  { id: 'private', en: 'Private sector', bn: 'বেসরকারি খাত' },
  { id: 'community', en: 'Community-led', bn: 'সম্প্রদায়-নেতৃত্বাধীন' },
  { id: 'academia', en: 'Academia', bn: 'শিক্ষা প্রতিষ্ঠান' },
]

export const VERIFICATION = [
  { id: 'self', en: 'Self-reported', bn: 'স্ব-প্রতিবেদিত' },
  { id: 'desk', en: 'Desk-verified', bn: 'ডেস্ক-যাচাইকৃত' },
  { id: 'field', en: 'Field-verified', bn: 'মাঠ-যাচাইকৃত' },
]

export const SURVIVAL = [
  { id: 'functional', en: 'Fully functional', bn: 'সম্পূর্ণ কার্যকর' },
  { id: 'partial', en: 'Partially functional', bn: 'আংশিক কার্যকর' },
  { id: 'failed', en: 'Not functional', bn: 'অকার্যকর' },
  { id: 'na', en: 'Not yet assessable', bn: 'এখনও মূল্যায়নযোগ্য নয়' },
]

export const POLICY_TAGS = [
  { id: 'NAP', en: 'NAP 2023–2050', bn: 'জাতীয় অভিযোজন পরিকল্পনা' },
  { id: 'BCCSAP', en: 'BCCSAP', bn: 'বিসিসিএসএপি' },
  { id: 'NDC', en: 'NDC 3.0', bn: 'এনডিসি ৩.০' },
  { id: 'BDP2100', en: 'Delta Plan 2100', bn: 'ডেল্টা প্ল্যান ২১০০' },
]

// Admin hierarchy (BBS geocodes abbreviated for the demo).
export const DIVISIONS = [
  { id: 'barishal', code: '10', en: 'Barishal', bn: 'বরিশাল', lat: 22.7, lng: 90.37 },
  { id: 'chattogram', code: '20', en: 'Chattogram', bn: 'চট্টগ্রাম', lat: 22.6, lng: 91.9 },
  { id: 'dhaka', code: '30', en: 'Dhaka', bn: 'ঢাকা', lat: 23.8, lng: 90.3 },
  { id: 'khulna', code: '40', en: 'Khulna', bn: 'খুলনা', lat: 22.8, lng: 89.3 },
  { id: 'mymensingh', code: '45', en: 'Mymensingh', bn: 'ময়মনসিংহ', lat: 24.75, lng: 90.4 },
  { id: 'rajshahi', code: '50', en: 'Rajshahi', bn: 'রাজশাহী', lat: 24.5, lng: 88.9 },
  { id: 'rangpur', code: '55', en: 'Rangpur', bn: 'রংপুর', lat: 25.75, lng: 89.25 },
  { id: 'sylhet', code: '60', en: 'Sylhet', bn: 'সিলেট', lat: 24.7, lng: 91.7 },
]

export const DISTRICTS = {
  barishal: ['Barguna', 'Bhola', 'Patuakhali', 'Pirojpur', 'Barishal'],
  chattogram: ['Cox\'s Bazar', 'Chattogram', 'Bandarban', 'Rangamati', 'Noakhali', 'Feni'],
  dhaka: ['Dhaka', 'Faridpur', 'Madaripur', 'Shariatpur', 'Tangail'],
  khulna: ['Khulna', 'Satkhira', 'Bagerhat', 'Jashore', 'Kushtia'],
  mymensingh: ['Mymensingh', 'Netrokona', 'Jamalpur', 'Sherpur'],
  rajshahi: ['Rajshahi', 'Chapainawabganj', 'Naogaon', 'Sirajganj', 'Bogura'],
  rangpur: ['Kurigram', 'Gaibandha', 'Lalmonirhat', 'Nilphamari', 'Rangpur'],
  sylhet: ['Sunamganj', 'Sylhet', 'Habiganj', 'Moulvibazar'],
}

// Indicative hazard zones for the map layer (FR-20). Real build uses official hazard rasters.
export const HAZARD_ZONES = [
  { id: 'cyclone', color: '#0b9cda', center: [22.0, 90.2], radius: 110000, en: 'Cyclone-exposed coastal belt', bn: 'ঘূর্ণিঝড়-প্রবণ উপকূল' },
  { id: 'salinity', color: '#53297d', center: [22.3, 89.2], radius: 60000, en: 'High salinity zone', bn: 'উচ্চ লবণাক্ততা অঞ্চল' },
  { id: 'flash', color: '#e70052', center: [24.9, 91.2], radius: 60000, en: 'Haor flash-flood zone', bn: 'হাওর আকস্মিক বন্যা অঞ্চল' },
  { id: 'drought', color: '#f16e22', center: [24.8, 88.5], radius: 65000, en: 'Barind drought zone', bn: 'বরেন্দ্র খরা অঞ্চল' },
  { id: 'erosion', color: '#9d4816', center: [25.3, 89.65], radius: 50000, en: 'Jamuna char erosion zone', bn: 'যমুনা চর ভাঙন অঞ্চল' },
]

export const byId = (list, id) => list.find((x) => x.id === id)
export const label = (list, id, lang) => byId(list, id)?.[lang] ?? id
