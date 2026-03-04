import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get appointments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const facilityId = searchParams.get('facilityId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const upcoming = searchParams.get('upcoming');

    // Single appointment
    if (id) {
      const appointment = await db.appointment.findUnique({
        where: { id },
        include: {
          patient: true,
          facility: true,
          user: { select: { id: true, name: true, phone: true, email: true } }
        }
      });

      return NextResponse.json({
        success: true,
        appointment
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (facilityId) where.facilityId = facilityId;
    if (doctorId) where.doctorId = doctorId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    if (date) {
      const searchDate = new Date(date);
      where.appointmentDate = {
        gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }
    
    if (startDate && endDate) {
      where.appointmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (upcoming === 'true') {
      where.appointmentDate = { gte: new Date() };
      where.status = { in: ['scheduled', 'confirmed'] };
    }

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
        include: {
          patient: { select: { id: true, name: true, phone: true, age: true, gender: true } },
          facility: { select: { id: true, name: true, type: true, address: true } },
          user: { select: { id: true, name: true, phone: true } }
        }
      }),
      db.appointment.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appointments'
    }, { status: 500 });
  }
}

// Create appointment
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      patientId, patientName, patientPhone, patientAge, patientGender,
      facilityId, doctorId, timeSlotId,
      appointmentDate, appointmentTime, duration, endTime,
      type, mode, reason, symptoms,
      fee, paymentMethod, notes,
      userId
    } = data;

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json({
        success: false,
        error: 'Appointment date and time are required'
      }, { status: 400 });
    }

    // Create or find patient
    let patientRecord = null;
    if (patientId) {
      patientRecord = await db.patient.findUnique({ where: { id: patientId } });
    } else if (patientName && patientPhone) {
      // Create patient record
      patientRecord = await db.patient.create({
        data: {
          name: patientName,
          phone: patientPhone,
          age: patientAge || 0,
          gender: patientGender || 'unknown'
        }
      });
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Check if time slot is available
    if (timeSlotId) {
      const slot = await db.doctorTimeSlot.findUnique({
        where: { id: timeSlotId }
      });
      
      if (!slot || slot.status !== 'available') {
        return NextResponse.json({
          success: false,
          error: 'Selected time slot is not available'
        }, { status: 400 });
      }
    }

    const appointment = await db.appointment.create({
      data: {
        patientId: patientRecord?.id || null,
        facilityId,
        doctorId,
        timeSlotId,
        userId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        endTime,
        duration: duration || 15,
        type: type || 'checkup',
        mode: mode || 'in_person',
        reason,
        symptoms: symptoms ? JSON.stringify(symptoms) : null,
        status: 'scheduled',
        fee,
        paymentStatus: 'pending',
        paymentMethod,
        confirmationCode,
        notes
      },
      include: {
        facility: true,
        patient: true
      }
    });

    // Mark time slot as booked
    if (timeSlotId) {
      await db.doctorTimeSlot.update({
        where: { id: timeSlotId },
        data: { 
          status: 'booked', 
          bookedBy: appointment.id,
          bookedAt: new Date()
        }
      });
    }

    // Update doctor stats
    if (doctorId) {
      await db.doctor.update({
        where: { id: doctorId },
        data: {
          totalConsultations: { increment: 1 },
          totalPatients: { increment: 1 }
        }
      });
    }

    return NextResponse.json({
      success: true,
      appointment,
      confirmationCode
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create appointment'
    }, { status: 500 });
  }
}

// Update appointment
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, action, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Appointment ID required'
      }, { status: 400 });
    }

    // Handle specific actions
    if (action === 'confirm') {
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          status: 'confirmed',
          updatedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, appointment });
    }

    if (action === 'checkin') {
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          status: 'in_progress',
          checkedInAt: new Date(),
          checkInMethod: updateData.checkInMethod || 'staff',
          updatedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, appointment });
    }

    if (action === 'complete') {
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          status: 'completed',
          updatedAt: new Date()
        }
      });
      
      // Free up the time slot
      if (appointment.timeSlotId) {
        await db.doctorTimeSlot.update({
          where: { id: appointment.timeSlotId },
          data: { status: 'completed', bookedBy: null }
        });
      }
      
      return NextResponse.json({ success: true, appointment });
    }

    if (action === 'cancel') {
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: updateData.cancelledBy,
          cancellationReason: updateData.cancellationReason,
          updatedAt: new Date()
        }
      });
      
      // Free up the time slot
      if (appointment.timeSlotId) {
        await db.doctorTimeSlot.update({
          where: { id: appointment.timeSlotId },
          data: { status: 'available', bookedBy: null, bookedAt: null }
        });
      }
      
      return NextResponse.json({ success: true, appointment });
    }

    if (action === 'reschedule') {
      const { newDate, newTime, newTimeSlotId } = updateData;
      
      // Get current appointment
      const currentAppt = await db.appointment.findUnique({
        where: { id },
        select: { timeSlotId: true }
      });
      
      // Free old time slot
      if (currentAppt?.timeSlotId) {
        await db.doctorTimeSlot.update({
          where: { id: currentAppt.timeSlotId },
          data: { status: 'available', bookedBy: null, bookedAt: null }
        });
      }
      
      // Book new time slot
      if (newTimeSlotId) {
        await db.doctorTimeSlot.update({
          where: { id: newTimeSlotId },
          data: { status: 'booked', bookedBy: id, bookedAt: new Date() }
        });
      }
      
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          appointmentDate: new Date(newDate),
          appointmentTime: newTime,
          timeSlotId: newTimeSlotId,
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({ success: true, appointment });
    }

    if (action === 'rate') {
      const { patientRating, patientReview } = updateData;
      const appointment = await db.appointment.update({
        where: { id },
        data: { 
          patientRating,
          patientReview,
          ratedAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Update doctor rating
      if (appointment.doctorId && patientRating) {
        const doctorAppts = await db.appointment.findMany({
          where: { 
            doctorId: appointment.doctorId, 
            patientRating: { not: null } 
          },
          select: { patientRating: true }
        });
        
        const avgRating = doctorAppts.reduce((sum, a) => sum + (a.patientRating || 0), 0) / doctorAppts.length;
        
        await db.doctor.update({
          where: { id: appointment.doctorId },
          data: { 
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: doctorAppts.length
          }
        });
      }
      
      return NextResponse.json({ success: true, appointment });
    }

    // Generic update
    if (updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.appointmentDate);
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update appointment'
    }, { status: 500 });
  }
}

// Delete/Cancel appointment
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Appointment ID required'
      }, { status: 400 });
    }

    // Get appointment to free up time slot
    const appointment = await db.appointment.findUnique({
      where: { id },
      select: { timeSlotId: true }
    });

    // Cancel instead of delete
    await db.appointment.update({
      where: { id },
      data: { 
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Free up time slot
    if (appointment?.timeSlotId) {
      await db.doctorTimeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { status: 'available', bookedBy: null, bookedAt: null }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel appointment'
    }, { status: 500 });
  }
}

// Helper function
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
