import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';

// GET - Get system settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const publicOnly = searchParams.get('public');
    
    const where: Record<string, unknown> = {};
    
    if (category) where.category = category;
    if (publicOnly === 'true') where.isPublic = true;
    
    const settings = await db.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' }
    });
    
    // Default settings if empty
    const result = settings.length > 0 ? settings : [
      { id: 'set_001', key: 'app_name', value: 'Swasthya Mitra', description: 'Application name', category: 'general', valueType: 'string', isPublic: true, isEditable: false },
      { id: 'set_002', key: 'emergency_number', value: '108', description: 'Emergency helpline number', category: 'general', valueType: 'string', isPublic: true, isEditable: false },
      { id: 'set_003', key: 'max_consultation_duration', value: '30', description: 'Maximum consultation duration in minutes', category: 'consultation', valueType: 'number', isPublic: false, isEditable: true },
      { id: 'set_004', key: 'default_language', value: 'hi', description: 'Default language code', category: 'general', valueType: 'string', isPublic: true, isEditable: true },
      { id: 'set_005', key: 'notification_enabled', value: 'true', description: 'Enable push notifications', category: 'notification', valueType: 'boolean', isPublic: false, isEditable: true },
      { id: 'set_006', key: 'sms_enabled', value: 'false', description: 'Enable SMS notifications', category: 'notification', valueType: 'boolean', isPublic: false, isEditable: true },
      { id: 'set_007', key: 'outbreak_alert_threshold', value: '10', description: 'Number of cases for outbreak alert', category: 'alert', valueType: 'number', isPublic: false, isEditable: true },
      { id: 'set_008', key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', category: 'system', valueType: 'boolean', isPublic: true, isEditable: true }
    ];
    
    // Parse values based on type
    const parsedSettings = result.map(s => {
      let parsedValue: string | number | boolean | object = s.value;
      switch (s.valueType) {
        case 'number':
          parsedValue = parseFloat(s.value);
          break;
        case 'boolean':
          parsedValue = s.value === 'true';
          break;
        case 'json':
          try {
            parsedValue = JSON.parse(s.value);
          } catch {
            parsedValue = s.value;
          }
          break;
      }
      return { ...s, parsedValue };
    });
    
    return NextResponse.json({ success: true, settings: parsedSettings });
    
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update setting (admin only)
export async function PUT(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { key, value } = data;
    
    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: 'Key and value are required' }, { status: 400 });
    }
    
    // Get existing setting to check if editable
    const existing = await db.systemSetting.findUnique({ where: { key } });
    
    if (existing && !existing.isEditable) {
      return NextResponse.json({ success: false, error: 'This setting is not editable' }, { status: 400 });
    }
    
    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        valueType: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        userId: adminCheck.user?.id,
        userName: adminCheck.user?.name,
        userRole: adminCheck.user?.role,
        action: 'update',
        entityType: 'SystemSetting',
        entityId: setting.id,
        oldValue: existing?.value,
        newValue: String(value)
      }
    });
    
    return NextResponse.json({ success: true, setting });
    
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 });
  }
}

// POST - Create new setting (admin only)
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { key, value, description, category, valueType, isPublic, isEditable } = data;
    
    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: 'Key and value are required' }, { status: 400 });
    }
    
    const setting = await db.systemSetting.create({
      data: {
        key,
        value: String(value),
        description,
        category,
        valueType: valueType || 'string',
        isPublic: isPublic ?? false,
        isEditable: isEditable ?? true
      }
    });
    
    return NextResponse.json({ success: true, setting });
    
  } catch (error) {
    console.error('Create setting error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create setting' }, { status: 500 });
  }
}

// DELETE - Delete setting (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key required' }, { status: 400 });
    }
    
    await db.systemSetting.delete({ where: { key } });
    
    return NextResponse.json({ success: true, message: 'Setting deleted' });
    
  } catch (error) {
    console.error('Delete setting error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete setting' }, { status: 500 });
  }
}
