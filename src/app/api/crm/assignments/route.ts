import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List patient assignments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const priority = searchParams.get('priority');
    const assignmentType = searchParams.get('assignmentType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (priority) where.priority = priority;
    if (assignmentType) where.assignmentType = assignmentType;

    const assignments = await db.patientAssignment.findMany({
      where,
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await db.patientAssignment.count({ where });

    return NextResponse.json({
      success: true,
      assignments,
      total,
      hasMore: offset + assignments.length < total
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST - Create new patient assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId, patientName, patientPhone, patientAge, patientGender,
      userId, assignedToId, assignedToName, assignedToRole,
      assignmentType, priority, reason, symptoms, diagnosis, notes,
      scheduledDate, followUpRequired, followUpDate
    } = body;

    // Validate required fields
    if (!patientName || !patientPhone || !assignedToId || !assignedToName) {
      return NextResponse.json(
        { success: false, error: 'Patient details and assignment info are required' },
        { status: 400 }
      );
    }

    const assignment = await db.patientAssignment.create({
      data: {
        patientId: patientId || `patient-${Date.now()}`,
        patientName,
        patientPhone,
        patientAge: patientAge || null,
        patientGender: patientGender || null,
        userId: userId || null,
        assignedToId,
        assignedToName,
        assignedToRole: assignedToRole || 'health_worker',
        assignmentType: assignmentType || 'primary_care',
        priority: priority || 'normal',
        reason: reason || null,
        symptoms: symptoms || null,
        diagnosis: diagnosis || null,
        notes: notes || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status: 'assigned'
      }
    });

    // Create activity log
    await db.staffActivity.create({
      data: {
        assignmentId: assignment.id,
        staffId: assignedToId,
        staffName: assignedToName,
        staffRole: assignedToRole || 'health_worker',
        activityType: 'assignment',
        description: `Patient ${patientName} assigned for ${assignmentType || 'primary_care'}`,
        notes: reason || null
      }
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Patient assigned successfully'
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

// PUT - Update assignment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id, status, priority, notes, diagnosis, scheduledDate,
      completedDate, followUpRequired, followUpDate,
      staffId, staffName, staffRole
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes) updateData.notes = notes;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (completedDate) updateData.completedDate = new Date(completedDate);
    if (followUpRequired !== undefined) updateData.followUpRequired = followUpRequired;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const assignment = await db.patientAssignment.update({
      where: { id },
      data: updateData
    });

    // Create activity log if staff info provided
    if (staffId && staffName) {
      await db.staffActivity.create({
        data: {
          assignmentId: id,
          staffId,
          staffName,
          staffRole: staffRole || 'health_worker',
          activityType: 'status_change',
          description: `Assignment status updated to ${status || assignment.status}`,
          notes: notes || null
        }
      });
    }

    return NextResponse.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete assignment (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await db.patientAssignment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
