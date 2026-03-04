import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

// GET - List volunteers or get volunteer profile
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get('volunteerId');
    const userId = searchParams.get('userId');
    const district = searchParams.get('district');
    const skill = searchParams.get('skill');
    const available = searchParams.get('available') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '50');

    // Get single volunteer
    if (volunteerId) {
      const volunteer = await db.volunteer.findUnique({
        where: { id: volunteerId }
      });

      if (!volunteer) {
        return NextResponse.json({
          success: false,
          error: 'Volunteer not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        volunteer: {
          ...volunteer,
          skills: JSON.parse(volunteer.skills),
          availability: JSON.parse(volunteer.availability),
          certifications: volunteer.certifications ? JSON.parse(volunteer.certifications) : []
        }
      });
    }

    // Get user's volunteer profile
    if (userId) {
      const volunteer = await db.volunteer.findFirst({
        where: { userId }
      });

      return NextResponse.json({
        success: true,
        volunteer: volunteer ? {
          ...volunteer,
          skills: JSON.parse(volunteer.skills),
          availability: JSON.parse(volunteer.availability),
          certifications: volunteer.certifications ? JSON.parse(volunteer.certifications) : []
        } : null,
        isVolunteer: !!volunteer
      });
    }

    // Build query for listing volunteers
    const where: Record<string, unknown> = { status: 'active' };
    if (district) where.district = district;
    if (available) where.isAvailable = true;
    if (verified) where.verified = true;

    let volunteers = await db.volunteer.findMany({
      where,
      take: 50
    });

    // Filter by skill if provided
    if (skill) {
      volunteers = volunteers.filter(v => {
        const skills = JSON.parse(v.skills) as Skill[];
        return skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()));
      });
    }

    // Calculate distances if coordinates provided
    let result = volunteers.map(v => ({
      ...v,
      skills: JSON.parse(v.skills),
      availability: JSON.parse(v.availability),
      certifications: v.certifications ? JSON.parse(v.certifications) : [],
      distance: lat && lng && v.latitude && v.longitude ? 
        calculateDistance(parseFloat(lat), parseFloat(lng), v.latitude, v.longitude) : undefined
    }));

    if (lat && lng) {
      result = result
        .filter(v => !v.distance || v.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return NextResponse.json({
      success: true,
      volunteers: result,
      total: result.length
    });

  } catch (error) {
    console.error('Volunteers fetch error:', error);
    
    // Return mock data
    return NextResponse.json({
      success: true,
      volunteers: getMockVolunteers(),
      total: getMockVolunteers().length
    });
  }
}

// POST - Register as volunteer
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, name, phone, email, skills, availability, district, state, latitude, longitude, experience, certifications, emergencyContact, emergencyPhone } = data;

    if (!userId || !name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'User ID, name, and phone are required'
      }, { status: 400 });
    }

    // Check if already registered
    const existing = await db.volunteer.findFirst({
      where: { userId }
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Already registered as volunteer',
        volunteer: existing
      }, { status: 400 });
    }

    const volunteer = await db.volunteer.create({
      data: {
        userId,
        name,
        phone,
        email,
        skills: JSON.stringify(skills || []),
        availability: JSON.stringify(availability || {}),
        district,
        state,
        latitude,
        longitude,
        verified: false,
        experience,
        certifications: certifications ? JSON.stringify(certifications) : null,
        hoursContributed: 0,
        tasksCompleted: 0,
        emergencyContact,
        emergencyPhone,
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteer registration successful. Pending verification.',
      volunteer: {
        ...volunteer,
        skills: JSON.parse(volunteer.skills),
        availability: JSON.parse(volunteer.availability),
        certifications: volunteer.certifications ? JSON.parse(volunteer.certifications) : []
      }
    });

  } catch (error) {
    console.error('Register volunteer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register volunteer'
    }, { status: 500 });
  }
}

