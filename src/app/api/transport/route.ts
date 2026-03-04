import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get transport requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const vehicleType = searchParams.get('vehicleType');

    // Single transport request
    if (id) {
      const transport = await db.transportRequest.findUnique({
        where: { id }
      });
      return NextResponse.json({
        success: true,
        transport
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (vehicleType) where.vehicleType = vehicleType;

    const transports = await db.transportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      transports,
      total: transports.length
    });

  } catch (error) {
    console.error('Get transports error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transport requests'
    }, { status: 500 });
  }
}

// POST - Create transport request
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      patientId,
      emergencyId,
      pickupLocation,
      pickupLat,
      pickupLng,
      dropLocation,
      dropLat,
      dropLng,
      vehicleType,
      patientName,
      patientPhone,
      emergencyType,
      notes
    } = data;

    if (!pickupLocation || !dropLocation) {
      return NextResponse.json({
        success: false,
        error: 'Pickup and drop locations are required'
      }, { status: 400 });
    }

    // Calculate estimated time (mock calculation)
    const estimatedTime = Math.floor(Math.random() * 30) + 10; // 10-40 minutes

    // Create transport request
    const transport = await db.transportRequest.create({
      data: {
        patientId,
        emergencyId,
        pickupLocation,
        pickupLat,
        pickupLng,
        dropLocation,
        dropLat,
        dropLng,
        vehicleType: vehicleType || 'ambulance',
        status: 'requested',
        estimatedTime
      }
    });

    // Mock driver assignment for demo
    const mockDrivers = [
      { id: 'DRV001', name: 'Ramesh Kumar', phone: '+91-9876543210', vehicle: 'AMB-1234' },
      { id: 'DRV002', name: 'Suresh Singh', phone: '+91-9876543211', vehicle: 'AMB-5678' },
      { id: 'DRV003', name: 'Mohan Lal', phone: '+91-9876543212', vehicle: 'AUTO-9012' }
    ];

    const assignedDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];

    // Update with driver info
    const updatedTransport = await db.transportRequest.update({
      where: { id: transport.id },
      data: {
        driverId: assignedDriver.id,
        driverPhone: assignedDriver.phone,
        status: 'assigned'
      }
    });

    return NextResponse.json({
      success: true,
      transport: updatedTransport,
      driver: assignedDriver,
      message: 'Transport request created successfully',
      helplines: {
        ambulance: '108',
        emergency: '112'
      }
    });

  } catch (error) {
    console.error('Create transport error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create transport request'
    }, { status: 500 });
  }
}

// PUT - Update transport status
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, driverId, driverPhone, estimatedTime } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Transport ID required'
      }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (driverId) updateData.driverId = driverId;
    if (driverPhone) updateData.driverPhone = driverPhone;
    if (estimatedTime) updateData.estimatedTime = estimatedTime;

    const transport = await db.transportRequest.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      transport,
      message: 'Transport updated successfully'
    });

  } catch (error) {
    console.error('Update transport error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update transport'
    }, { status: 500 });
  }
}

// DELETE - Cancel transport request
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Transport ID required'
      }, { status: 400 });
    }

    // Update status to cancelled instead of deleting
    const transport = await db.transportRequest.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return NextResponse.json({
      success: true,
      message: 'Transport request cancelled',
      transport
    });

  } catch (error) {
    console.error('Cancel transport error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel transport'
    }, { status: 500 });
  }
}
