import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get doctor's leaves
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const upcoming = searchParams.get('upcoming');
    
    if (!doctorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID required' 
      }, { status: 400 });
    }
    
    const where: any = { doctorId };
    
    if (upcoming === 'true') {
      where.endDate = { gte: new Date() };
    }
    
    const leaves = await db.doctorLeave.findMany({
      where,
      orderBy: { startDate: 'asc' }
    });
    
    return NextResponse.json({ 
      success: true, 
      leaves 
    });
    
  } catch (error) {
    console.error('Get doctor leaves error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch leaves' 
    }, { status: 500 });
  }
}

// POST - Create a new leave
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { doctorId, startDate, endDate, leaveType, reason, isRecurring, recurringPattern } = data;
    
    if (!doctorId || !startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID, start date, and end date required' 
      }, { status: 400 });
    }
    
    const leave = await db.doctorLeave.create({
      data: {
        doctorId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType: leaveType || 'full_day',
        reason,
        isRecurring: isRecurring || false,
        recurringPattern,
        status: 'approved'
      }
    });
    
    // Block any existing slots during leave period
    await db.doctorTimeSlot.updateMany({
      where: {
        doctorId,
        date: { gte: new Date(startDate), lte: new Date(endDate) },
        status: 'available'
      },
      data: { status: 'blocked', notes: 'Doctor on leave' }
    });
    
    // Update doctor status if currently on leave
    const today = new Date();
    if (new Date(startDate) <= today && new Date(endDate) >= today) {
      await db.doctor.update({
        where: { id: doctorId },
        data: { status: 'on_leave' }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leave created successfully',
      leave 
    });
    
  } catch (error) {
    console.error('Create doctor leave error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create leave' 
    }, { status: 500 });
  }
}

// PUT - Update a leave
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Leave ID required' 
      }, { status: 400 });
    }
    
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    
    const leave = await db.doctorLeave.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leave updated successfully',
      leave 
    });
    
  } catch (error) {
    console.error('Update doctor leave error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update leave' 
    }, { status: 500 });
  }
}

// DELETE - Cancel a leave
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Leave ID required' 
      }, { status: 400 });
    }
    
    const leave = await db.doctorLeave.findUnique({
      where: { id },
      select: { doctorId: true, startDate: true, endDate: true }
    });
    
    if (leave) {
      // Unblock slots
      await db.doctorTimeSlot.updateMany({
        where: {
          doctorId: leave.doctorId,
          date: { gte: leave.startDate, lte: leave.endDate },
          status: 'blocked',
          notes: 'Doctor on leave'
        },
        data: { status: 'available', notes: null }
      });
      
      // Delete the leave
      await db.doctorLeave.delete({
        where: { id }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leave cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Delete doctor leave error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cancel leave' 
    }, { status: 500 });
  }
}
