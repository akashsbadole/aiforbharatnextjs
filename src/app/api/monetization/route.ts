import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch monetization data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    // Get earnings dashboard stats
    if (type === 'earnings' && userId) {
      const wallet = await db.userWallet.findUnique({
        where: { userId }
      });

      // Get all referrals/leads
      const leads = await db.hospitalLead.findMany({
        where: { referrerId: userId }
      });

      // Calculate totals
      const leadEarnings = leads.reduce((sum: number, l: any) => sum + (l.commissionEarned || 0), 0);
      const pendingLeads = leads.filter((l: any) => l.status === 'new' || l.status === 'contacted').length;
      const completedLeads = leads.filter((l: any) => l.status === 'completed').length;

      return NextResponse.json({
        success: true,
        wallet: wallet || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0
        },
        stats: {
          totalEarnings: leadEarnings + (wallet?.totalEarned || 0),
          pendingBalance: wallet?.pendingBalance || 0,
          availableBalance: wallet?.availableBalance || 0,
          totalLeads: leads.length,
          pendingLeads,
          completedLeads,
          leadEarnings,
          opdLeads: leads.filter((l: any) => l.leadType === 'opd_consultation').length,
          ipdLeads: leads.filter((l: any) => l.leadType === 'ipd_admission').length,
          surgeryLeads: leads.filter((l: any) => l.leadType === 'surgery').length,
          diagnosticLeads: leads.filter((l: any) => l.leadType === 'diagnostic').length
        },
        recentLeads: leads.slice(0, 10)
      });
    }

    // Get partner hospitals
    if (type === 'hospitals') {
      const hospitals = await db.healthFacility.findMany({
        where: { isOpen: true },
        orderBy: { name: 'asc' }
      });

      const partnerHospitals = hospitals.length > 0 ? hospitals.map((h: any) => ({
        ...h,
        services: h.services ? JSON.parse(h.services) : [],
        partnershipTier: getPartnershipTier(h.type),
        commissionRates: getCommissionRates(h.type),
        leadPricing: getLeadPricing(h.type)
      })) : getMockPartnerHospitals();

      return NextResponse.json({
        success: true,
        hospitals: partnerHospitals
      });
    }

    // Get home visit doctors
    if (type === 'home-visit-doctors') {
      const doctors = await db.homeVisitDoctor.findMany({
        where: { 
          status: 'active',
          isAvailable: true
        },
        orderBy: { rating: 'desc' }
      });

      return NextResponse.json({
        success: true,
        doctors: doctors.length > 0 ? doctors : getMockHomeVisitDoctors()
      });
    }

    // Get medical helpers
    if (type === 'medical-helpers') {
      const helpers = await db.medicalHelper.findMany({
        where: {
          status: 'active',
          isAvailable: true
        },
        orderBy: { rating: 'desc' }
      });

      return NextResponse.json({
        success: true,
        helpers: helpers.length > 0 ? helpers : getMockMedicalHelpers()
      });
    }

    // Get diagnostic labs
    if (type === 'diagnostic-labs') {
      const labs = await db.diagnosticLab.findMany({
        where: {
          status: 'active',
          isOpen: true
        },
        orderBy: { rating: 'desc' }
      });

      return NextResponse.json({
        success: true,
        labs: labs.length > 0 ? labs : getMockDiagnosticLabs()
      });
    }

    // Get health checkup packages
    if (type === 'health-checkups') {
      try {
        const packages = await db.healthCheckupPackage.findMany({
          where: { isActive: true },
          orderBy: { isFeatured: 'desc' }
        });
        return NextResponse.json({
          success: true,
          packages: packages.length > 0 ? packages : getMockHealthCheckupPackages()
        });
      } catch {
        return NextResponse.json({
          success: true,
          packages: getMockHealthCheckupPackages()
        });
      }
    }

    // Get medical equipment
    if (type === 'medical-equipment') {
      try {
        const equipment = await db.medicalEquipment.findMany({
          where: { isActive: true, availableUnits: { gt: 0 } },
          orderBy: { name: 'asc' }
        });
        return NextResponse.json({
          success: true,
          equipment: equipment.length > 0 ? equipment : getMockMedicalEquipment()
        });
      } catch {
        return NextResponse.json({
          success: true,
          equipment: getMockMedicalEquipment()
        });
      }
    }

    // Get all earning methods summary
    if (type === 'earning-methods') {
      return NextResponse.json({
        success: true,
        methods: [
          { id: 'hospital_leads', name: 'Hospital Leads', icon: 'Building2', commission: '5-15%', description: 'Refer patients to partner hospitals' },
          { id: 'home_visits', name: 'Home Visit Doctors', icon: 'Stethoscope', commission: '20%', description: 'Book doctor home visits' },
          { id: 'medical_helpers', name: 'Medical Helpers', icon: 'HandHeart', commission: '20%', description: 'Book nurses, physiotherapists, caregivers' },
          { id: 'diagnostic_labs', name: 'Diagnostic Labs', icon: 'Activity', commission: '15%', description: 'Book lab tests with home collection' },
          { id: 'health_checkups', name: 'Health Checkups', icon: 'Heart', commission: '15%', description: 'Book health checkup packages' },
          { id: 'equipment_rental', name: 'Medical Equipment', icon: 'Wheelchair', commission: '20%', description: 'Rent medical equipment' },
          { id: 'blood_bank', name: 'Blood Bank', icon: 'Droplet', commission: '₹100/unit', description: 'Help arrange blood units' }
        ]
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Monetization fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST - Create bookings and leads
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type } = data;

    // Create Hospital Lead
    if (type === 'hospital_lead') {
      const { hospitalId, hospitalName, referrerId, referrerName, patientName, patientPhone, patientAge, patientGender, leadType, department, estimatedValue } = data;

      const commissionRate = getLeadCommissionRate(leadType);
      const commissionEarned = Math.round((estimatedValue || 500) * commissionRate / 100);
      const platformFee = Math.round(commissionEarned * 0.3);

      const lead = await db.hospitalLead.create({
        data: {
          hospitalId,
          hospitalName,
          referrerId,
          referrerName,
          patientName,
          patientPhone,
          patientAge,
          patientGender,
          leadType,
          department,
          estimatedValue: estimatedValue || 500,
          commissionRate,
          commissionEarned,
          platformFee,
          status: 'new'
        }
      });

      if (referrerId) {
        await updateWallet(referrerId, commissionEarned - platformFee, true);
      }

      return NextResponse.json({
        success: true,
        lead,
        message: `Lead created! You will earn ₹${commissionEarned - platformFee} when patient completes treatment.`
      });
    }

    // Create Home Visit Booking
    if (type === 'home_visit_booking') {
      const { doctorId, userId, patientName, patientPhone, patientAddress, visitType, scheduledDate, scheduledTime, symptoms, consultationFee } = data;

      const platformFee = Math.round((consultationFee || 500) * 0.2);
      const totalAmount = consultationFee || 500;
      const doctorEarning = totalAmount - platformFee;

      const booking = await db.homeVisitBooking.create({
        data: {
          doctorId,
          userId,
          patientName,
          patientPhone,
          patientAddress,
          visitType: visitType || 'general',
          scheduledDate: new Date(scheduledDate),
          scheduledTime,
          symptoms,
          consultationFee: totalAmount,
          platformFee,
          totalAmount,
          doctorEarning,
          platformEarning: platformFee,
          status: 'scheduled'
        }
      });

      return NextResponse.json({
        success: true,
        booking,
        message: `Home visit booked! Total: ₹${totalAmount}`
      });
    }

    // Create Medical Helper Booking
    if (type === 'helper_booking') {
      const { helperId, userId, patientName, patientPhone, patientAddress, serviceType, scheduledDate, scheduledTime, duration, hourlyRate } = data;

      const totalAmount = (hourlyRate || 300) * (duration || 1);
      const platformFee = Math.round(totalAmount * 0.2);
      const helperEarning = totalAmount - platformFee;

      const booking = await db.medicalHelperBooking.create({
        data: {
          helperId,
          userId,
          patientName,
          patientPhone,
          patientAddress,
          serviceType,
          scheduledDate: new Date(scheduledDate),
          scheduledTime,
          duration,
          hourlyRate,
          totalAmount,
          platformFee,
          helperEarning,
          platformEarning: platformFee,
          status: 'scheduled'
        }
      });

      return NextResponse.json({
        success: true,
        booking,
        message: `Helper booked! Total: ₹${totalAmount}`
      });
    }

    // Create Diagnostic Booking
    if (type === 'diagnostic_booking') {
      const { labId, userId, patientName, patientPhone, patientAddress, tests, homeCollection, scheduledDate } = data;

      const testAmount = calculateTestAmount(tests);
      const homeCollectionCharge = homeCollection ? 50 : 0;
      const totalAmount = testAmount + homeCollectionCharge;
      const platformEarning = Math.round(totalAmount * 0.15);
      const labEarning = totalAmount - platformEarning;

      const booking = await db.diagnosticBooking.create({
        data: {
          labId,
          userId,
          patientName,
          patientPhone,
          patientAddress,
          tests: JSON.stringify(tests),
          homeCollection,
          scheduledDate: new Date(scheduledDate),
          testAmount,
          homeCollectionCharge,
          totalAmount,
          labEarning,
          platformEarning,
          status: 'scheduled'
        }
      });

      return NextResponse.json({
        success: true,
        booking,
        message: `Lab test booked! Total: ₹${totalAmount}`
      });
    }

    // Create Health Checkup Booking
    if (type === 'health_checkup_booking') {
      const { packageId, packageName, userId, referrerId, customerName, customerPhone, scheduledDate, homeCollection, address, amount } = data;

      const platformFee = Math.round((amount || 2000) * 0.15);
      const referrerCommission = Math.round((amount || 2000) * 0.05);

      const booking = await db.healthCheckupBooking.create({
        data: {
          packageId,
          packageName,
          userId,
          referrerId,
          customerName,
          customerPhone,
          scheduledDate: new Date(scheduledDate),
          homeCollection: homeCollection || false,
          address,
          amount: amount || 2000,
          referrerCommission,
          platformFee,
          totalAmount: amount || 2000,
          status: 'booked'
        }
      });

      if (referrerId) {
        await updateWallet(referrerId, referrerCommission, true);
      }

      return NextResponse.json({
        success: true,
        booking,
        message: `Health checkup booked! Total: ₹${amount || 2000}`
      });
    }

    // Create Equipment Rental Booking
    if (type === 'equipment_rental') {
      const { equipmentId, equipmentName, userId, referrerId, customerName, customerPhone, deliveryAddress, startDate, endDate, rentalDays, dailyRate, depositAmount } = data;

      const subtotal = (dailyRate || 200) * (rentalDays || 1);
      const totalAmount = subtotal + (depositAmount || 0);
      const platformFee = Math.round(subtotal * 0.2);
      const referrerCommission = Math.round(subtotal * 0.05);

      const booking = await db.equipmentRentalBooking.create({
        data: {
          equipmentId,
          equipmentName,
          userId,
          referrerId,
          customerName,
          customerPhone,
          deliveryAddress,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rentalDays: rentalDays || 1,
          dailyRate: dailyRate || 200,
          subtotal,
          depositAmount: depositAmount || 0,
          totalAmount,
          referrerCommission,
          platformFee,
          status: 'booked'
        }
      });

      if (referrerId) {
        await updateWallet(referrerId, referrerCommission, true);
      }

      return NextResponse.json({
        success: true,
        booking,
        message: `Equipment rental booked! Total: ₹${totalAmount}`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}

// Helper functions
async function updateWallet(userId: string, amount: number, isPending: boolean = false) {
  try {
    const existing = await db.userWallet.findUnique({
      where: { userId }
    });

    if (existing) {
      await db.userWallet.update({
        where: { userId },
        data: {
          pendingBalance: isPending ? { increment: amount } : existing.pendingBalance,
          availableBalance: !isPending ? { increment: amount } : existing.availableBalance,
          totalEarned: { increment: amount }
        }
      });
    } else {
      await db.userWallet.create({
        data: {
          userId,
          pendingBalance: isPending ? amount : 0,
          availableBalance: !isPending ? amount : 0,
          totalEarned: amount
        }
      });
    }
  } catch (error) {
    console.error('Update wallet error:', error);
  }
}

function getPartnershipTier(type: string): string {
  const tiers: Record<string, string> = {
    'Private Hospital': 'Enterprise',
    'District Hospital': 'Growth',
    'CHC': 'Starter',
    'PHC': 'Starter'
  };
  return tiers[type] || 'Starter';
}

function getCommissionRates(type: string): Record<string, number> {
  const rates: Record<string, Record<string, number>> = {
    'Private Hospital': { opd: 10, ipd: 8, surgery: 5, diagnostic: 12 },
    'District Hospital': { opd: 5, ipd: 5, surgery: 3, diagnostic: 8 },
    'CHC': { opd: 5, ipd: 5, surgery: 3, diagnostic: 6 },
    'PHC': { opd: 5, ipd: 5, surgery: 0, diagnostic: 5 }
  };
  return rates[type] || { opd: 5, ipd: 5, surgery: 3, diagnostic: 8 };
}

function getLeadPricing(type: string): Record<string, number> {
  const pricing: Record<string, Record<string, number>> = {
    'Private Hospital': { opd: 100, ipd: 750, surgery: 2500, diagnostic: 150 },
    'District Hospital': { opd: 50, ipd: 400, surgery: 1500, diagnostic: 80 },
    'CHC': { opd: 30, ipd: 250, surgery: 800, diagnostic: 50 },
    'PHC': { opd: 25, ipd: 200, surgery: 0, diagnostic: 40 }
  };
  return pricing[type] || { opd: 50, ipd: 300, surgery: 1000, diagnostic: 75 };
}

function getLeadCommissionRate(leadType: string): number {
  const rates: Record<string, number> = {
    'opd_consultation': 15,
    'ipd_admission': 8,
    'surgery': 5,
    'diagnostic': 12,
    'emergency': 10
  };
  return rates[leadType] || 8;
}

function calculateTestAmount(tests: string[]): number {
  const testPrices: Record<string, number> = {
    'cbc': 200, 'lipid_profile': 500, 'thyroid': 600, 'diabetes': 300,
    'liver_function': 400, 'kidney_function': 450, 'vitamin_d': 800,
    'vitamin_b12': 700, 'iron_studies': 350, 'urine_complete': 150,
    'ecg': 200, 'xray_chest': 250, 'ultrasound': 800
  };
  return tests.reduce((sum, test) => sum + (testPrices[test.toLowerCase()] || 300), 0);
}

function getMockPartnerHospitals() {
  return [
    { id: 'ph-1', name: 'Apollo Hospitals', type: 'Private Hospital', address: 'Jubilee Hills', district: 'Hyderabad', phone: '+91-40-23607777', partnershipTier: 'Enterprise', commissionRates: { opd: 10, ipd: 8, surgery: 5, diagnostic: 12 }, leadPricing: { opd: 100, ipd: 750, surgery: 2500, diagnostic: 150 }, services: ['Cardiology', 'Neurology', 'Orthopedics'], isOpen: true, totalLeads: 234, totalEarnings: 585000 },
    { id: 'ph-2', name: 'Fortis Healthcare', type: 'Private Hospital', address: 'Shalimar Bagh', district: 'Delhi', phone: '+91-11-45302222', partnershipTier: 'Enterprise', commissionRates: { opd: 10, ipd: 8, surgery: 5, diagnostic: 12 }, leadPricing: { opd: 100, ipd: 750, surgery: 2500, diagnostic: 150 }, services: ['Cardiac Surgery', 'Neurosurgery', 'Transplant'], isOpen: true, totalLeads: 189, totalEarnings: 472500 },
    { id: 'ph-3', name: 'Medanta Medicity', type: 'Private Hospital', address: 'Sector 38', district: 'Gurgaon', phone: '+91-124-4141414', partnershipTier: 'Enterprise', commissionRates: { opd: 10, ipd: 8, surgery: 5, diagnostic: 12 }, leadPricing: { opd: 100, ipd: 750, surgery: 2500, diagnostic: 150 }, services: ['Multi-organ Transplant', 'Cardiac Sciences', 'Oncology'], isOpen: true, totalLeads: 312, totalEarnings: 780000 },
    { id: 'ph-4', name: 'Sadar District Hospital', type: 'District Hospital', address: 'Civil Lines', district: 'Nagpur', phone: '+91-712-2567890', partnershipTier: 'Growth', commissionRates: { opd: 5, ipd: 5, surgery: 3, diagnostic: 8 }, leadPricing: { opd: 50, ipd: 400, surgery: 1500, diagnostic: 80 }, services: ['General Medicine', 'Surgery', 'Pediatrics'], isOpen: true, totalLeads: 67, totalEarnings: 26800 },
    { id: 'ph-5', name: 'Community Health Center', type: 'CHC', address: 'Block Road', district: 'Raipur', phone: '+91-771-2456789', partnershipTier: 'Starter', commissionRates: { opd: 5, ipd: 5, surgery: 3, diagnostic: 6 }, leadPricing: { opd: 30, ipd: 250, surgery: 800, diagnostic: 50 }, services: ['Primary Care', 'Maternity', 'Emergency'], isOpen: true, totalLeads: 45, totalEarnings: 13500 }
  ];
}

function getMockHomeVisitDoctors() {
  return [
    { id: 'hvd-1', name: 'Dr. Rajesh Kumar', phone: '+91-9876543210', specialization: 'General Medicine', qualifications: 'MBBS, MD', consultationFee: 700, emergencyFee: 1500, city: 'Hyderabad', rating: 4.8, totalVisits: 156, isAvailable: true, platformCommission: 20 },
    { id: 'hvd-2', name: 'Dr. Priya Sharma', phone: '+91-9876543211', specialization: 'Pediatrics', qualifications: 'MBBS, DCH', consultationFee: 800, emergencyFee: 1800, city: 'Delhi', rating: 4.9, totalVisits: 89, isAvailable: true, platformCommission: 20 },
    { id: 'hvd-3', name: 'Dr. Amit Verma', phone: '+91-9876543212', specialization: 'Orthopedics', qualifications: 'MBBS, MS Ortho', consultationFee: 1000, emergencyFee: 2500, city: 'Mumbai', rating: 4.7, totalVisits: 234, isAvailable: true, platformCommission: 20 }
  ];
}

function getMockMedicalHelpers() {
  return [
    { id: 'mh-1', name: 'Sunita Devi', phone: '+91-9876543220', helperType: 'nurse', qualifications: 'GNM Nursing', services: ['Injection', 'Wound Dressing', 'Vital Check'], hourlyRate: 350, dailyRate: 2500, city: 'Hyderabad', rating: 4.8, totalServices: 189, isAvailable: true, platformCommission: 20 },
    { id: 'mh-2', name: 'Ramesh Kumar', phone: '+91-9876543221', helperType: 'physiotherapist', qualifications: 'BPT, MPT', services: ['Exercise Therapy', 'Massage', 'Rehab'], hourlyRate: 500, dailyRate: 3500, city: 'Delhi', rating: 4.9, totalServices: 145, isAvailable: true, platformCommission: 20 },
    { id: 'mh-3', name: 'Kamla Bai', phone: '+91-9876543222', helperType: 'caregiver', qualifications: 'Certified Caregiver', services: ['Elder Care', 'Post-Op Care', 'Personal Care'], hourlyRate: 250, dailyRate: 1800, city: 'Mumbai', rating: 4.7, totalServices: 267, isAvailable: true, platformCommission: 20 }
  ];
}

function getMockDiagnosticLabs() {
  return [
    { id: 'dl-1', name: 'Dr. Lal PathLabs', phone: '+91-9876543230', address: 'Sector 18, Noida', city: 'Noida', tests: ['CBC', 'Lipid Profile', 'Thyroid', 'Diabetes'], homeCollection: true, homeCollectionCharge: 50, rating: 4.8, totalBookings: 1250, nablAccredited: true, platformCommission: 15 },
    { id: 'dl-2', name: 'Thyrocare Technologies', phone: '+91-9876543231', address: 'Turbhe, Navi Mumbai', city: 'Mumbai', tests: ['Thyroid Profile', 'Diabetes Panel', 'Heart Health'], homeCollection: true, homeCollectionCharge: 0, rating: 4.7, totalBookings: 2100, nablAccredited: true, platformCommission: 15 },
    { id: 'dl-3', name: 'Metropolis Healthcare', phone: '+91-9876543232', address: 'Kurla West, Mumbai', city: 'Mumbai', tests: ['Full Body Checkup', 'Diabetes Care', 'Cancer Screening'], homeCollection: true, homeCollectionCharge: 75, rating: 4.9, totalBookings: 890, nablAccredited: true, platformCommission: 15 }
  ];
}

function getMockHealthCheckupPackages() {
  return [
    { id: 'hcp-1', name: 'Basic Health Checkup', description: 'Essential health screening', tests: ['CBC', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function'], mrp: 2500, discountedPrice: 1999, category: 'basic', targetGroup: 'adults', totalBookings: 1250, rating: 4.6, isFeatured: false },
    { id: 'hcp-2', name: 'Comprehensive Health Package', description: 'Complete body checkup with 60+ tests', tests: ['CBC', 'Lipid Profile', 'Thyroid', 'Diabetes Panel', 'Liver Function', 'Kidney Function', 'Vitamin D', 'Vitamin B12', 'Iron Studies', 'Urine Complete'], mrp: 5500, discountedPrice: 3999, category: 'comprehensive', targetGroup: 'adults', totalBookings: 890, rating: 4.8, isFeatured: true },
    { id: 'hcp-3', name: 'Executive Health Package', description: 'Premium screening for executives', tests: ['All Comprehensive Tests', 'ECG', 'Chest X-Ray', 'Ultrasound Abdomen', 'TMT', 'PFT'], mrp: 12000, discountedPrice: 8999, category: 'executive', targetGroup: 'corporate', totalBookings: 456, rating: 4.9, isFeatured: true },
    { id: 'hcp-4', name: 'Senior Citizen Package', description: 'Health checkup for 60+', tests: ['CBC', 'Lipid Profile', 'Diabetes Panel', 'Kidney Function', 'Liver Function', 'Thyroid', 'ECG', 'Chest X-Ray', 'Bone Density'], mrp: 8000, discountedPrice: 5999, category: 'comprehensive', targetGroup: 'senior', totalBookings: 678, rating: 4.7, isFeatured: false },
    { id: 'hcp-5', name: 'Women\'s Health Package', description: 'Complete women health screening', tests: ['CBC', 'Thyroid', 'Iron Studies', 'Vitamin D', 'Vitamin B12', 'Pap Smear', 'Mammography', 'Pelvic Ultrasound'], mrp: 7500, discountedPrice: 5499, category: 'comprehensive', targetGroup: 'women', totalBookings: 345, rating: 4.8, isFeatured: true },
    { id: 'hcp-6', name: 'Cardiac Health Package', description: 'Heart health screening', tests: ['Lipid Profile', 'ECG', 'Echo', 'TMT', 'Troponin', 'BNP', 'Homocysteine'], mrp: 6000, discountedPrice: 4499, category: 'specialty', targetGroup: 'adults', totalBookings: 234, rating: 4.7, isFeatured: false }
  ];
}

function getMockMedicalEquipment() {
  return [
    { id: 'me-1', name: 'Wheelchair', category: 'mobility', description: 'Standard wheelchair with brakes', dailyRate: 150, weeklyRate: 900, monthlyRate: 3000, depositAmount: 1000, totalUnits: 20, availableUnits: 15, providerName: 'MedEquip Solutions' },
    { id: 'me-2', name: 'Oxygen Concentrator', category: 'respiratory', description: '5L oxygen concentrator', dailyRate: 500, weeklyRate: 3000, monthlyRate: 10000, depositAmount: 5000, totalUnits: 10, availableUnits: 6, providerName: 'HealthCare Rentals' },
    { id: 'me-3', name: 'Hospital Bed', category: 'hospital_bed', description: 'Electric adjustable hospital bed', dailyRate: 300, weeklyRate: 1800, monthlyRate: 6000, depositAmount: 3000, totalUnits: 15, availableUnits: 10, providerName: 'MedEquip Solutions' },
    { id: 'me-4', name: 'BP Monitor', category: 'monitoring', description: 'Digital blood pressure monitor', dailyRate: 50, weeklyRate: 250, monthlyRate: 800, depositAmount: 500, totalUnits: 50, availableUnits: 35, providerName: 'Home Health Devices' },
    { id: 'me-5', name: 'Nebulizer', category: 'respiratory', description: 'Compressor nebulizer machine', dailyRate: 75, weeklyRate: 400, monthlyRate: 1200, depositAmount: 500, totalUnits: 30, availableUnits: 22, providerName: 'HealthCare Rentals' },
    { id: 'me-6', name: 'Walker', category: 'mobility', description: 'Adjustable walking frame', dailyRate: 50, weeklyRate: 250, monthlyRate: 800, depositAmount: 300, totalUnits: 25, availableUnits: 18, providerName: 'MedEquip Solutions' },
    { id: 'me-7', name: 'TENS Machine', category: 'therapy', description: 'Pain relief therapy device', dailyRate: 100, weeklyRate: 500, monthlyRate: 1500, depositAmount: 800, totalUnits: 20, availableUnits: 15, providerName: 'Physio Equipment Co' },
    { id: 'me-8', name: 'Commode Chair', category: 'mobility', description: 'Portable commode chair', dailyRate: 75, weeklyRate: 400, monthlyRate: 1200, depositAmount: 500, totalUnits: 15, availableUnits: 12, providerName: 'MedEquip Solutions' }
  ];
}
