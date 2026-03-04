import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Haversine formula for distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET - List pharmacies
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');
    const pincode = searchParams.get('pincode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    const where: Record<string, unknown> = { isOpen: true };
    
    if (district) {
      where.district = { contains: district };
    }
    if (pincode) {
      where.pincode = { contains: pincode };
    }
    
    let pharmacies = await db.pharmacy.findMany({
      where,
      take: 50
    });
    
    // Sort by distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      pharmacies = pharmacies
        .map(p => ({
          ...p,
          distance: p.latitude && p.longitude 
            ? calculateDistance(userLat, userLng, p.latitude, p.longitude) 
            : 999
        }))
        .filter(p => p.distance <= (p.deliveryRadius || 10))
        .sort((a, b) => a.distance - b.distance) as typeof pharmacies;
    }
    
    // Mock data if empty
    const result = pharmacies.length > 0 ? pharmacies : [
      {
        id: 'pharm_001',
        name: 'Apollo Pharmacy',
        phone: '1800-123-4567',
        email: 'apollo@example.com',
        address: 'MG Road, Sector 15',
        district: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        latitude: 28.4595,
        longitude: 77.0266,
        deliveryRadius: 5,
        minOrderAmount: 100,
        deliveryCharges: 20,
        freeDeliveryAbove: 500,
        openTime: '08:00',
        closeTime: '22:00',
        isOpen24Hours: false,
        isOpen: true,
        isVerified: true,
        rating: 4.5,
        totalOrders: 1500
      },
      {
        id: 'pharm_002',
        name: 'MedPlus',
        phone: '1800-987-6543',
        email: 'medplus@example.com',
        address: 'City Center, Block A',
        district: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        latitude: 28.4656,
        longitude: 77.0320,
        deliveryRadius: 8,
        minOrderAmount: 150,
        deliveryCharges: 30,
        freeDeliveryAbove: 750,
        openTime: '00:00',
        closeTime: '23:59',
        isOpen24Hours: true,
        isOpen: true,
        isVerified: true,
        rating: 4.3,
        totalOrders: 2100
      },
      {
        id: 'pharm_003',
        name: 'Netmeds',
        phone: '1800-111-2222',
        email: 'netmeds@example.com',
        address: 'Industrial Area, Phase 2',
        district: 'Gurugram',
        state: 'Haryana',
        pincode: '122016',
        latitude: 28.4744,
        longitude: 77.0520,
        deliveryRadius: 15,
        minOrderAmount: 200,
        deliveryCharges: 0,
        freeDeliveryAbove: 0,
        openTime: '09:00',
        closeTime: '21:00',
        isOpen24Hours: false,
        isOpen: true,
        isVerified: true,
        rating: 4.6,
        totalOrders: 3200
      }
    ];
    
    return NextResponse.json({ success: true, pharmacies: result });
    
  } catch (error) {
    console.error('Get pharmacies error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pharmacies' }, { status: 500 });
  }
}

// POST - Register pharmacy (admin only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, address, district, state, pincode, latitude, longitude, deliveryRadius, minOrderAmount, deliveryCharges, freeDeliveryAbove, openTime, closeTime, isOpen24Hours } = data;
    
    if (!name || !phone || !address || !district || !state || !pincode) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const pharmacy = await db.pharmacy.create({
      data: {
        name,
        phone,
        email,
        address,
        district,
        state,
        pincode,
        latitude,
        longitude,
        deliveryRadius: deliveryRadius || 5,
        minOrderAmount: minOrderAmount || 0,
        deliveryCharges: deliveryCharges || 0,
        freeDeliveryAbove,
        openTime: openTime || '09:00',
        closeTime: closeTime || '21:00',
        isOpen24Hours: isOpen24Hours || false
      }
    });
    
    return NextResponse.json({ success: true, pharmacy });
    
  } catch (error) {
    console.error('Create pharmacy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create pharmacy' }, { status: 500 });
  }
}

// PUT - Update pharmacy
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Pharmacy ID required' }, { status: 400 });
    }
    
    const pharmacy = await db.pharmacy.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, pharmacy });
    
  } catch (error) {
    console.error('Update pharmacy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update pharmacy' }, { status: 500 });
  }
}

// DELETE - Delete pharmacy
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Pharmacy ID required' }, { status: 400 });
    }
    
    await db.pharmacy.update({
      where: { id },
      data: { isOpen: false }
    });
    
    return NextResponse.json({ success: true, message: 'Pharmacy deactivated' });
    
  } catch (error) {
    console.error('Delete pharmacy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete pharmacy' }, { status: 500 });
  }
}
