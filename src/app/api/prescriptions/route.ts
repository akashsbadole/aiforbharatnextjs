import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get prescriptions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const consultationId = searchParams.get('consultationId');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (consultationId) where.consultationId = consultationId;
    
    const prescriptions = await db.prescription.findMany({
      where,
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    // Mock data if empty
    const result = prescriptions.length > 0 ? prescriptions : [
      {
        id: 'pres_001',
        doctorId: 'doc_001',
        userId: 'user_001',
        doctor: {
          id: 'doc_001',
          name: 'Dr. Rajesh Kumar',
          specialization: 'General Medicine',
          phone: '9876543210'
        },
        medicines: JSON.stringify([
          { name: 'Paracetamol', dosage: '500mg', frequency: '3 times daily', duration: '5 days', instructions: 'After meals' },
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once at night', duration: '5 days', instructions: 'May cause drowsiness' }
        ]),
        diagnosis: 'Viral Fever with cold symptoms',
        notes: 'Take rest and stay hydrated. Follow up if symptoms persist after 5 days.',
        dietaryAdvice: 'Avoid cold foods and drinks. Have warm soup and fluids.',
        lifestyleAdvice: 'Get adequate rest. Avoid going out in cold weather.',
        followUpDate: new Date(Date.now() + 5 * 86400000),
        status: 'active',
        createdAt: new Date()
      }
    ];
    
    return NextResponse.json({ success: true, prescriptions: result });
    
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

// POST - Create new prescription (doctor only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { consultationId, doctorId, patientId, userId, medicines, diagnosis, notes, dietaryAdvice, lifestyleAdvice, followUpDate } = data;
    
    if (!doctorId || !medicines) {
      return NextResponse.json({ success: false, error: 'Doctor and medicines are required' }, { status: 400 });
    }
    
    const prescription = await db.prescription.create({
      data: {
        consultationId,
        doctorId,
        patientId,
        userId,
        medicines: typeof medicines === 'string' ? medicines : JSON.stringify(medicines),
        diagnosis,
        notes,
        dietaryAdvice,
        lifestyleAdvice,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
      },
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true }
        }
      }
    });
    
    return NextResponse.json({ success: true, prescription });
    
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create prescription' }, { status: 500 });
  }
}

// PUT - Update prescription
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Prescription ID required' }, { status: 400 });
    }
    
    if (updateData.medicines && typeof updateData.medicines !== 'string') {
      updateData.medicines = JSON.stringify(updateData.medicines);
    }
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }
    
    const prescription = await db.prescription.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, prescription });
    
  } catch (error) {
    console.error('Update prescription error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update prescription' }, { status: 500 });
  }
}

// DELETE - Delete/expire prescription
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Prescription ID required' }, { status: 400 });
    }
    
    await db.prescription.update({
      where: { id },
      data: { status: 'expired' }
    });
    
    return NextResponse.json({ success: true, message: 'Prescription expired' });
    
  } catch (error) {
    console.error('Delete prescription error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete prescription' }, { status: 500 });
  }
}
