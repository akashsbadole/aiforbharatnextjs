import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate unique health card number
function generateCardNumber(): string {
  const prefix = 'IN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate QR data
function generateQRData(cardNumber: string, userId: string): string {
  return JSON.stringify({
    cardNumber,
    userId,
    platform: 'Swasthya Mitra',
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString() // 5 years
  });
}

// GET - Get health card
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const patientId = searchParams.get('patientId');
    const cardNumber = searchParams.get('cardNumber');
    
    const where: Record<string, unknown> = { status: 'active' };
    
    if (userId) where.userId = userId;
    if (patientId) where.patientId = patientId;
    if (cardNumber) where.cardNumber = cardNumber;
    
    let healthCard = await db.healthCard.findFirst({ where });
    
    // Create if doesn't exist for user
    if (!healthCard && userId) {
      const cardNum = generateCardNumber();
      const qrData = generateQRData(cardNum, userId);
      
      healthCard = await db.healthCard.create({
        data: {
          userId,
          cardNumber: cardNum,
          qrData,
          cardType: 'standard',
          validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
        }
      });
    }
    
    // Mock data if still empty
    if (!healthCard) {
      healthCard = {
        id: 'card_001',
        userId: userId || 'user_001',
        cardNumber: 'IN-LZK4X2-ABCD',
        cardType: 'standard',
        qrData: JSON.stringify({
          cardNumber: 'IN-LZK4X2-ABCD',
          userId: 'user_001',
          platform: 'Swasthya Mitra'
        }),
        bloodGroup: 'O+',
        allergies: JSON.stringify(['Penicillin']),
        chronicConditions: JSON.stringify([]),
        emergencyContact: JSON.stringify({ name: 'Ramesh Kumar', phone: '9876543210', relation: 'Father' }),
        issuedAt: new Date(),
        validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
        status: 'active'
      };
    }
    
    return NextResponse.json({ success: true, healthCard });
    
  } catch (error) {
    console.error('Get health card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch health card' }, { status: 500 });
  }
}

// POST - Create health card
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, patientId, bloodGroup, allergies, chronicConditions, emergencyContact, cardType } = data;
    
    const cardNum = generateCardNumber();
    const qrData = generateQRData(cardNum, userId || patientId || 'unknown');
    
    const healthCard = await db.healthCard.create({
      data: {
        userId,
        patientId,
        cardNumber: cardNum,
        qrData,
        cardType: cardType || 'standard',
        bloodGroup,
        allergies: allergies ? JSON.stringify(allergies) : undefined,
        chronicConditions: chronicConditions ? JSON.stringify(chronicConditions) : undefined,
        emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : undefined,
        validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
      }
    });
    
    return NextResponse.json({ success: true, healthCard });
    
  } catch (error) {
    console.error('Create health card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create health card' }, { status: 500 });
  }
}

// PUT - Update health card
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Health card ID required' }, { status: 400 });
    }
    
    if (updateData.allergies && typeof updateData.allergies !== 'string') {
      updateData.allergies = JSON.stringify(updateData.allergies);
    }
    if (updateData.chronicConditions && typeof updateData.chronicConditions !== 'string') {
      updateData.chronicConditions = JSON.stringify(updateData.chronicConditions);
    }
    if (updateData.emergencyContact && typeof updateData.emergencyContact !== 'string') {
      updateData.emergencyContact = JSON.stringify(updateData.emergencyContact);
    }
    
    const healthCard = await db.healthCard.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, healthCard });
    
  } catch (error) {
    console.error('Update health card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update health card' }, { status: 500 });
  }
}

// DELETE - Deactivate health card
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Health card ID required' }, { status: 400 });
    }
    
    await db.healthCard.update({
      where: { id },
      data: { status: 'suspended' }
    });
    
    return NextResponse.json({ success: true, message: 'Health card deactivated' });
    
  } catch (error) {
    console.error('Delete health card error:', error);
    return NextResponse.json({ success: false, error: 'Failed to deactivate health card' }, { status: 500 });
  }
}
