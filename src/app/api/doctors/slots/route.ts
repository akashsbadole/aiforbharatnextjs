import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get available time slots for a doctor
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    
    if (!doctorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID required' 
      }, { status: 400 });
    }
    
    const where: any = { doctorId };
    
    if (date) {
      where.date = new Date(date);
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      // Default to next 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.date = { gte: today, lte: nextWeek };
    }
    
    if (status) {
      where.status = status;
    }
    
    const slots = await db.doctorTimeSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
    
    // Group slots by date
    const groupedSlots: Record<string, any[]> = {};
    slots.forEach(slot => {
      const dateKey = new Date(slot.date).toISOString().split('T')[0];
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = [];
      }
      groupedSlots[dateKey].push(slot);
    });
    
    return NextResponse.json({ 
      success: true, 
      slots,
      groupedSlots 
    });
    
  } catch (error) {
    console.error('Get time slots error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch time slots' 
    }, { status: 500 });
  }
}

// POST - Block or update a time slot
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { doctorId, date, startTime, endTime, consultationType, notes } = data;
    
    if (!doctorId || !date || !startTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID, date, and start time required' 
      }, { status: 400 });
    }
    
    const slot = await db.doctorTimeSlot.create({
      data: {
        doctorId,
        date: new Date(date),
        startTime,
        endTime: endTime || calculateEndTime(startTime, 15),
        consultationType: consultationType || 'both',
        status: 'available',
        notes
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Time slot created',
      slot 
    });
    
  } catch (error) {
    console.error('Create time slot error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create time slot' 
    }, { status: 500 });
  }
}

// PUT - Update a time slot
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, notes, bookedBy } = data;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Slot ID required' 
      }, { status: 400 });
    }
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (bookedBy) {
      updateData.bookedBy = bookedBy;
      updateData.bookedAt = new Date();
    }
    
    const slot = await db.doctorTimeSlot.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Time slot updated',
      slot 
    });
    
  } catch (error) {
    console.error('Update time slot error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update time slot' 
    }, { status: 500 });
  }
}

// DELETE - Delete a time slot
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Slot ID required' 
      }, { status: 400 });
    }
    
    await db.doctorTimeSlot.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Time slot deleted' 
    });
    
  } catch (error) {
    console.error('Delete time slot error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete time slot' 
    }, { status: 500 });
  }
}

// Helper function
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
