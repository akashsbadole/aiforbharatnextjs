import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get doctor's weekly schedule
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    
    if (!doctorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID required' 
      }, { status: 400 });
    }
    
    const schedules = await db.doctorSchedule.findMany({
      where: { doctorId, isActive: true },
      orderBy: { dayOfWeek: 'asc' }
    });
    
    // If no schedules, return default template
    if (schedules.length === 0) {
      const defaultSchedule = generateDefaultSchedule(doctorId);
      return NextResponse.json({ 
        success: true, 
        schedules: defaultSchedule,
        isDefault: true 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      schedules,
      isDefault: false 
    });
    
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch schedule' 
    }, { status: 500 });
  }
}

// POST - Create or update doctor's schedule
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { doctorId, schedules } = data;
    
    if (!doctorId || !schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID and schedules array required' 
      }, { status: 400 });
    }
    
    // Delete existing schedules
    await db.doctorSchedule.deleteMany({
      where: { doctorId }
    });
    
    // Create new schedules
    const createdSchedules = await db.doctorSchedule.createMany({
      data: schedules.map(s => ({
        doctorId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        breakStart: s.breakStart || null,
        breakEnd: s.breakEnd || null,
        isOnline: s.isOnline ?? true,
        isInPerson: s.isInPerson ?? true,
        maxAppointments: s.maxAppointments || null,
        isActive: s.isActive ?? true
      }))
    });
    
    // Update doctor's availability JSON for backward compatibility
    const availabilityObj: Record<string, { start: string; end: string }> = {};
    schedules.forEach(s => {
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][s.dayOfWeek];
      if (s.isActive && s.startTime && s.endTime) {
        availabilityObj[dayName] = { start: s.startTime, end: s.endTime };
      }
    });
    
    await db.doctor.update({
      where: { id: doctorId },
      data: { availability: JSON.stringify(availabilityObj) }
    });
    
    // Generate time slots for next 30 days
    await generateTimeSlots(doctorId, schedules);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schedule updated successfully',
      schedules: await db.doctorSchedule.findMany({ where: { doctorId }, orderBy: { dayOfWeek: 'asc' } })
    });
    
  } catch (error) {
    console.error('Update doctor schedule error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update schedule' 
    }, { status: 500 });
  }
}

// DELETE - Delete a specific schedule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule ID required' 
      }, { status: 400 });
    }
    
    await db.doctorSchedule.update({
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schedule deactivated' 
    });
    
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete schedule' 
    }, { status: 500 });
  }
}

// Helper functions
function generateDefaultSchedule(doctorId: string) {
  const days = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  return days.map(dayOfWeek => ({
    doctorId,
    dayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    isOnline: true,
    isInPerson: true,
    isActive: dayOfWeek !== 6 // Saturday half day
  }));
}

async function generateTimeSlots(doctorId: string, schedules: any[]) {
  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: { slotDuration: true, bufferTime: true }
  });
  
  const slotDuration = doctor?.slotDuration || 15;
  const bufferTime = doctor?.bufferTime || 5;
  const totalSlotTime = slotDuration + bufferTime;
  
  const today = new Date();
  const slotsToCreate: any[] = [];
  
  // Generate slots for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
    if (!daySchedule) continue;
    
    // Check if doctor is on leave
    const leave = await db.doctorLeave.findFirst({
      where: {
        doctorId,
        startDate: { lte: date },
        endDate: { gte: date },
        status: 'approved'
      }
    });
    
    if (leave) continue;
    
    // Generate slots
    const startTime = parseTime(daySchedule.startTime);
    const endTime = parseTime(daySchedule.endTime);
    const breakStart = daySchedule.breakStart ? parseTime(daySchedule.breakStart) : null;
    const breakEnd = daySchedule.breakEnd ? parseTime(daySchedule.breakEnd) : null;
    
    let currentTime = startTime;
    while (currentTime + slotDuration <= endTime) {
      // Skip break time
      if (breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd) {
        currentTime = breakEnd;
        continue;
      }
      
      const timeStr = formatTime(currentTime);
      const endSlotTime = formatTime(currentTime + slotDuration);
      
      slotsToCreate.push({
        doctorId,
        date,
        startTime: timeStr,
        endTime: endSlotTime,
        consultationType: (daySchedule.isOnline && daySchedule.isInPerson) ? 'both' : 
                          daySchedule.isOnline ? 'video' : 'in_person',
        status: 'available'
      });
      
      currentTime += totalSlotTime;
    }
  }
  
  // Create slots
  if (slotsToCreate.length > 0) {
    for (const slot of slotsToCreate) {
      try {
        await db.doctorTimeSlot.create({ data: slot });
      } catch {
        // Skip if slot already exists
      }
    }
  }
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
