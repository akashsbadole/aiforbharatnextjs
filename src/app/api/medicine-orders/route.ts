import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate order number
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${random}`;
}

// GET - List orders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const pharmacyId = searchParams.get('pharmacyId');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    
    const orders = await db.medicineOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    // Mock data if empty
    const result = orders.length > 0 ? orders : [
      {
        id: 'ord_001',
        orderNumber: 'ORD-20240115-AB12',
        userId: 'user_001',
        items: JSON.stringify([
          { medicineId: 'med_001', name: 'Paracetamol 500mg', quantity: 2, price: 22.5 },
          { medicineId: 'med_002', name: 'Cetirizine 10mg', quantity: 1, price: 33.25 }
        ]),
        subtotal: 78.25,
        deliveryCharges: 20,
        discount: 0,
        totalAmount: 98.25,
        deliveryAddress: '123, Sector 15, Gurugram',
        deliveryPincode: '122001',
        recipientName: 'Rahul Kumar',
        recipientPhone: '9876543210',
        pharmacyId: 'pharm_001',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'placed',
        createdAt: new Date()
      }
    ];
    
    return NextResponse.json({ success: true, orders: result });
    
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Place new order
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, items, deliveryAddress, deliveryPincode, recipientName, recipientPhone, pharmacyId, prescriptionImage, paymentMethod } = data;
    
    if (!items || !deliveryAddress || !recipientName || !recipientPhone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Calculate totals
    const itemsList = typeof items === 'string' ? JSON.parse(items) : items;
    const subtotal = itemsList.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
    
    // Get pharmacy for delivery charges
    let deliveryCharges = 20;
    let freeDeliveryAbove = 500;
    
    if (pharmacyId) {
      const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
      if (pharmacy) {
        deliveryCharges = pharmacy.deliveryCharges;
        freeDeliveryAbove = pharmacy.freeDeliveryAbove || 0;
      }
    }
    
    const finalDeliveryCharges = subtotal >= freeDeliveryAbove ? 0 : deliveryCharges;
    const totalAmount = subtotal + finalDeliveryCharges;
    
    const orderNumber = generateOrderNumber();
    
    const order = await db.medicineOrder.create({
      data: {
        orderNumber,
        userId,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        subtotal,
        deliveryCharges: finalDeliveryCharges,
        discount: 0,
        totalAmount,
        deliveryAddress,
        deliveryPincode,
        recipientName,
        recipientPhone,
        pharmacyId,
        prescriptionImage,
        paymentMethod: paymentMethod || 'cod',
        status: 'placed',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order placed successfully'
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to place order' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, paymentStatus, pharmacyNotes, deliveredAt } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {};
    
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (pharmacyNotes) updateData.pharmacyNotes = pharmacyNotes;
    if (deliveredAt) updateData.deliveredAt = new Date(deliveredAt);
    
    const order = await db.medicineOrder.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, order });
    
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - Cancel order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }
    
    const order = await db.medicineOrder.findUnique({ where: { id } });
    
    if (order?.status === 'dispatched' || order?.status === 'delivered') {
      return NextResponse.json({ success: false, error: 'Cannot cancel dispatched/delivered order' }, { status: 400 });
    }
    
    await db.medicineOrder.update({
      where: { id },
      data: { status: 'cancelled' }
    });
    
    return NextResponse.json({ success: true, message: 'Order cancelled' });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
  }
}
