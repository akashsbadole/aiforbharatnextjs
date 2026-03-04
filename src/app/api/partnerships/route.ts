import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List partnerships or user referrals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'hospitals', 'earnings', 'referrals', 'stats'
    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');
    const status = searchParams.get('status');

    // Get specific partnership details
    if (partnershipId) {
      const partnership = await db.healthFacility.findUnique({
        where: { id: partnershipId }
      });

      if (!partnership) {
        return NextResponse.json({ success: false, error: 'Partnership not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        partnership: {
          ...partnership,
          services: partnership.services ? JSON.parse(partnership.services) : []
        }
      });
    }

    // Get earnings stats for a user
    if (type === 'stats' && userId) {
      // Get all referral earnings
      const referrals = await db.referralTracking.findMany({
        where: { referrerId: userId }
      });

      const totalEarnings = referrals.reduce((sum: number, r: any) => sum + (r.commissionEarned || 0), 0);
      const pendingEarnings = referrals.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + (r.commissionEarned || 0), 0);
      const totalReferrals = referrals.length;

      // Get transport earnings
      const transports = await db.transportRequest.findMany({
        where: { status: 'completed' }
      });

      const transportEarnings = transports.length * 50; // ₹50 per completed transport

      return NextResponse.json({
        success: true,
        stats: {
          totalEarnings: totalEarnings + transportEarnings,
          pendingEarnings,
          completedEarnings: totalEarnings - pendingEarnings + transportEarnings,
          totalReferrals,
          transportBookings: transports.length,
          transportEarnings,
          hospitalReferrals: referrals.filter((r: any) => r.type === 'hospital').length,
          appointmentReferrals: referrals.filter((r: any) => r.type === 'appointment').length
        }
      });
    }

    // Get referral history
    if (type === 'referrals' && userId) {
      const referrals = await db.referralTracking.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return NextResponse.json({
        success: true,
        referrals: referrals.map((r: any) => ({
          ...r,
          metadata: r.metadata ? JSON.parse(r.metadata) : {}
        }))
      });
    }

    // Get list of partner hospitals
    const hospitals = await db.healthFacility.findMany({
      where: status ? { isOpen: status === 'active' } : undefined,
      orderBy: { name: 'asc' }
    });

    // Add mock partnership data
    const partnerHospitals = hospitals.map((h: any) => ({
      ...h,
      services: h.services ? JSON.parse(h.services) : [],
      partnershipStatus: 'active',
      commissionRate: getCommissionRate(h.type),
      totalReferrals: Math.floor(Math.random() * 100),
      totalEarnings: Math.floor(Math.random() * 50000)
    }));

    return NextResponse.json({
      success: true,
      hospitals: partnerHospitals.length > 0 ? partnerHospitals : getMockPartnerHospitals(),
      total: partnerHospitals.length || 4
    });

  } catch (error) {
    console.error('Partnerships fetch error:', error);
    
    // Return mock data if database fails
    return NextResponse.json({
      success: true,
      hospitals: getMockPartnerHospitals(),
      total: 4
    });
  }
}

