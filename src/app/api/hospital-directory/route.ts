import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Search and list hospitals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const city = searchParams.get('city') || '';
    const district = searchParams.get('district') || '';
    const specialty = searchParams.get('specialty') || '';
    const hasEmergency = searchParams.get('hasEmergency');
    const hasICU = searchParams.get('hasICU');
    const partnershipStatus = searchParams.get('partnershipStatus') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Try to fetch from database
    let hospitals: any[] = [];
    
    try {
      const where: any = { isActive: true };
      
      if (type !== 'all') where.type = type;
      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (district) where.district = { contains: district, mode: 'insensitive' };
      if (hasEmergency === 'true') where.hasEmergency = true;
      if (hasICU === 'true') where.hasICU = true;
      if (partnershipStatus !== 'all') where.partnershipStatus = partnershipStatus;
      
      hospitals = await db.hospitalDirectory.findMany({
        where,
        orderBy: [
          { partnershipStatus: 'desc' },
          { rating: 'desc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      });
      
    } catch (dbError) {
      console.log('Using mock data for hospital directory');
    }

    // Use mock data if no hospitals found
    if (hospitals.length === 0) {
      hospitals = getMockHospitals();
      
      // Apply filters to mock data
      if (search) {
        hospitals = hospitals.filter(h => 
          h.name.toLowerCase().includes(search.toLowerCase()) ||
          h.city.toLowerCase().includes(search.toLowerCase()) ||
          h.departments?.some((d: string) => d.toLowerCase().includes(search.toLowerCase()))
        );
      }
      if (type !== 'all') {
        hospitals = hospitals.filter(h => h.type === type);
      }
      if (city) {
        hospitals = hospitals.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (specialty) {
        hospitals = hospitals.filter(h => 
          h.specialties?.some((s: string) => s.toLowerCase().includes(specialty.toLowerCase()))
        );
      }
      if (hasEmergency === 'true') {
        hospitals = hospitals.filter(h => h.hasEmergency);
      }
      if (hasICU === 'true') {
        hospitals = hospitals.filter(h => h.hasICU);
      }
      if (partnershipStatus !== 'all') {
        hospitals = hospitals.filter(h => h.partnershipStatus === partnershipStatus);
      }
      
      // Apply pagination
      hospitals = hospitals.slice((page - 1) * limit, page * limit);
    }

    // Parse JSON fields
    const processedHospitals = hospitals.map(h => ({
      ...h,
      departments: typeof h.departments === 'string' ? JSON.parse(h.departments) : h.departments || [],
      specialties: typeof h.specialties === 'string' ? JSON.parse(h.specialties) : h.specialties || [],
      facilities: typeof h.facilities === 'string' ? JSON.parse(h.facilities) : h.facilities || [],
      accreditations: typeof h.accreditations === 'string' ? JSON.parse(h.accreditations) : h.accreditations || []
    }));

    return NextResponse.json({
      success: true,
      hospitals: processedHospitals,
      total: processedHospitals.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Hospital directory fetch error:', error);
    return NextResponse.json({
      success: true,
      hospitals: getMockHospitals(),
      total: getMockHospitals().length
    });
  }
}

// POST - Create hospital directory entry
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const hospital = await db.hospitalDirectory.create({
      data: {
        name: data.name,
        type: data.type || 'private',
        category: data.category || 'general',
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        area: data.area,
        city: data.city,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        departments: JSON.stringify(data.departments || []),
        specialties: JSON.stringify(data.specialties || []),
        facilities: JSON.stringify(data.facilities || []),
        bedCapacity: data.bedCapacity,
        icuBeds: data.icuBeds,
        accreditations: JSON.stringify(data.accreditations || []),
        isOpen24Hours: data.isOpen24Hours || false,
        hasEmergency: data.hasEmergency ?? true,
        hasICU: data.hasICU || false,
        partnershipStatus: data.partnershipStatus || 'none',
        partnershipTier: data.partnershipTier
      }
    });

    return NextResponse.json({
      success: true,
      hospital,
      message: 'Hospital added to directory'
    });

  } catch (error) {
    console.error('Create hospital error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add hospital' }, { status: 500 });
  }
}

// Mock data for hospitals
function getMockHospitals() {
  return [
    {
      id: 'hd-1',
      name: 'Apollo Hospitals',
      type: 'private',
      category: 'multi_specialty',
      phone: '+91-40-23607777',
      email: 'info@apollohospitals.com',
      website: 'https://www.apollohospitals.com',
      address: 'Jubilee Hills, Road No. 72',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Gastroenterology', 'Nephrology'],
      specialties: ['Heart Surgery', 'Brain Surgery', 'Joint Replacement', 'Cancer Treatment', 'Kidney Transplant'],
      facilities: ['24x7 Emergency', 'ICU', 'Pharmacy', 'Cafeteria', 'Parking', 'WiFi', 'Blood Bank'],
      bedCapacity: 850,
      icuBeds: 100,
      accreditations: ['JCI', 'NABH', 'NABL'],
      partnershipStatus: 'active',
      partnershipTier: 'platinum',
      opdCommission: 12,
      ipdCommission: 10,
      surgeryCommission: 7,
      totalLeads: 456,
      totalEarnings: 1250000,
      rating: 4.8,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-2',
      name: 'Fortis Memorial Research Institute',
      type: 'private',
      category: 'super_specialty',
      phone: '+91-124-4962750',
      email: 'info@fortishealthcare.com',
      website: 'https://www.fortishealthcare.com',
      address: 'Sector - 44, Opposite HUDA City Centre',
      area: 'Gurgaon',
      city: 'Gurgaon',
      district: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002',
      departments: ['Cardiac Sciences', 'Neurosciences', 'Orthopedics', 'Renal Sciences', 'Liver Transplant'],
      specialties: ['Heart Transplant', 'Liver Transplant', 'Bone Marrow Transplant', 'Robotic Surgery'],
      facilities: ['24x7 Emergency', 'ICU', 'NICU', 'Pharmacy', 'Cafeteria', 'Parking', 'ATM'],
      bedCapacity: 1000,
      icuBeds: 150,
      accreditations: ['JCI', 'NABH', 'NABL'],
      partnershipStatus: 'active',
      partnershipTier: 'enterprise',
      opdCommission: 10,
      ipdCommission: 8,
      surgeryCommission: 5,
      totalLeads: 312,
      totalEarnings: 980000,
      rating: 4.7,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-3',
      name: 'Medanta - The Medicity',
      type: 'private',
      category: 'super_specialty',
      phone: '+91-124-4141414',
      email: 'info@medanta.org',
      website: 'https://www.medanta.org',
      address: 'Sector 38, Near Rajiv Chowk',
      area: 'Gurgaon',
      city: 'Gurgaon',
      district: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Cancer Institute', 'Transplant Institute'],
      specialties: ['Multi-organ Transplant', 'Cardiac Surgery', 'Neurosurgery', 'Robotic Surgery'],
      facilities: ['24x7 Emergency', 'ICU', 'CTICU', 'Organ Transplant ICU', 'Pharmacy', 'Lab'],
      bedCapacity: 1250,
      icuBeds: 200,
      accreditations: ['JCI', 'NABH'],
      partnershipStatus: 'active',
      partnershipTier: 'platinum',
      opdCommission: 12,
      ipdCommission: 10,
      surgeryCommission: 7,
      totalLeads: 523,
      totalEarnings: 1850000,
      rating: 4.9,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-4',
      name: 'AIIMS Delhi',
      type: 'government',
      category: 'multi_specialty',
      phone: '+91-11-26588500',
      email: 'info@aiims.edu',
      website: 'https://www.aiims.edu',
      address: 'Ansari Nagar, Aurobindo Marg',
      area: 'New Delhi',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110029',
      departments: ['All Specialties Available', 'Trauma Center', 'Cancer Center', 'Eye Center'],
      specialties: ['Rare Diseases', 'Complex Surgeries', 'Research', 'Organ Transplant'],
      facilities: ['24x7 Emergency', 'ICU', 'Trauma Center', 'Pharmacy', 'Blood Bank'],
      bedCapacity: 2500,
      icuBeds: 350,
      accreditations: ['NAAC A++', 'NABH'],
      partnershipStatus: 'active',
      partnershipTier: 'growth',
      opdCommission: 0,
      ipdCommission: 0,
      surgeryCommission: 0,
      totalLeads: 89,
      totalEarnings: 0,
      rating: 4.6,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-5',
      name: 'Artemis Hospital',
      type: 'private',
      category: 'multi_specialty',
      phone: '+91-124-6767999',
      email: 'info@artemishospitals.com',
      website: 'https://www.artemishospitals.com',
      address: 'Sector 51, Gurgaon',
      area: 'Gurgaon',
      city: 'Gurgaon',
      district: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Gynecology', 'Pediatrics'],
      specialties: ['Minimal Invasive Surgery', 'Robotic Surgery', 'IVF'],
      facilities: ['24x7 Emergency', 'ICU', 'NICU', 'Pharmacy', 'Cafeteria', 'Parking'],
      bedCapacity: 550,
      icuBeds: 80,
      accreditations: ['JCI', 'NABH'],
      partnershipStatus: 'active',
      partnershipTier: 'enterprise',
      opdCommission: 10,
      ipdCommission: 8,
      surgeryCommission: 5,
      totalLeads: 198,
      totalEarnings: 450000,
      rating: 4.5,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-6',
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      type: 'trust',
      category: 'multi_specialty',
      phone: '+91-22-30971818',
      email: 'info@kdahospital.com',
      website: 'https://www.kokilabenhospital.com',
      address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows',
      area: 'Andheri West',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      departments: ['Cardiac Sciences', 'Neurosciences', 'Orthopedics', 'Cancer', 'Transplant'],
      specialties: ['Heart Transplant', 'Liver Transplant', 'Kidney Transplant', 'Robotic Surgery'],
      facilities: ['24x7 Emergency', 'ICU', 'Transplant ICU', 'Pharmacy', 'Lab', 'Cafeteria'],
      bedCapacity: 750,
      icuBeds: 120,
      accreditations: ['JCI', 'NABH', 'NABL'],
      partnershipStatus: 'active',
      partnershipTier: 'enterprise',
      opdCommission: 10,
      ipdCommission: 8,
      surgeryCommission: 6,
      totalLeads: 267,
      totalEarnings: 720000,
      rating: 4.7,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-7',
      name: 'Max Super Speciality Hospital',
      type: 'private',
      category: 'super_specialty',
      phone: '+91-11-26515050',
      email: 'info@maxhealthcare.com',
      website: 'https://www.maxhealthcare.in',
      address: '1, 2, Press Enclave Road, Saket',
      area: 'Saket',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110017',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Cancer Care', 'Liver Transplant'],
      specialties: ['Heart Surgery', 'Brain Surgery', 'Joint Replacement', 'Liver Transplant'],
      facilities: ['24x7 Emergency', 'ICU', 'NICU', 'Pharmacy', 'Cafeteria', 'Parking', 'WiFi'],
      bedCapacity: 500,
      icuBeds: 75,
      accreditations: ['NABH', 'NABL'],
      partnershipStatus: 'active',
      partnershipTier: 'enterprise',
      opdCommission: 10,
      ipdCommission: 8,
      surgeryCommission: 5,
      totalLeads: 234,
      totalEarnings: 580000,
      rating: 4.6,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-8',
      name: 'Sadar District Hospital',
      type: 'government',
      category: 'general',
      phone: '+91-712-2567890',
      email: 'sadar.hospital@maharashtra.gov.in',
      address: 'Civil Lines',
      area: 'Civil Lines',
      city: 'Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '440001',
      departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Orthopedics'],
      specialties: ['General Surgery', 'Emergency Care', 'Maternity Care'],
      facilities: ['Emergency', 'ICU', 'Pharmacy', 'Blood Bank'],
      bedCapacity: 450,
      icuBeds: 40,
      accreditations: ['NABH'],
      partnershipStatus: 'active',
      partnershipTier: 'growth',
      opdCommission: 0,
      ipdCommission: 0,
      surgeryCommission: 0,
      totalLeads: 67,
      totalEarnings: 0,
      rating: 4.0,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-9',
      name: 'Manipal Hospital',
      type: 'private',
      category: 'multi_specialty',
      phone: '+91-80-2502 4444',
      email: 'info@manipalhospitals.com',
      website: 'https://www.manipalhospitals.com',
      address: '98, HAL Airport Road',
      area: 'HAL Airport Road',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560017',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Nephrology', 'Gastroenterology'],
      specialties: ['Heart Surgery', 'Kidney Transplant', 'Liver Transplant', 'Neurosurgery'],
      facilities: ['24x7 Emergency', 'ICU', 'NICU', 'Pharmacy', 'Lab', 'Cafeteria'],
      bedCapacity: 650,
      icuBeds: 90,
      accreditations: ['JCI', 'NABH', 'NABL'],
      partnershipStatus: 'active',
      partnershipTier: 'enterprise',
      opdCommission: 10,
      ipdCommission: 8,
      surgeryCommission: 5,
      totalLeads: 189,
      totalEarnings: 425000,
      rating: 4.5,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    },
    {
      id: 'hd-10',
      name: 'Christian Medical College (CMC)',
      type: 'trust',
      category: 'multi_specialty',
      phone: '+91-416-2220102',
      email: 'info@cmcvellore.ac.in',
      website: 'https://www.cmch-vellore.edu',
      address: 'Ida Scudder Road',
      area: 'Vellore',
      city: 'Vellore',
      district: 'Vellore',
      state: 'Tamil Nadu',
      pincode: '632004',
      departments: ['All Specialties', 'Medical Research', 'Rare Diseases', 'Transplant Surgery'],
      specialties: ['Bone Marrow Transplant', 'Organ Transplant', 'Complex Cardiac Surgery'],
      facilities: ['24x7 Emergency', 'ICU', 'Research Lab', 'Pharmacy', 'Blood Bank'],
      bedCapacity: 2800,
      icuBeds: 250,
      accreditations: ['NAAC A++', 'NABH'],
      partnershipStatus: 'active',
      partnershipTier: 'platinum',
      opdCommission: 5,
      ipdCommission: 5,
      surgeryCommission: 3,
      totalLeads: 145,
      totalEarnings: 180000,
      rating: 4.8,
      isOpen24Hours: true,
      hasEmergency: true,
      hasICU: true,
      isActive: true,
      isVerified: true
    }
  ];
}
