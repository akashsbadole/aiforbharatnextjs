import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List reminders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (active === 'true') where.isActive = true;
    
    const reminders = await db.medicineReminder.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    // Mock data if empty
    const result = reminders.length > 0 ? reminders : [
      {
        id: 'rem_001',
        userId: 'user_001',
        medicineName: 'Metformin',
        dosage: '500mg',
        instructions: 'Take after meals',
        frequency: 'twice',
        times: JSON.stringify(['08:00', '20:00']),
        startDate: new Date(),
        endDate: null,
        days: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        reminderMinutes: 15,
        reminderType: 'notification',
        isActive: true,
        dosesTaken: 12,
        dosesMissed: 2,
        lastTakenAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'rem_002',
        userId: 'user_001',
        medicineName: 'Vitamin D3',
        dosage: '60000 IU',
        instructions: 'Take once a week with milk',
        frequency: 'once',
        times: JSON.stringify(['09:00']),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        days: JSON.stringify([0]), // Sunday
        reminderMinutes: 30,
        reminderType: 'notification',
        isActive: true,
        dosesTaken: 4,
        dosesMissed: 0,
        lastTakenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
    
    return NextResponse.json({ success: true, reminders: result });
    
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

// POST - Create reminder
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, medicineName, dosage, instructions, frequency, times, startDate, endDate, days, reminderMinutes, reminderType } = data;
    
    if (!medicineName || !frequency || !times) {
      return NextResponse.json({ success: false, error: 'Medicine name, frequency, and times are required' }, { status: 400 });
    }
    
    const reminder = await db.medicineReminder.create({
      data: {
        userId,
        medicineName,
        dosage,
        instructions,
        frequency,
        times: typeof times === 'string' ? times : JSON.stringify(times),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        days: days ? (typeof days === 'string' ? days : JSON.stringify(days)) : JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        reminderMinutes: reminderMinutes || 0,
        reminderType: reminderType || 'notification'
      }
    });
    
    return NextResponse.json({ success: true, reminder });
    
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reminder' }, { status: 500 });
  }
}

// PUT - Update reminder
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, action, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Reminder ID required' }, { status: 400 });
    }
    
    // Handle mark as taken action
    if (action === 'taken') {
      const reminder = await db.medicineReminder.update({
        where: { id },
        data: {
          dosesTaken: { increment: 1 },
          lastTakenAt: new Date()
        }
      });
      return NextResponse.json({ success: true, reminder, message: 'Dose marked as taken' });
    }
    
    // Handle mark as missed action
    if (action === 'missed') {
      const reminder = await db.medicineReminder.update({
        where: { id },
        data: {
          dosesMissed: { increment: 1 }
        }
      });
      return NextResponse.json({ success: true, reminder, message: 'Dose marked as missed' });
    }
    
    // Regular update
    if (updateData.times && typeof updateData.times !== 'string') {
      updateData.times = JSON.stringify(updateData.times);
    }
    if (updateData.days && typeof updateData.days !== 'string') {
      updateData.days = JSON.stringify(updateData.days);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    
    const reminder = await db.medicineReminder.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, reminder });
    
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update reminder' }, { status: 500 });
  }
}

// DELETE - Delete reminder
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Reminder ID required' }, { status: 400 });
    }
    
    await db.medicineReminder.update({
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ success: true, message: 'Reminder deactivated' });
    
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete reminder' }, { status: 500 });
  }
}
