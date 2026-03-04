import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// Get patients
export async function GET(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const healthWorkerId = searchParams.get('healthWorkerId');
    const village = searchParams.get('village');
    const highRisk = searchParams.get('highRisk');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Single patient by ID
    if (id) {
      const patient = await db.patient.findUnique({
        where: { id },
        include: {
          symptoms: { take: 10, orderBy: { createdAt: 'desc' } },
          vaccinations: true,
          healthRecords: { take: 10, orderBy: { recordDate: 'desc' } }
        }
      });

      if (!patient) {
        return NextResponse.json({
          success: false,
          error: 'Patient not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        patient
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    
    // Health workers can only see their assigned patients
    if (user?.role === 'health_worker') {
      where.healthWorkerId = user.id;
    } else if (healthWorkerId) {
      where.healthWorkerId = healthWorkerId;
    }

    if (village) where.village = village;
    if (highRisk === 'true') where.isHighRisk = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.patient.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch patients'
    }, { status: 500 });
  }
}

// Create patient
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();

    // Calculate high-risk status
    const isHighRisk = determineHighRisk(data);

    const patient = await db.patient.create({
      data: {
        ...data,
        isHighRisk,
        pregnancyDueDate: data.pregnancyDueDate ? new Date(data.pregnancyDueDate) : null,
        healthWorkerId: data.healthWorkerId || (user?.role === 'health_worker' ? user.id : null)
      }
    });

    return NextResponse.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create patient'
    }, { status: 500 });
  }
}

// Update patient
export async function PUT(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Patient ID required'
      }, { status: 400 });
    }

    // Recalculate high-risk status if relevant data changed
    if (updateData.chronicConditions || updateData.pregnancyDueDate) {
      updateData.isHighRisk = determineHighRisk(updateData);
    }

    if (updateData.pregnancyDueDate) {
      updateData.pregnancyDueDate = new Date(updateData.pregnancyDueDate);
    }

    const patient = await db.patient.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update patient'
    }, { status: 500 });
  }
}

// Delete patient
export async function DELETE(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    if (user?.role !== 'admin' && user?.role !== 'doctor') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Patient ID required'
      }, { status: 400 });
    }

    await db.patient.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete patient'
    }, { status: 500 });
  }
}

// Determine if patient is high-risk
function determineHighRisk(data: Record<string, unknown>): boolean {
  const riskFactors = [
    data.age && (data.age as number) > 60,
    data.age && (data.age as number) < 5,
    data.pregnancyDueDate,
    data.chronicConditions && (data.chronicConditions as string).toLowerCase().includes('diabetes'),
    data.chronicConditions && (data.chronicConditions as string).toLowerCase().includes('hypertension'),
    data.chronicConditions && (data.chronicConditions as string).toLowerCase().includes('heart'),
    data.chronicConditions && (data.chronicConditions as string).toLowerCase().includes('kidney')
  ];

  return riskFactors.filter(Boolean).length > 0;
}