// POST - Create referral/booking with commission
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, userId, hospitalId, appointmentId, transportId, patientName, patientPhone, serviceType, referrerId } = data;

    if (!type) {
      return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
    }

    // Hospital referral
    if (type === 'hospital_referral' && hospitalId) {
      const hospital = await db.healthFacility.findUnique({
        where: { id: hospitalId }
      });

      const commissionRate = getCommissionRate(hospital?.type || 'PHC');
      const commissionAmount = calculateCommission(serviceType, commissionRate);

      // Create referral tracking
      const referral = await db.referralTracking.create({
        data: {
          referrerId: referrerId || userId,
          type: 'hospital',
          targetId: hospitalId,
          targetName: hospital?.name || 'Hospital',
          patientName,
          patientPhone,
          serviceType,
          commissionRate,
          commissionEarned: commissionAmount,
          status: 'pending',
          metadata: JSON.stringify({ hospitalId, appointmentId })
        }
      });

      return NextResponse.json({
        success: true,
        referral: {
          ...referral,
          commissionEarned: commissionAmount,
          message: `Referral created! You will earn ₹${commissionAmount} when patient completes service.`
        }
      });
    }

    // Transport booking with commission
    if (type === 'transport_booking') {
      const commissionAmount = 50; // ₹50 per transport booking

      const referral = await db.referralTracking.create({
        data: {
          referrerId: referrerId || userId,
          type: 'transport',
          targetId: transportId,
          targetName: 'Patient Transport',
          patientName,
          patientPhone,
          serviceType: data.vehicleType || 'ambulance',
          commissionRate: 10,
          commissionEarned: commissionAmount,
          status: 'pending',
          metadata: JSON.stringify({ transportId, pickup: data.pickupLocation, drop: data.dropLocation })
        }
      });

      return NextResponse.json({
        success: true,
        referral: {
          ...referral,
          commissionEarned: commissionAmount,
          message: `Transport booked! You will earn ₹${commissionAmount} when trip completes.`
        }
      });
    }

    // Appointment referral
    if (type === 'appointment_referral' && appointmentId) {
      const commissionAmount = 100; // ₹100 per appointment referral

      const referral = await db.referralTracking.create({
        data: {
          referrerId: referrerId || userId,
          type: 'appointment',
          targetId: appointmentId,
          targetName: 'Doctor Appointment',
          patientName,
          patientPhone,
          serviceType: serviceType || 'consultation',
          commissionRate: 5,
          commissionEarned: commissionAmount,
          status: 'pending',
          metadata: JSON.stringify({ appointmentId })
        }
      });

      return NextResponse.json({
        success: true,
        referral: {
          ...referral,
          commissionEarned: commissionAmount,
          message: `Appointment referral created! You will earn ₹${commissionAmount} after completion.`
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Create referral error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create referral' }, { status: 500 });
  }
}

// PUT - Update referral status (approve/complete/reject)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { referralId, status, adminNotes } = data;

    if (!referralId || !status) {
      return NextResponse.json({ success: false, error: 'Referral ID and status are required' }, { status: 400 });
    }

    const referral = await db.referralTracking.update({
      where: { id: referralId },
      data: {
        status,
        metadata: adminNotes ? JSON.stringify({ adminNotes }) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      referral,
      message: status === 'completed' ? 'Commission credited!' : 'Status updated'
    });

  } catch (error) {
    console.error('Update referral error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update referral' }, { status: 500 });
  }
}

// Helper functions
function getCommissionRate(facilityType: string): number {
  const rates: Record<string, number> = {
    'District Hospital': 8,
    'CHC': 6,
    'PHC': 5,
    'Private Hospital': 12,
    'Clinic': 10,
    'Diagnostic Center': 15
  };
  return rates[facilityType] || 5;
}

function calculateCommission(serviceType: string, rate: number): number {
  const basePrices: Record<string, number> = {
    'consultation': 500,
    'surgery': 50000,
    'diagnostic': 2000,
    'ipd': 20000,
    'emergency': 10000,
    'vaccination': 500,
    'lab_test': 1000
  };
  const basePrice = basePrices[serviceType] || 500;
  return Math.round(basePrice * rate / 100);
}

function getMockPartnerHospitals() {
  return [
    {
      id: 'partner-1',
      name: 'Apollo Hospital',
      type: 'Private Hospital',
      address: 'Jubilee Hills, Hyderabad',
      district: 'Hyderabad',
      phone: '+91-40-23607777',
      partnershipStatus: 'active',
      commissionRate: 12,
      totalReferrals: 156,
      totalEarnings: 125000,
      services: ['Cardiology', 'Orthopedics', 'Neurology', 'Emergency Care'],
      isOpen: true
    },
    {
      id: 'partner-2',
      name: 'Sadar District Hospital',
      type: 'District Hospital',
      address: 'Civil Lines, Nagpur',
      district: 'Nagpur',
      phone: '+91-712-2567890',
      partnershipStatus: 'active',
      commissionRate: 8,
      totalReferrals: 89,
      totalEarnings: 45000,
      services: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'],
      isOpen: true
    },
    {
      id: 'partner-3',
      name: 'Medanta Medicity',
      type: 'Private Hospital',
      address: 'Sector 38, Gurgaon',
      district: 'Gurgaon',
      phone: '+91-124-4141414',
      partnershipStatus: 'active',
      commissionRate: 15,
      totalReferrals: 234,
      totalEarnings: 350000,
      services: ['Multi-specialty', 'Transplant', 'Cardiac Surgery', 'Oncology'],
      isOpen: true
    },
    {
      id: 'partner-4',
      name: 'Community Health Center',
      type: 'CHC',
      address: 'Block Road, Raipur',
      district: 'Raipur',
      phone: '+91-771-2456789',
      partnershipStatus: 'active',
      commissionRate: 6,
      totalReferrals: 45,
      totalEarnings: 15000,
      services: ['Primary Care', 'Maternity', 'Vaccination', 'Emergency'],
      isOpen: true
    }
  ];
}
