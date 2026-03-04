import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - CRM Dashboard Stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const period = searchParams.get('period') || 'today'; // today, week, month

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Enquiry stats
    const [
      totalEnquiries,
      pendingEnquiries,
      inProgressEnquiries,
      resolvedEnquiries,
      todayEnquiries
    ] = await Promise.all([
      db.enquiry.count(),
      db.enquiry.count({ where: { status: 'pending' } }),
      db.enquiry.count({ where: { status: 'in_progress' } }),
      db.enquiry.count({ where: { status: 'resolved' } }),
      db.enquiry.count({ where: { createdAt: { gte: startDate } } })
    ]);

    // Assignment stats
    const [
      totalAssignments,
      assignedPatients,
      inProgressAssignments,
      completedAssignments,
      todayAssignments,
      urgentAssignments
    ] = await Promise.all([
      db.patientAssignment.count(),
      db.patientAssignment.count({ where: { status: 'assigned' } }),
      db.patientAssignment.count({ where: { status: 'in_progress' } }),
      db.patientAssignment.count({ where: { status: 'completed' } }),
      db.patientAssignment.count({ where: { createdAt: { gte: startDate } } }),
      db.patientAssignment.count({ where: { priority: 'urgent', status: { in: ['assigned', 'in_progress'] } } })
    ]);

    // Activity stats
    const [
      totalCalls,
      totalVisits,
      totalConsultations,
      todayActivities
    ] = await Promise.all([
      db.staffActivity.count({ where: { activityType: 'call', createdAt: { gte: startDate } } }),
      db.staffActivity.count({ where: { activityType: 'visit', createdAt: { gte: startDate } } }),
      db.staffActivity.count({ where: { activityType: 'consultation', createdAt: { gte: startDate } } }),
      db.staffActivity.count({ where: { createdAt: { gte: startDate } } })
    ]);

    // Staff-specific stats
    let staffStats = null;
    if (staffId) {
      const [
        myAssignments,
        myPendingAssignments,
        myCompletedToday,
        myActivities
      ] = await Promise.all([
        db.patientAssignment.count({ where: { assignedToId: staffId } }),
        db.patientAssignment.count({ where: { assignedToId: staffId, status: { in: ['assigned', 'in_progress'] } } }),
        db.patientAssignment.count({ 
          where: { 
            assignedToId: staffId, 
            status: 'completed',
            completedDate: { gte: startDate }
          } 
        }),
        db.staffActivity.count({ where: { staffId, createdAt: { gte: startDate } } })
      ]);

      staffStats = {
        myAssignments,
        myPendingAssignments,
        myCompletedToday,
        myActivities
      };
    }

    // Recent items
    const recentEnquiries = await db.enquiry.findMany({
      where: { status: { in: ['pending', 'in_progress'] } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentAssignments = await db.patientAssignment.findMany({
      where: { status: { in: ['assigned', 'in_progress'] } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentActivities = await db.staffActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Staff performance (if admin)
    let staffPerformance = null;
    if (!staffId) {
      const staffMembers = await db.staffActivity.groupBy({
        by: ['staffId', 'staffName', 'staffRole'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      });

      staffPerformance = staffMembers.map(s => ({
        staffId: s.staffId,
        staffName: s.staffName,
        staffRole: s.staffRole,
        activitiesCount: s._count.id
      })).sort((a, b) => b.activitiesCount - a.activitiesCount).slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      period,
      stats: {
        enquiries: {
          total: totalEnquiries,
          pending: pendingEnquiries,
          inProgress: inProgressEnquiries,
          resolved: resolvedEnquiries,
          today: todayEnquiries
        },
        assignments: {
          total: totalAssignments,
          assigned: assignedPatients,
          inProgress: inProgressAssignments,
          completed: completedAssignments,
          today: todayAssignments,
          urgent: urgentAssignments
        },
        activities: {
          calls: totalCalls,
          visits: totalVisits,
          consultations: totalConsultations,
          today: todayActivities
        },
        staff: staffStats,
        staffPerformance
      },
      recent: {
        enquiries: recentEnquiries,
        assignments: recentAssignments,
        activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching CRM dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
