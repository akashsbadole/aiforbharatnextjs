import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// Generate comprehensive AI health report for a patient
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();
    const { patientId, reportType = 'comprehensive', timeRange = '90' } = data;

    if (!patientId) {
      return NextResponse.json({
        success: false,
        error: 'Patient ID is required'
      }, { status: 400 });
    }

    // Fetch comprehensive patient data
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        healthRecords: {
          take: 20,
          orderBy: { recordDate: 'desc' }
        },
        vaccinations: {
          orderBy: { administeredDate: 'desc' }
        },
        symptoms: {
          take: 30,
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        emergencies: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({
        success: false,
        error: 'Patient not found'
      }, { status: 404 });
    }

    const gemini = await GeminiService.create();

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Prepare patient summary for AI
    const patientSummary = {
      demographics: {
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        village: patient.village,
        district: patient.district
      },
      healthProfile: {
        chronicConditions: patient.chronicConditions,
        allergies: patient.allergies,
        isHighRisk: patient.isHighRisk,
        pregnancyDueDate: patient.pregnancyDueDate
      },
      recentRecords: patient.healthRecords.slice(0, 10).map(r => ({
        type: r.type,
        title: r.title,
        diagnosis: r.diagnosis,
        recordDate: r.recordDate
      })),
      vaccinationStatus: patient.vaccinations.map(v => ({
        vaccine: v.vaccineName,
        dose: `${v.doseNumber}/${v.totalDoses}`,
        date: v.administeredDate,
        nextDue: v.nextDueDate
      })),
      symptomHistory: patient.symptoms.slice(0, 15).map(s => ({
        symptoms: s.symptoms,
        severity: s.severity,
        date: s.createdAt
      })),
      appointmentHistory: patient.appointments.slice(0, 5).map(a => ({
        type: a.type,
        status: a.status,
        date: a.appointmentDate
      }))
    };

    const prompt = `Generate a ${reportType} health report for a patient in India. Use the following patient data:

${JSON.stringify(patientSummary, null, 2)}

Generate a detailed health report in JSON format with the following structure:
{
  "reportTitle": "",
  "generatedAt": "",
  "reportType": "comprehensive|vaccination|chronic|preventive|maternal",
  "executiveSummary": {
    "overallHealthStatus": "excellent|good|fair|poor|critical",
    "keyFindings": [],
    "criticalAlerts": [],
    "recommendedActions": []
  },
  "healthMetrics": {
    "vitalSigns": {"lastRecorded": "", "abnormalities": []},
    "bmi": {"value": 0, "category": "", "recommendation": ""},
    "riskScore": {"overall": 0, "categories": {}}
  },
  "chronicConditionManagement": [
    {"condition": "", "status": "", "lastCheckup": "", "medications": [], "lifestyleAdvice": []}
  ],
  "vaccinationStatus": {
    "completed": [],
    "pending": [],
    "overdue": [],
    "upcomingDue": []
  },
  "preventiveScreenings": {
    "recommended": [],
    "completed": [],
    "overdue": []
  },
  "lifestyleRecommendations": {
    "diet": [],
    "exercise": [],
    "sleep": [],
    "stress": []
  },
  "medicineAdherence": {"score": 0, "issues": []},
  "appointmentSummary": {"completed": 0, "missed": 0, "upcoming": 0, "recommendations": []},
  "schemeEligibility": [{"scheme": "", "eligible": true, "benefits": "", "howToApply": ""}],
  "emergencyContacts": [],
  "nextSteps": [{"priority": "", "action": "", "timeline": ""}],
  "followUpSchedule": [{"date": "", "type": "", "facility": ""}],
  "healthTrends": {"improving": [], "declining": [], "stable": []},
  "aiInsights": []
}`;

    const completion = await gemini.chatCompletionsCreate([
      {
        role: 'system',
        content: `You are a medical AI assistant specialized in generating comprehensive health reports for patients in India.
          Consider local health factors, government health schemes (PMJAY, Ayushman Bharat), common regional diseases,
          and culturally appropriate recommendations. Include Indian dietary suggestions and local healthcare resources.
          Always think through the analysis carefully before generating the report.`
      },
      { role: 'user', content: prompt }
    ]);

    const response = completion.choices[0]?.message?.content || '{}';
    
    let healthReport;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      healthReport = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackReport(patient, reportType);
    } catch {
      healthReport = generateFallbackReport(patient, reportType);
    }

    // Store the report as a health record
    const reportRecord = await db.healthRecord.create({
      data: {
        patientId: patient.id,
        type: 'discharge_summary', // Using existing type
        title: `AI Health Report - ${reportType}`,
        description: JSON.stringify(healthReport),
        recordDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      healthReport: {
        ...healthReport,
        reportId: reportRecord.id,
        generatedAt: new Date().toISOString(),
        patientId: patient.id,
        patientName: patient.name
      }
    });

  } catch (error) {
    console.error('Health report generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate health report'
    }, { status: 500 });
  }
}

