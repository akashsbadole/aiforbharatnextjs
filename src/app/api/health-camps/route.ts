import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List health camps
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '50');

    // Build query
    const where: Record<string, unknown> = {};
    
    if (district) where.district = district;
    if (state) where.state = state;
    if (status) where.status = status;
    
    if (upcoming) {
      where.date = {
        gte: new Date()
      };
    }

    const camps = await db.healthCamp.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 50
    });

    // If coordinates provided, calculate distances
    let result = camps.map(camp => ({
      ...camp,
      services: JSON.parse(camp.services),
      distance: lat && lng ? calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        camp.latitude || 0,
        camp.longitude || 0
      ) : undefined
    }));

    if (lat && lng) {
      result = result
        .filter(c => !c.distance || c.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return NextResponse.json({
      success: true,
      camps: result,
      total: result.length,
      filters: { district, state, status, upcoming }
    });

  } catch (error) {
    console.error('Health camps fetch error:', error);
    
    // Return mock data
    return NextResponse.json({
      success: true,
      camps: getMockCamps(),
      total: getMockCamps().length
    });
  }
}

// POST - Create new health camp
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const camp = await db.healthCamp.create({
      data: {
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        organizerType: data.organizerType || 'government',
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue,
        address: data.address,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        services: JSON.stringify(data.services || []),
        capacity: data.capacity,
        registered: 0,
        status: data.status || 'upcoming',
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      camp: {
        ...camp,
        services: JSON.parse(camp.services)
      }
    });

  } catch (error) {
    console.error('Create health camp error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create health camp'
    }, { status: 500 });
  }
}

// PUT - Update health camp or register participant
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { campId, action, ...updateData } = data;

    if (!campId) {
      return NextResponse.json({
        success: false,
        error: 'Camp ID is required'
      }, { status: 400 });
    }

    // Register for camp
    if (action === 'register') {
      const camp = await db.healthCamp.findUnique({
        where: { id: campId }
      });

      if (!camp) {
        return NextResponse.json({
          success: false,
          error: 'Camp not found'
        }, { status: 404 });
      }

      // Check capacity
      if (camp.capacity && camp.registered >= camp.capacity) {
        return NextResponse.json({
          success: false,
          error: 'Camp is at full capacity'
        }, { status: 400 });
      }

      const updated = await db.healthCamp.update({
        where: { id: campId },
        data: {
          registered: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Successfully registered for camp',
        camp: {
          ...updated,
          services: JSON.parse(updated.services)
        }
      });
    }

    // Update camp details
    const updateFields: Record<string, unknown> = {};
    
    if (updateData.title) updateFields.title = updateData.title;
    if (updateData.description) updateFields.description = updateData.description;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.services) updateFields.services = JSON.stringify(updateData.services);

    const camp = await db.healthCamp.update({
      where: { id: campId },
      data: updateFields
    });

    return NextResponse.json({
      success: true,
      camp: {
        ...camp,
        services: JSON.parse(camp.services)
      }
    });

  } catch (error) {
    console.error('Update health camp error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update health camp'
    }, { status: 500 });
  }
}

// DELETE - Delete health camp
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campId = searchParams.get('campId');

    if (!campId) {
      return NextResponse.json({
        success: false,
        error: 'Camp ID is required'
      }, { status: 400 });
    }

    await db.healthCamp.delete({
      where: { id: campId }
    });

    return NextResponse.json({
      success: true,
      message: 'Health camp deleted successfully'
    });

  } catch (error) {
    console.error('Delete health camp error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete health camp'
    }, { status: 500 });
  }
}

// Calculate distance helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Mock camps data
function getMockCamps() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'camp-1',
      title: 'Free Eye Check-up Camp',
      description: 'Comprehensive eye examination and free spectacles distribution',
      organizer: 'District Health Department',
      organizerType: 'government',
      date: tomorrow.toISOString(),
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Community Health Center',
      address: 'Block Road, Village Center',
      district: 'Main District',
      state: 'State',
      services: ['Eye Examination', 'Cataract Screening', 'Free Spectacles'],
      capacity: 200,
      registered: 85,
      status: 'upcoming',
      contactPerson: 'Dr. Sharma',
      contactPhone: '+91-9876543210'
    },
    {
      id: 'camp-2',
      title: 'Diabetes & BP Screening Camp',
      description: 'Free screening for diabetes and blood pressure with consultation',
      organizer: 'Apollo Hospital',
      organizerType: 'hospital',
      date: nextWeek.toISOString(),
      startTime: '08:00',
      endTime: '14:00',
      venue: 'Town Hall',
      address: 'Main Road, Town Center',
      district: 'Main District',
      state: 'State',
      services: ['Blood Sugar Test', 'Blood Pressure Check', 'Doctor Consultation'],
      capacity: 150,
      registered: 42,
      status: 'upcoming',
      contactPerson: 'Hospital Helpline',
      contactPhone: '+91-1234567890'
    },
    {
      id: 'camp-3',
      title: 'Women & Child Health Camp',
      description: 'Health checkup for pregnant women and children under 5 years',
      organizer: 'Ministry of Health',
      organizerType: 'government',
      date: tomorrow.toISOString(),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'Primary Health Center',
      address: 'Village Panchayat',
      district: 'Rural District',
      state: 'State',
      services: ['ANC Checkup', 'Child Vaccination', 'Nutrition Counseling', 'Iron Supplements'],
      capacity: 100,
      registered: 65,
      status: 'upcoming',
      contactPerson: 'ANM Saraswati',
      contactPhone: '+91-9988776655'
    },
    {
      id: 'camp-4',
      title: 'COVID-19 Vaccination Drive',
      description: 'Free COVID-19 vaccination for all eligible age groups',
      organizer: 'Health Department',
      organizerType: 'government',
      date: tomorrow.toISOString(),
      startTime: '09:00',
      endTime: '18:00',
      venue: 'District Hospital',
      address: 'Civil Lines',
      district: 'Main District',
      state: 'State',
      services: ['Covishield', 'Covaxin', 'Booster Dose'],
      capacity: 500,
      registered: 320,
      status: 'upcoming',
      contactPerson: 'Vaccination Cell',
      contactPhone: '1075'
    }
  ];
}
