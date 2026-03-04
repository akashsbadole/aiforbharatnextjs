import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all doctors with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');
    const isAvailableOnline = searchParams.get('online');
    const search = searchParams.get('search');
    const doctorId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // If specific doctor ID requested
    if (doctorId) {
      const doctor = await db.doctor.findUnique({
        where: { id: doctorId },
        include: {
          schedules: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
          leaves: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 5 }
        }
      });
      
      if (!doctor) {
        return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, doctor });
    }
    
    const where: Record<string, unknown> = { status: { in: ['active', 'on_leave'] } };
    
    if (specialization) {
      where.specialization = { contains: specialization };
    }
    if (isAvailableOnline === 'true') {
      where.isAvailableOnline = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { specialization: { contains: search } },
        { facilityName: { contains: search } }
      ];
    }
    
    const doctors = await db.doctor.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { totalConsultations: 'desc' }
      ],
      take: limit
    });
    
    // Mock data if empty
    const result = doctors.length > 0 ? doctors : getMockDoctors();
    
    // Get unique specializations for filter
    const specializations = [...new Set(result.map(d => d.specialization))];
    
    return NextResponse.json({ 
      success: true, 
      doctors: result,
      specializations,
      total: result.length 
    });
    
  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

// POST - Create new doctor (admin only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      name, phone, email, specialization, qualifications, 
      consultationFee, videoConsultFee, followUpFee,
      languages, yearsOfExperience, registrationNumber,
      registrationCouncil, facilityId, facilityName, bio,
      gender, dateOfBirth, isAvailableOnline, isAvailableInPerson,
      slotDuration, bufferTime, maxDailyAppointments
    } = data;
    
    if (!name || !phone || !specialization) {
      return NextResponse.json({ success: false, error: 'Name, phone, and specialization are required' }, { status: 400 });
    }
    
    const doctor = await db.doctor.create({
      data: {
        name,
        phone,
        email,
        specialization,
        qualifications: qualifications ? JSON.stringify(qualifications) : '[]',
        consultationFee: consultationFee || 0,
        videoConsultFee: videoConsultFee || null,
        followUpFee: followUpFee || null,
        languages: languages ? JSON.stringify(languages) : '[]',
        yearsOfExperience: yearsOfExperience || 0,
        registrationNumber,
        registrationCouncil,
        facilityId,
        facilityName,
        bio,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        isAvailableOnline: isAvailableOnline ?? false,
        isAvailableInPerson: isAvailableInPerson ?? true,
        slotDuration: slotDuration || 15,
        bufferTime: bufferTime || 5,
        maxDailyAppointments,
        availability: '{}'
      }
    });
    
    return NextResponse.json({ success: true, doctor });
    
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create doctor' }, { status: 500 });
  }
}

// PUT - Update doctor
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Doctor ID required' }, { status: 400 });
    }
    
    // Handle JSON fields
    if (updateData.qualifications && Array.isArray(updateData.qualifications)) {
      updateData.qualifications = JSON.stringify(updateData.qualifications);
    }
    if (updateData.languages && Array.isArray(updateData.languages)) {
      updateData.languages = JSON.stringify(updateData.languages);
    }
    if (updateData.availability && typeof updateData.availability === 'object') {
      updateData.availability = JSON.stringify(updateData.availability);
    }
    if (updateData.documents && Array.isArray(updateData.documents)) {
      updateData.documents = JSON.stringify(updateData.documents);
    }
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    const doctor = await db.doctor.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, doctor });
    
  } catch (error) {
    console.error('Update doctor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update doctor' }, { status: 500 });
  }
}

// DELETE - Delete doctor (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Doctor ID required' }, { status: 400 });
    }
    
    // Soft delete - set status to inactive
    await db.doctor.update({
      where: { id },
      data: { status: 'inactive' }
    });
    
    return NextResponse.json({ success: true, message: 'Doctor deactivated' });
    
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete doctor' }, { status: 500 });
  }
}

