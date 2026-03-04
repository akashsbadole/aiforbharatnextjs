import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, rolePermissions } from '@/lib/auth';

// Get all users (admin/doctor only)
export async function GET(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const district = searchParams.get('district');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (district) where.district = district;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          language: true,
          district: true,
          state: true,
          createdAt: true
        }
      }),
      db.user.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// Update user
export async function PUT(req: NextRequest) {
  try {
    const { error, user: currentUser } = await withAuth(req);
    if (error) return error;

    const data = await req.json();
    const { id, ...updateData } = data;

    // Only admin can change roles
    if (updateData.role && currentUser?.role !== 'admin') {
      delete updateData.role;
    }

    // Users can only update their own profile unless admin
    const targetId = id || currentUser?.id;
    if (currentUser?.role !== 'admin' && targetId !== currentUser?.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    const user = await db.user.update({
      where: { id: targetId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        language: user.language
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// Delete user (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    if (user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Only admins can delete users'
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}
