import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get doctor's availability schedule
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date'); // YYYY-MM-DD format
    
    if (!doctorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID required' 
      }, { status: 400 });
    }
    
    // Get doctor details
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        specialization: true,
        availability: true,
        isAvailableOnline: true,
        videoConsultFee: true,
        consultationFee: true
      }
    });
    
    if (!doctor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor not found' 
      }, { status: 404 });
    }
    
    // Parse availability
    let availability = {};
    try {
      availability = JSON.parse(doctor.availability || '{}');
    } catch {
      availability = getDefaultAvailability();
    }
    
    // If specific date requested, get slots and existing appointments
    let slots: Array<{ time: string; available: boolean; reason?: string }> = [];
    
    if (date) {
      const requestDate = new Date(date);
      const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const daySchedule = (availability as Record<string, { start: string; end: string }>)[dayOfWeek];
      
      if (daySchedule) {
        // Generate time slots (30 min intervals)
        const startTime = parseTime(daySchedule.start);
        const endTime = parseTime(daySchedule.end);
        
        // Get existing appointments for that date
        const existingAppointments = await db.consultation.findMany({
          where: {
            doctorId,
            scheduledDate: requestDate,
            status: { in: ['scheduled', 'in_progress'] }
          },
          select: { scheduledTime: true }
        });
        
        const bookedTimes = existingAppointments.map(a => a.scheduledTime);
        
        // Generate slots
        let currentTime = startTime;
        while (currentTime < endTime) {
          const timeStr = formatTime(currentTime);
          slots.push({
            time: timeStr,
            available: !bookedTimes.includes(timeStr)
          });
          currentTime += 30; // 30 minute slots
        }
      } else {
        // Doctor not available on this day
        slots = [];
      }
    }
    
    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        isAvailableOnline: doctor.isAvailableOnline,
        videoConsultFee: doctor.videoConsultFee,
        consultationFee: doctor.consultationFee
      },
      availability,
      slots,
      date
    });
    
  } catch (error) {
    console.error('Get doctor availability error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch availability' 
    }, { status: 500 });
  }
}

// POST - Update doctor's availability (doctor/admin only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { doctorId, availability } = data;
    
    if (!doctorId || !availability) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID and availability required' 
      }, { status: 400 });
    }
    
    const doctor = await db.doctor.update({
      where: { id: doctorId },
      data: {
        availability: JSON.stringify(availability)
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      doctor
    });
    
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update availability' 
    }, { status: 500 });
  }
}

// Helper functions
function getDefaultAvailability() {
  return {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '13:00' }
  };
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
