import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate unique room code
function generateRoomCode(): string {
  return `CONS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// GET - List consultations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: startDate, lte: endDate };
    }
    
    const consultations = await db.consultation.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
            photo: true
          }
        }
      },
      orderBy: { scheduledDate: 'asc' },
      take: 50
    });
    
    // Mock data if empty
    const result = consultations.length > 0 ? consultations : [
      {
        id: 'cons_001',
        doctorId: 'doc_001',
        userId: 'user_001',
        doctor: {
          id: 'doc_001',
          name: 'Dr. Rajesh Kumar',
          specialization: 'General Medicine',
          phone: '9876543210'
        },
        scheduledDate: new Date(Date.now() + 86400000),
        scheduledTime: '10:00',
        duration: 15,
        type: 'video',
        fee: 500,
        status: 'scheduled',
        videoLink: 'https://meet.example.com/cons_001',
        roomCode: 'CONS-ABC123'
      },
      {
        id: 'cons_002',
        doctorId: 'doc_002',
        userId: 'user_001',
        doctor: {
          id: 'doc_002',
          name: 'Dr. Priya Sharma',
          specialization: 'Pediatrics',
          phone: '9876543211'
        },
        scheduledDate: new Date(Date.now() + 172800000),
        scheduledTime: '14:30',
        duration: 20,
        type: 'video',
        fee: 600,
        status: 'scheduled',
        videoLink: 'https://meet.example.com/cons_002',
        roomCode: 'CONS-DEF456'
      }
    ];
    
    return NextResponse.json({ success: true, consultations: result });
    
  } catch (error) {
    console.error('Get consultations error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch consultations' }, { status: 500 });
  }
}

// POST - Book new consultation
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { doctorId, userId, patientId, scheduledDate, scheduledTime, type, reason, duration } = data;
    
    if (!doctorId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ success: false, error: 'Doctor, date, and time are required' }, { status: 400 });
    }
    
    // Get doctor's fee
    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    const fee = type === 'video' ? (doctor?.videoConsultFee || doctor?.consultationFee || 0) : (doctor?.consultationFee || 0);
    
    const roomCode = generateRoomCode();
    const videoLink = `https://meet.swasthyamitra.in/${roomCode}`;
    
    const consultation = await db.consultation.create({
      data: {
        doctorId,
        userId,
        patientId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        type: type || 'video',
        reason,
        duration: duration || 15,
        fee,
        videoLink,
        roomCode,
        status: 'scheduled',
        paymentStatus: 'pending'
      },
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      consultation,
      message: 'Consultation booked successfully'
    });
    
  } catch (error) {
    console.error('Book consultation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to book consultation' }, { status: 500 });
  }
}

// PUT - Update consultation status
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, doctorNotes, patientNotes, patientRating, patientReview, cancellationReason } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Consultation ID required' }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'in_progress') updateData.startedAt = new Date();
      if (status === 'completed') updateData.endedAt = new Date();
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = cancellationReason;
      }
    }
    if (doctorNotes) updateData.doctorNotes = doctorNotes;
    if (patientNotes) updateData.patientNotes = patientNotes;
    if (patientRating !== undefined) updateData.patientRating = patientRating;
    if (patientReview) updateData.patientReview = patientReview;
    
    const consultation = await db.consultation.update({
      where: { id },
      data: updateData
    });
    
    // Update doctor's rating if patient rated
    if (patientRating) {
      const allConsultations = await db.consultation.findMany({
        where: { doctorId: consultation.doctorId, patientRating: { not: null } }
      });
      const avgRating = allConsultations.reduce((sum, c) => sum + (c.patientRating || 0), 0) / allConsultations.length;
      await db.doctor.update({
        where: { id: consultation.doctorId },
        data: { 
          rating: avgRating,
          totalReviews: allConsultations.length,
          totalConsultations: { increment: 1 }
        }
      });
    }
    
    return NextResponse.json({ success: true, consultation });
    
  } catch (error) {
    console.error('Update consultation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update consultation' }, { status: 500 });
  }
}

// DELETE - Cancel consultation
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Consultation ID required' }, { status: 400 });
    }
    
    const consultation = await db.consultation.update({
      where: { id },
      data: { 
        status: 'cancelled', 
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by user'
      }
    });
    
    return NextResponse.json({ success: true, message: 'Consultation cancelled' });
    
  } catch (error) {
    console.error('Cancel consultation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel consultation' }, { status: 500 });
  }
}
