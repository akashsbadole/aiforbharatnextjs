import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';

// GET - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: Record<string, unknown> = {};
    
    if (role) where.role = role;
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT - Update user role (admin only)
export async function PUT(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { id, role, name, email, language, district, state } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (language) updateData.language = language;
    if (district !== undefined) updateData.district = district;
    if (state !== undefined) updateData.state = state;
    
    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        language: true,
        district: true,
        state: true
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        userId: adminCheck.user?.id,
        userName: adminCheck.user?.name,
        userRole: adminCheck.user?.role,
        action: 'update',
        entityType: 'User',
        entityId: id,
        newValue: JSON.stringify(updateData)
      }
    });
    
    return NextResponse.json({ success: true, user });
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    // Don't allow deleting self
    if (id === adminCheck.user?.id) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    await db.user.delete({ where: { id } });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        userId: adminCheck.user?.id,
        userName: adminCheck.user?.name,
        userRole: adminCheck.user?.role,
        action: 'delete',
        entityType: 'User',
        entityId: id
      }
    });
    
    return NextResponse.json({ success: true, message: 'User deleted' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