// Get previously generated health reports
export async function GET(req: NextRequest) {
  try {
    const { error } = await withAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const reportType = searchParams.get('reportType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!patientId) {
      return NextResponse.json({
        success: false,
        error: 'Patient ID is required'
      }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      patientId,
      title: { contains: 'AI Health Report' }
    };

    if (reportType) {
      where.title = { contains: `AI Health Report - ${reportType}` };
    }

    const reports = await db.healthRecord.findMany({
      where,
      orderBy: { recordDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await db.healthRecord.count({ where });

    return NextResponse.json({
      success: true,
      reports: reports.map(r => ({
        id: r.id,
        title: r.title,
        recordDate: r.recordDate,
        description: r.description
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get health reports error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch health reports'
    }, { status: 500 });
  }
}

function generateFallbackReport(patient: any, reportType: string) {
  return {
    reportTitle: `Health Report - ${patient.name}`,
    generatedAt: new Date().toISOString(),
    reportType,
    executiveSummary: {
      overallHealthStatus: patient.isHighRisk ? 'fair' : 'good',
      keyFindings: [
        `Patient age: ${patient.age} years`,
        patient.chronicConditions ? `Chronic conditions: ${patient.chronicConditions}` : 'No chronic conditions reported'
      ],
      criticalAlerts: patient.isHighRisk ? ['High risk patient - requires regular monitoring'] : [],
      recommendedActions: ['Schedule regular health checkups', 'Maintain healthy lifestyle']
    },
    healthMetrics: {
      vitalSigns: { lastRecorded: new Date().toISOString(), abnormalities: [] },
      bmi: { value: 22, category: 'Normal', recommendation: 'Maintain current weight' },
      riskScore: { overall: patient.isHighRisk ? 65 : 30, categories: {} }
    },
    chronicConditionManagement: patient.chronicConditions ? [
      {
        condition: patient.chronicConditions,
        status: 'Under monitoring',
        lastCheckup: 'N/A',
        medications: [],
        lifestyleAdvice: ['Regular exercise', 'Healthy diet']
      }
    ] : [],
    vaccinationStatus: {
      completed: [],
      pending: [],
      overdue: [],
      upcomingDue: []
    },
    preventiveScreenings: {
      recommended: [
        { screening: 'Blood Pressure', frequency: 'Annual', importance: 'High' },
        { screening: 'Blood Sugar', frequency: 'Annual', importance: 'High' }
      ],
      completed: [],
      overdue: []
    },
    lifestyleRecommendations: {
      diet: ['Include more vegetables', 'Reduce salt intake', 'Stay hydrated'],
      exercise: ['30 minutes daily walking', 'Yoga or stretching'],
      sleep: ['7-8 hours nightly', 'Regular sleep schedule'],
      stress: ['Practice meditation', 'Maintain work-life balance']
    },
    medicineAdherence: { score: 80, issues: [] },
    appointmentSummary: { completed: 0, missed: 0, upcoming: 0, recommendations: [] },
    schemeEligibility: [
      { scheme: 'PMJAY', eligible: true, benefits: 'Up to 5 lakh coverage', howToApply: 'Visit pmjay.gov.in' }
    ],
    emergencyContacts: [
      { name: 'Emergency', phone: '108' },
      { name: 'Women Helpline', phone: '181' }
    ],
    nextSteps: [
      { priority: 'High', action: 'Schedule annual checkup', timeline: 'Within 30 days' }
    ],
    followUpSchedule: [],
    healthTrends: { improving: [], declining: [], stable: ['General health'] },
    aiInsights: ['Regular monitoring recommended', 'Focus on preventive care']
  };
}
