import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth-middleware';

// GET - Generate reports
export async function GET(req: NextRequest) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    
    let report: Record<string, unknown> = {};
    
    switch (reportType) {
      case 'users':
        report = await generateUserReport(dateFilter);
        break;
      case 'consultations':
        report = await generateConsultationReport(dateFilter);
        break;
      case 'emergencies':
        report = await generateEmergencyReport(dateFilter);
        break;
      case 'vaccinations':
        report = await generateVaccinationReport(dateFilter);
        break;
      case 'outbreaks':
        report = await generateOutbreakReport(dateFilter);
        break;
      default:
        report = await generateSummaryReport(dateFilter);
    }
    
    return NextResponse.json({ 
      success: true, 
      reportType,
      generatedAt: new Date(),
      dateRange: { startDate, endDate },
      report
    });
    
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateSummaryReport(dateFilter: Record<string, Date>) {
  const [totalUsers, totalPatients, totalFacilities, totalConsultations, totalEmergencies, totalVaccinations] = await Promise.all([
    db.user.count(),
    db.patient.count(),
    db.healthFacility.count(),
    db.consultation.count({ where: dateFilter.createdAt ? { createdAt: dateFilter } : {} }),
    db.emergency.count({ where: dateFilter.createdAt ? { createdAt: dateFilter } : {} }),
    db.vaccinationRecord.count({ where: dateFilter.createdAt ? { createdAt: dateFilter } : {} })
  ]);
  
  const usersByRole = await db.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  
  return {
    totalUsers,
    totalPatients,
    totalFacilities,
    totalConsultations,
    totalEmergencies,
    totalVaccinations,
    usersByRole: usersByRole.map(r => ({ role: r.role, count: r._count.id })),
    healthScore: calculateHealthScore({ totalUsers, totalPatients, totalConsultations, totalEmergencies, totalVaccinations })
  };
}

async function generateUserReport(dateFilter: Record<string, Date>) {
  const users = await db.user.findMany({
    where: dateFilter.createdAt ? { createdAt: dateFilter } : {},
    select: {
      id: true,
      name: true,
      role: true,
      language: true,
      district: true,
      state: true,
      createdAt: true
    }
  });
  
  const byRole = await db.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  
  const byDistrict = await db.user.groupBy({
    by: ['district'],
    _count: { id: true }
  });
  
  const byLanguage = await db.user.groupBy({
    by: ['language'],
    _count: { id: true }
  });
  
  return {
    totalUsers: users.length,
    users,
    byRole: byRole.map(r => ({ role: r.role, count: r._count.id })),
    byDistrict: byDistrict.filter(d => d.district).map(d => ({ district: d.district, count: d._count.id })),
    byLanguage: byLanguage.map(l => ({ language: l.language, count: l._count.id }))
  };
}

async function generateConsultationReport(dateFilter: Record<string, Date>) {
  const consultations = await db.consultation.findMany({
    where: dateFilter.createdAt ? { createdAt: dateFilter } : {},
    include: {
      doctor: { select: { name: true, specialization: true } }
    }
  });
  
  const byStatus = await db.consultation.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const byType = await db.consultation.groupBy({
    by: ['type'],
    _count: { id: true }
  });
  
  const totalRevenue = consultations.reduce((sum, c) => sum + (c.fee || 0), 0);
  
  return {
    totalConsultations: consultations.length,
    totalRevenue,
    averageFee: consultations.length > 0 ? totalRevenue / consultations.length : 0,
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
    byType: byType.map(t => ({ type: t.type, count: t._count.id })),
    consultations: consultations.slice(0, 100)
  };
}

async function generateEmergencyReport(dateFilter: Record<string, Date>) {
  const emergencies = await db.emergency.findMany({
    where: dateFilter.createdAt ? { createdAt: dateFilter } : {}
  });
  
  const byType = await db.emergency.groupBy({
    by: ['type'],
    _count: { id: true }
  });
  
  const byStatus = await db.emergency.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const bySeverity = await db.emergency.groupBy({
    by: ['severity'],
    _count: { id: true }
  });
  
  return {
    totalEmergencies: emergencies.length,
    byType: byType.map(t => ({ type: t.type, count: t._count.id })),
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
    bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count.id })),
    emergencies: emergencies.slice(0, 100)
  };
}

async function generateVaccinationReport(dateFilter: Record<string, Date>) {
  const vaccinations = await db.vaccinationRecord.findMany({
    where: dateFilter.createdAt ? { createdAt: dateFilter } : {}
  });
  
  const byVaccine = await db.vaccinationRecord.groupBy({
    by: ['vaccineName'],
    _count: { id: true }
  });
  
  const overdue = vaccinations.filter(v => v.nextDueDate && new Date(v.nextDueDate) < new Date()).length;
  
  return {
    totalVaccinations: vaccinations.length,
    overdue,
    byVaccine: byVaccine.map(v => ({ vaccine: v.vaccineName, count: v._count.id })),
    vaccinations: vaccinations.slice(0, 100)
  };
}

async function generateOutbreakReport(dateFilter: Record<string, Date>) {
  const predictions = await db.outbreakPrediction.findMany({
    where: dateFilter.createdAt ? { createdAt: dateFilter } : {}
  });
  
  const byDisease = await db.outbreakPrediction.groupBy({
    by: ['disease'],
    _count: { id: true }
  });
  
  const byRiskLevel = await db.outbreakPrediction.groupBy({
    by: ['riskLevel'],
    _count: { id: true }
  });
  
  return {
    totalPredictions: predictions.length,
    byDisease: byDisease.map(d => ({ disease: d.disease, count: d._count.id })),
    byRiskLevel: byRiskLevel.map(r => ({ riskLevel: r.riskLevel, count: r._count.id })),
    predictions: predictions.slice(0, 50)
  };
}

function calculateHealthScore(data: { totalUsers: number; totalPatients: number; totalConsultations: number; totalEmergencies: number; totalVaccinations: number }) {
  // Simple health score calculation (0-100)
  const userEngagement = Math.min(data.totalConsultations / Math.max(data.totalUsers, 1) * 10, 30);
  const emergencyRate = Math.max(0, 30 - (data.totalEmergencies / Math.max(data.totalPatients, 1) * 100));
  const vaccinationRate = Math.min(data.totalVaccinations / Math.max(data.totalPatients, 1) * 40, 40);
  
  return Math.round(userEngagement + emergencyRate + vaccinationRate);
}
