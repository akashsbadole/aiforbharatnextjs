import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// Get alerts
export async function GET(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Single alert
    if (id) {
      const alert = await db.alert.findUnique({
        where: { id },
        include: { user: true }
      });

      return NextResponse.json({
        success: true,
        alert
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (district) where.district = district;

    // Citizens only see alerts for their district
    if (user?.role === 'citizen') {
      where.targetType = 'all';
      where.status = 'active';
    }

    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      db.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, role: true }
          }
        }
      }),
      db.alert.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch alerts'
    }, { status: 500 });
  }
}

// Create alert
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();

    const alert = await db.alert.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'emergency',
        priority: data.priority || 'medium',
        targetType: data.targetType || 'all',
        targetId: data.targetId,
        district: data.district,
        createdBy: user?.id
      }
    });

    return NextResponse.json({
      success: true,
      alert
    });

  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create alert'
    }, { status: 500 });
  }
}

// Update alert
export async function PUT(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID required'
      }, { status: 400 });
    }

    // Handle status changes
    if (updateData.status === 'acknowledged') {
      updateData.acknowledgedAt = new Date();
    }
    if (updateData.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const alert = await db.alert.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      alert
    });

  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update alert'
    }, { status: 500 });
  }
}

// Delete alert
export async function DELETE(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    if (user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Only admins can delete alerts'
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID required'
      }, { status: 400 });
    }

    await db.alert.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete alert'
    }, { status: 500 });
  }
}
