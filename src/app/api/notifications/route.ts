import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unread');
    const type = searchParams.get('type');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (unreadOnly === 'true') where.isRead = false;
    if (type) where.type = type;
    
    const notifications = await db.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    });
    
    // Mock data if empty
    const result = notifications.length > 0 ? notifications : [
      {
        id: 'notif_001',
        userId: 'user_001',
        title: 'Appointment Reminder',
        message: 'Your appointment with Dr. Rajesh Kumar is tomorrow at 10:00 AM',
        type: 'info',
        category: 'reminder',
        actionType: 'link',
        actionUrl: '/consultations',
        isRead: false,
        priority: 'high',
        createdAt: new Date()
      },
      {
        id: 'notif_002',
        userId: 'user_001',
        title: 'Medicine Reminder',
        message: 'Time to take your Metformin 500mg',
        type: 'warning',
        category: 'reminder',
        actionType: 'link',
        actionUrl: '/reminders',
        isRead: false,
        priority: 'urgent',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'notif_003',
        userId: 'user_001',
        title: 'Health Alert',
        message: 'Dengue cases are rising in your area. Take precautions.',
        type: 'warning',
        category: 'alert',
        actionType: 'none',
        isRead: true,
        priority: 'high',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'notif_004',
        userId: 'user_001',
        title: 'Vaccination Due',
        message: 'Your child\'s DTP vaccination is due next week',
        type: 'info',
        category: 'vaccination',
        actionType: 'link',
        actionUrl: '/vaccination',
        isRead: false,
        priority: 'normal',
        createdAt: new Date(Date.now() - 172800000)
      }
    ];
    
    return NextResponse.json({ success: true, notifications: result });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create notification
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, title, message, type, category, actionType, actionUrl, actionData, priority, deliveryMethod, expiresAt } = data;
    
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }
    
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info',
        category,
        actionType,
        actionUrl,
        actionData: actionData ? JSON.stringify(actionData) : undefined,
        priority: priority || 'normal',
        deliveryMethod: deliveryMethod || 'in_app',
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      }
    });
    
    return NextResponse.json({ success: true, notification });
    
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT - Mark as read or update
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, markAllRead, userId } = data;
    
    if (markAllRead && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
    }
    
    const notification = await db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });
    
    return NextResponse.json({ success: true, notification });
    
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (id) {
      await db.notification.delete({ where: { id } });
    } else if (userId) {
      await db.notification.deleteMany({ where: { userId } });
    } else {
      return NextResponse.json({ success: false, error: 'Notification ID or User ID required' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'Notification(s) deleted' });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
