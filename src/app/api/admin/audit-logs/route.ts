import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';

// GET - Get audit logs (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: Record<string, unknown> = {};
    
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }
    
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.auditLog.count({ where })
    ]);
    
    return NextResponse.json({ 
      success: true, 
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// POST - Create audit log entry
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, userName, userRole, action, entityType, entityId, details, oldValue, newValue, ipAddress, userAgent, status, errorMessage } = data;
    
    const log = await db.auditLog.create({
      data: {
        userId,
        userName,
        userRole,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : undefined,
        oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
        newValue: newValue ? JSON.stringify(newValue) : undefined,
        ipAddress,
        userAgent,
        status: status || 'success',
        errorMessage
      }
    });
    
    return NextResponse.json({ success: true, log });
    
  } catch (error) {
    console.error('Create audit log error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create audit log' }, { status: 500 });
  }
}
