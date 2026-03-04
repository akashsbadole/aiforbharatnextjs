import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get health records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const doctorId = searchParams.get('doctorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Single record
    if (id) {
      const record = await db.healthRecord.findUnique({
        where: { id },
        include: {
          patient: { select: { id: true, name: true, age: true, gender: true, phone: true } },
          labResultsList: true
        }
      });

      return NextResponse.json({
        success: true,
        record
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (doctorId) where.doctorId = doctorId;
    
    if (startDate && endDate) {
      where.recordDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      db.healthRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordDate: 'desc' },
        include: {
          patient: { select: { id: true, name: true, age: true, gender: true } },
          labResultsList: { 
            select: { 
              id: true, 
              testName: true, 
              resultValue: true, 
              isAbnormal: true,
              status: true 
            } 
          }
        }
      }),
      db.healthRecord.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get health records error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch health records'
    }, { status: 500 });
  }
}

// Create health record
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      patientId, userId,
      type, category, title, description,
      fileUrl, fileName, fileType, fileSize,
      doctorId, doctorName, facilityId, facilityName, appointmentId,
      diagnosis, secondaryDiagnoses, icdCode, symptoms,
      bloodPressureSystolic, bloodPressureDiastolic, heartRate, temperature,
      respiratoryRate, oxygenSaturation, weight, height, bmi, bloodGroup,
      prescription, labResults,
      followUpRequired, followUpDate, followUpNotes,
      isPrivate, sharedWith,
      tags,
      recordDate
    } = data;

    if (!title || !type) {
      return NextResponse.json({
        success: false,
        error: 'Title and type are required'
      }, { status: 400 });
    }

    const record = await db.healthRecord.create({
      data: {
        patientId,
        userId,
        type,
        category,
        title,
        description,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        doctorId,
        doctorName,
        facilityId,
        facilityName,
        appointmentId,
        diagnosis,
        secondaryDiagnoses,
        icdCode,
        symptoms: symptoms ? JSON.stringify(symptoms) : null,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        temperature,
        respiratoryRate,
        oxygenSaturation,
        weight,
        height,
        bmi,
        bloodGroup,
        prescription: prescription ? JSON.stringify(prescription) : null,
        labResults: labResults ? JSON.stringify(labResults) : null,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes,
        isPrivate: isPrivate || false,
        sharedWith,
        tags: tags ? JSON.stringify(tags) : null,
        recordDate: recordDate ? new Date(recordDate) : new Date()
      }
    });

    return NextResponse.json({
      success: true,
      record
    });

  } catch (error) {
    console.error('Create health record error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create health record'
    }, { status: 500 });
  }
}

// Update health record
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Record ID required'
      }, { status: 400 });
    }

    // Handle date fields
    if (updateData.recordDate) {
      updateData.recordDate = new Date(updateData.recordDate);
    }
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }

    // Handle JSON fields
    if (updateData.symptoms && Array.isArray(updateData.symptoms)) {
      updateData.symptoms = JSON.stringify(updateData.symptoms);
    }
    if (updateData.prescription && Array.isArray(updateData.prescription)) {
      updateData.prescription = JSON.stringify(updateData.prescription);
    }
    if (updateData.labResults && Array.isArray(updateData.labResults)) {
      updateData.labResults = JSON.stringify(updateData.labResults);
    }
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const record = await db.healthRecord.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      record
    });

  } catch (error) {
    console.error('Update health record error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update health record'
    }, { status: 500 });
  }
}

// Delete health record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Record ID required'
      }, { status: 400 });
    }

    // Delete associated lab results first
    await db.labResult.deleteMany({
      where: { healthRecordId: id }
    });

    await db.healthRecord.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Health record deleted'
    });

  } catch (error) {
    console.error('Delete health record error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete health record'
    }, { status: 500 });
  }
}