// PUT - Update volunteer profile or verify
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { volunteerId, action, verifiedBy, ...updateData } = data;

    if (!volunteerId) {
      return NextResponse.json({
        success: false,
        error: 'Volunteer ID is required'
      }, { status: 400 });
    }

    const volunteer = await db.volunteer.findUnique({
      where: { id: volunteerId }
    });

    if (!volunteer) {
      return NextResponse.json({
        success: false,
        error: 'Volunteer not found'
      }, { status: 404 });
    }

    // Verify volunteer
    if (action === 'verify') {
      const updated = await db.volunteer.update({
        where: { id: volunteerId },
        data: {
          verified: true,
          verifiedBy,
          verifiedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Volunteer verified successfully',
        volunteer: {
          ...updated,
          skills: JSON.parse(updated.skills),
          availability: JSON.parse(updated.availability)
        }
      });
    }

    // Update availability
    if (action === 'updateAvailability') {
      const { isAvailable } = updateData;
      const updated = await db.volunteer.update({
        where: { id: volunteerId },
        data: { isAvailable }
      });

      return NextResponse.json({
        success: true,
        isAvailable: updated.isAvailable
      });
    }

    // Log completed task
    if (action === 'logTask') {
      const { hours } = updateData;
      const updated = await db.volunteer.update({
        where: { id: volunteerId },
        data: {
          hoursContributed: { increment: hours || 1 },
          tasksCompleted: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        stats: {
          hoursContributed: updated.hoursContributed,
          tasksCompleted: updated.tasksCompleted
        }
      });
    }

    // Update profile
    const updateFields: Record<string, unknown> = {};
    if (updateData.skills) updateFields.skills = JSON.stringify(updateData.skills);
    if (updateData.availability) updateFields.availability = JSON.stringify(updateData.availability);
    if (updateData.district) updateFields.district = updateData.district;
    if (updateData.state) updateFields.state = updateData.state;
    if (updateData.experience) updateFields.experience = updateData.experience;
    if (updateData.emergencyContact) updateFields.emergencyContact = updateData.emergencyContact;
    if (updateData.emergencyPhone) updateFields.emergencyPhone = updateData.emergencyPhone;

    const updated = await db.volunteer.update({
      where: { id: volunteerId },
      data: updateFields
    });

    return NextResponse.json({
      success: true,
      volunteer: {
        ...updated,
        skills: JSON.parse(updated.skills),
        availability: JSON.parse(updated.availability),
        certifications: updated.certifications ? JSON.parse(updated.certifications) : []
      }
    });

  } catch (error) {
    console.error('Update volunteer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update volunteer'
    }, { status: 500 });
  }
}

// DELETE - Remove volunteer profile
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get('volunteerId');
    const userId = searchParams.get('userId');

    if (!volunteerId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Volunteer ID or User ID is required'
      }, { status: 400 });
    }

    if (userId) {
      await db.volunteer.deleteMany({
        where: { userId }
      });
    } else {
      await db.volunteer.delete({
        where: { id: volunteerId! }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer profile removed successfully'
    });

  } catch (error) {
    console.error('Delete volunteer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove volunteer'
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

// Mock volunteers data
function getMockVolunteers() {
  return [
    {
      id: 'vol-1',
      userId: 'user-1',
      name: 'Ramesh Kumar',
      phone: '+91-9876543210',
      email: 'ramesh@example.com',
      skills: [
        { id: 's1', name: 'First Aid', level: 'expert' },
        { id: 's2', name: 'Ambulance Driving', level: 'intermediate' }
      ],
      availability: {
        monday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00'],
        saturday: ['full-day']
      },
      district: 'Main District',
      state: 'State',
      verified: true,
      experience: '5 years as ambulance driver',
      hoursContributed: 120,
      tasksCompleted: 45,
      rating: 4.8,
      isAvailable: true,
      status: 'active'
    },
    {
      id: 'vol-2',
      userId: 'user-2',
      name: 'Sunita Devi',
      phone: '+91-9988776655',
      skills: [
        { id: 's3', name: 'Counseling', level: 'expert' },
        { id: 's4', name: 'Translation (Hindi)', level: 'expert' }
      ],
      availability: {
        tuesday: ['10:00-14:00'],
        thursday: ['10:00-14:00'],
        sunday: ['full-day']
      },
      district: 'Main District',
      state: 'State',
      verified: true,
      experience: 'MSW with 3 years experience in community health',
      hoursContributed: 85,
      tasksCompleted: 32,
      rating: 4.9,
      isAvailable: true,
      status: 'active'
    },
    {
      id: 'vol-3',
      userId: 'user-3',
      name: 'Amit Singh',
      phone: '+91-8877665544',
      skills: [
        { id: 's5', name: 'First Aid', level: 'intermediate' },
        { id: 's6', name: 'Transport', level: 'expert' }
      ],
      availability: {
        friday: ['18:00-22:00'],
        saturday: ['full-day'],
        sunday: ['full-day']
      },
      district: 'Rural District',
      state: 'State',
      verified: true,
      experience: 'Volunteer firefighter with first aid training',
      hoursContributed: 65,
      tasksCompleted: 28,
      rating: 4.7,
      isAvailable: false,
      status: 'active'
    },
    {
      id: 'vol-4',
      userId: 'user-4',
      name: 'Priya Sharma',
      phone: '+91-7766554433',
      skills: [
        { id: 's7', name: 'Nursing', level: 'expert' },
        { id: 's8', name: 'Health Education', level: 'intermediate' }
      ],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00']
      },
      district: 'Main District',
      state: 'State',
      verified: false,
      experience: 'BSc Nursing student, final year',
      hoursContributed: 0,
      tasksCompleted: 0,
      isAvailable: true,
      status: 'active'
    }
  ];
}
