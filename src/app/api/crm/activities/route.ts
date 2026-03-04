import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List staff activities
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const assignmentId = searchParams.get('assignmentId');
    const activityType = searchParams.get('activityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (assignmentId) where.assignmentId = assignmentId;
    if (activityType) where.activityType = activityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const activities = await db.staffActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await db.staffActivity.count({ where });

    return NextResponse.json({
      success: true,
      activities,
      total,
      hasMore: offset + activities.length < total
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Log new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assignmentId, enquiryId,
      staffId, staffName, staffRole,
      activityType, description,
      contactMethod, contactDuration,
      outcome, nextAction, nextActionDate, notes
    } = body;

    // Validate required fields
    if (!staffId || !staffName || !activityType || !description) {
      return NextResponse.json(
        { success: false, error: 'Staff info, activity type and description are required' },
        { status: 400 }
      );
    }

    const activity = await db.staffActivity.create({
      data: {
        assignmentId: assignmentId || null,
        enquiryId: enquiryId || null,
        staffId,
        staffName,
        staffRole: staffRole || 'health_worker',
        activityType,
        description,
        contactMethod: contactMethod || null,
        contactDuration: contactDuration || null,
        outcome: outcome || null,
        nextAction: nextAction || null,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        notes: notes || null
      }
    });

    return NextResponse.json({
      success: true,
      activity,
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
