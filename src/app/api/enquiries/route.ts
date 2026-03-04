import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List enquiries (for staff/admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const enquiries = await db.enquiry.findMany({
      where,
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await db.enquiry.count({ where });

    return NextResponse.json({
      success: true,
      enquiries,
      total,
      hasMore: offset + enquiries.length < total
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

// POST - Create new enquiry (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, category, userId, source } = body;

    // Validate required fields
    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, subject and message are required' },
        { status: 400 }
      );
    }

    // Determine priority based on category
    let priority = 'normal';
    if (category === 'complaint' || category === 'support') {
      priority = 'high';
    }

    const enquiry = await db.enquiry.create({
      data: {
        name,
        email: email || null,
        phone,
        subject,
        message,
        category: category || 'general',
        priority,
        userId: userId || null,
        source: source || 'website',
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      enquiry,
      message: 'Enquiry submitted successfully. Our team will contact you soon.'
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

// PUT - Update enquiry status/assignment (staff/admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, assignedTo, resolution, staffId, staffName } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enquiry ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      updateData.assignedAt = new Date();
    }
    if (resolution) {
      updateData.resolution = resolution;
      updateData.resolvedAt = new Date();
      updateData.status = 'resolved';
    }

    const enquiry = await db.enquiry.update({
      where: { id },
      data: updateData
    });

    // Create follow-up record if staff info provided
    if (staffId && staffName) {
      await db.enquiryFollowUp.create({
        data: {
          enquiryId: id,
          staffId,
          staffName,
          notes: resolution || `Status updated to ${status || enquiry.status}`,
          actionTaken: status === 'resolved' ? 'resolved' : 'updated',
          contactStatus: 'connected'
        }
      });
    }

    return NextResponse.json({
      success: true,
      enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete enquiry (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enquiry ID is required' },
        { status: 400 }
      );
    }

    await db.enquiry.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}