// Mock doctors data
function getMockDoctors() {
  return [
    {
      id: 'doc_001',
      name: 'Dr. Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh.kumar@hospital.com',
      specialization: 'General Medicine',
      qualifications: '["MBBS", "MD"]',
      yearsOfExperience: 15,
      consultationFee: 300,
      videoConsultFee: 500,
      followUpFee: 200,
      facilityName: 'City Hospital',
      isAvailableOnline: true,
      isAvailableInPerson: true,
      slotDuration: 15,
      bufferTime: 5,
      rating: 4.8,
      totalReviews: 234,
      totalConsultations: 1250,
      totalPatients: 890,
      thisMonthConsultations: 45,
      isVerified: true,
      languages: '["Hindi", "English"]',
      bio: 'Experienced physician specializing in primary care and preventive medicine.',
      availability: '{"monday":{"start":"09:00","end":"17:00"},"tuesday":{"start":"09:00","end":"17:00"},"wednesday":{"start":"09:00","end":"17:00"},"thursday":{"start":"09:00","end":"17:00"},"friday":{"start":"09:00","end":"17:00"},"saturday":{"start":"09:00","end":"13:00"}}',
      status: 'active'
    },
    {
      id: 'doc_002',
      name: 'Dr. Priya Sharma',
      phone: '9876543211',
      email: 'priya.sharma@hospital.com',
      specialization: 'Pediatrics',
      qualifications: '["MBBS", "MD Pediatrics"]',
      yearsOfExperience: 10,
      consultationFee: 400,
      videoConsultFee: 600,
      followUpFee: 250,
      facilityName: 'Children Care Hospital',
      isAvailableOnline: true,
      isAvailableInPerson: true,
      slotDuration: 20,
      bufferTime: 5,
      rating: 4.9,
      totalReviews: 189,
      totalConsultations: 890,
      totalPatients: 650,
      thisMonthConsultations: 38,
      isVerified: true,
      languages: '["Hindi", "English"]',
      bio: 'Specialized in child healthcare with expertise in developmental disorders.',
      availability: '{"monday":{"start":"10:00","end":"18:00"},"tuesday":{"start":"10:00","end":"18:00"},"wednesday":{"start":"10:00","end":"18:00"},"thursday":{"start":"10:00","end":"18:00"},"friday":{"start":"10:00","end":"18:00"}}',
      status: 'active'
    },
    {
      id: 'doc_003',
      name: 'Dr. Amit Verma',
      phone: '9876543212',
      email: 'amit.verma@hospital.com',
      specialization: 'Cardiology',
      qualifications: '["MBBS", "MD", "DM Cardiology"]',
      yearsOfExperience: 20,
      consultationFee: 800,
      videoConsultFee: 1000,
      followUpFee: 500,
      facilityName: 'Heart Care Center',
      isAvailableOnline: true,
      isAvailableInPerson: true,
      slotDuration: 20,
      bufferTime: 10,
      rating: 4.7,
      totalReviews: 312,
      totalConsultations: 2100,
      totalPatients: 1200,
      thisMonthConsultations: 62,
      isVerified: true,
      languages: '["Hindi", "English"]',
      bio: 'Expert cardiologist with 20 years of experience in interventional cardiology.',
      availability: '{"monday":{"start":"09:00","end":"16:00"},"wednesday":{"start":"09:00","end":"16:00"},"friday":{"start":"09:00","end":"16:00"}}',
      status: 'active'
    },
    {
      id: 'doc_004',
      name: 'Dr. Sunita Patel',
      phone: '9876543213',
      email: 'sunita.patel@hospital.com',
      specialization: 'Gynecology',
      qualifications: '["MBBS", "MS OB-GYN"]',
      yearsOfExperience: 12,
      consultationFee: 500,
      videoConsultFee: 700,
      followUpFee: 300,
      facilityName: 'Women Wellness Center',
      isAvailableOnline: true,
      isAvailableInPerson: true,
      slotDuration: 15,
      bufferTime: 5,
      rating: 4.9,
      totalReviews: 456,
      totalConsultations: 1800,
      totalPatients: 1100,
      thisMonthConsultations: 55,
      isVerified: true,
      languages: '["Hindi", "English", "Gujarati"]',
      bio: 'Specialized in women health, pregnancy care, and reproductive medicine.',
      availability: '{"monday":{"start":"09:00","end":"17:00"},"tuesday":{"start":"09:00","end":"17:00"},"thursday":{"start":"09:00","end":"17:00"},"saturday":{"start":"09:00","end":"13:00"}}',
      status: 'active'
    },
    {
      id: 'doc_005',
      name: 'Dr. Mohammed Khan',
      phone: '9876543214',
      email: 'm.khan@hospital.com',
      specialization: 'Orthopedics',
      qualifications: '["MBBS", "MS Orthopedics"]',
      yearsOfExperience: 18,
      consultationFee: 600,
      videoConsultFee: 800,
      followUpFee: 400,
      facilityName: 'Bone & Joint Hospital',
      isAvailableOnline: false,
      isAvailableInPerson: true,
      slotDuration: 15,
      bufferTime: 5,
      rating: 4.6,
      totalReviews: 178,
      totalConsultations: 950,
      totalPatients: 720,
      thisMonthConsultations: 28,
      isVerified: true,
      languages: '["Hindi", "English", "Urdu"]',
      bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
      availability: '{"monday":{"start":"10:00","end":"17:00"},"wednesday":{"start":"10:00","end":"17:00"},"friday":{"start":"10:00","end":"17:00"}}',
      status: 'active'
    },
    {
      id: 'doc_006',
      name: 'Dr. Anjali Reddy',
      phone: '9876543215',
      email: 'anjali.reddy@hospital.com',
      specialization: 'Dermatology',
      qualifications: '["MBBS", "MD Dermatology"]',
      yearsOfExperience: 8,
      consultationFee: 500,
      videoConsultFee: 700,
      followUpFee: 300,
      facilityName: 'Skin Care Clinic',
      isAvailableOnline: true,
      isAvailableInPerson: true,
      slotDuration: 15,
      bufferTime: 5,
      rating: 4.8,
      totalReviews: 267,
      totalConsultations: 1100,
      totalPatients: 850,
      thisMonthConsultations: 42,
      isVerified: true,
      languages: '["Hindi", "English", "Telugu"]',
      bio: 'Dermatologist with expertise in cosmetic procedures and skin disorders.',
      availability: '{"tuesday":{"start":"09:00","end":"17:00"},"thursday":{"start":"09:00","end":"17:00"},"saturday":{"start":"09:00","end":"15:00"}}',
      status: 'active'
    }
  ];
}
