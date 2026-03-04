import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import GeminiService from '@/lib/gemini-service';

// Create emergency alert
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, description, latitude, longitude, address, district, userId, patientId } = data;

    // Generate AI first aid advice
    let aiFirstAidAdvice = '';
    try {
      const gemini = await GeminiService.create();
      const completion = await gemini.chatCompletionsCreate([
        {
          role: 'assistant',
          content: `You are an emergency medical advisor. Provide concise, step-by-step first aid instructions for the following emergency. Keep it brief and actionable. Do NOT use markdown formatting. Provide plain text instructions only.`
        },
        {
          role: 'user',
          content: `Emergency type: ${type}\nDescription: ${description}\n\nProvide immediate first aid steps.`
        }
      ]);
      aiFirstAidAdvice = completion.choices[0]?.message?.content || '';
    } catch (e) {
      console.error('AI advice generation failed:', e);
    }

    // Create emergency record
    const emergency = await db.emergency.create({
      data: {
        type,
        description,
        severity: 'high',
        latitude,
        longitude,
        address,
        district,
        userId,
        patientId,
        status: 'active',
        aiFirstAidAdvice
      }
    });

    return NextResponse.json({
      success: true,
      emergency,
      message: 'Emergency alert sent successfully',
      helplines: {
        ambulance: '108',
        police: '100',
        women_helpline: '181',
        child_helpline: '1098'
      }
    });

  } catch (error) {
    console.error('Emergency creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create emergency alert'
    }, { status: 500 });
  }
}

// Get emergency by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const district = searchParams.get('district');

    if (id) {
      const emergency = await db.emergency.findUnique({
        where: { id }
      });
      return NextResponse.json({
        success: true,
        emergency
      });
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (district) where.district = district;

    const emergencies = await db.emergency.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      emergencies,
      total: emergencies.length
    });

  } catch (error) {
    console.error('Fetch emergencies error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch emergencies'
    }, { status: 500 });
  }
}

// Update emergency status
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, responderId } = data;

    const updateData: Record<string, unknown> = { status };
    if (status === 'responded') {
      updateData.responderId = responderId;
      updateData.responseTime = new Date();
    }
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const emergency = await db.emergency.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      emergency
    });

  } catch (error) {
    console.error('Update emergency error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update emergency'
    }, { status: 500 });
  }
}
