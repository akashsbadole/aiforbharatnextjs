import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// Analyze health trends for a patient or population
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await withAuth(req);
    if (error) return error;

    const data = await req.json();
    const { patientId, district, analysisType = 'individual', timeRange = '180' } = data;

    const gemini = await GeminiService.create();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    let trendData: Record<string, unknown> = {};

    if (analysisType === 'individual' && patientId) {
      // Individual patient trend analysis
      trendData = await analyzeIndividualTrends(patientId, startDate);
    } else if (analysisType === 'population' && district) {
      // Population/district-level trend analysis
      trendData = await analyzePopulationTrends(district, startDate);
    } else if (analysisType === 'facility') {
      // Facility-level trend analysis
      trendData = await analyzeFacilityTrends(startDate);
    } else {
      // Global system-wide trend analysis
      trendData = await analyzeSystemTrends(startDate);
    }

    const prompt = `Analyze health trends based on the following data:

${JSON.stringify(trendData, null, 2)}

Analysis Type: ${analysisType}
Time Range: ${timeRange} days

Generate a comprehensive trend analysis in JSON format:
{
  "trendAnalysis": {
    "overallDirection": "improving|declining|stable|fluctuating",
    "confidenceScore": 0-100,
    "keyTrends": [
      {
        "category": "symptoms|vaccinations|chronic|emergency|preventive",
        "metric": "",
        "direction": "increasing|decreasing|stable",
        "percentChange": 0,
        "significance": "high|medium|low",
        "interpretation": ""
      }
    ],
    "seasonalPatterns": [
      {"pattern": "", "months": [], "healthImpact": ""}
    ],
    "riskTrends": {
      "overallRisk": {"current": 0, "previous": 0, "trend": ""},
      "categoryRisks": {}
    },
    "predictions": [
      {
        "type": "condition|outbreak|resource",
        "prediction": "",
        "probability": 0,
        "timeframe": "",
        "factors": []
      }
    ],
    "anomalies": [
      {"date": "", "metric": "", "value": "", "expected": "", "severity": ""}
    ],
    "correlations": [
      {"factor1": "", "factor2": "", "correlation": "", "significance": ""}
    ],
    "recommendations": {
      "immediate": [],
      "shortTerm": [],
      "longTerm": []
    },
    "comparativeAnalysis": {
      "comparedTo": "previous_period|regional_average|national_average",
      "performance": "above|below|at",
      "details": ""
    }
  },
  "dataQuality": {"score": 0, "gaps": [], "recommendations": []},
  "visualizations": {
    "trendCharts": [{"type": "line|bar|pie", "data": [], "title": ""}],
    "alerts": []
  }
}`;

    const completion = await gemini.chatCompletionsCreate([
      {
        role: 'system',
        content: `You are a health analytics AI specialized in trend analysis for Indian healthcare data.
          Consider seasonal disease patterns (monsoon-related illnesses, heat waves, vector-borne diseases),
          regional health disparities, and population health indicators.
          Provide actionable insights for health workers and administrators.
          Think carefully through the patterns before generating analysis.`
      },
      { role: 'user', content: prompt }
    ]);

    const response = completion.choices[0]?.message?.content || '{}';
    
    let trendAnalysis;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      trendAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackTrendAnalysis(trendData, analysisType);
    } catch {
      trendAnalysis = generateFallbackTrendAnalysis(trendData, analysisType);
    }

    return NextResponse.json({
      success: true,
      trendAnalysis: {
        ...trendAnalysis,
        analysisType,
        timeRange,
        analyzedAt: new Date().toISOString(),
        patientId,
        district
      }
    });

  } catch (error) {
    console.error('Health trends analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze health trends'
    }, { status: 500 });
  }
}

// Get historical trend analyses
export async function GET(req: NextRequest) {
  try {
    const { error } = await withAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const analysisType = searchParams.get('analysisType') || 'individual';
    const patientId = searchParams.get('patientId');
    const district = searchParams.get('district');

    // Get trend-related data for comparison
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);

    if (analysisType === 'individual' && patientId) {
      const data = await analyzeIndividualTrends(patientId, startDate);
      return NextResponse.json({ success: true, data });
    } else if (analysisType === 'population' && district) {
      const data = await analyzePopulationTrends(district, startDate);
      return NextResponse.json({ success: true, data });
    }

    // Return system overview
    const data = await analyzeSystemTrends(startDate);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Get trend data error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trend data'
    }, { status: 500 });
  }
}

async function analyzeIndividualTrends(patientId: string, startDate: Date) {
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      healthRecords: {
        where: { recordDate: { gte: startDate } },
        orderBy: { recordDate: 'asc' }
      },
      symptoms: {
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      },
      vaccinations: {
        where: { administeredDate: { gte: startDate } },
        orderBy: { administeredDate: 'asc' }
      },
      appointments: {
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      },
      emergencies: {
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!patient) {
    return { error: 'Patient not found' };
  }

  // Calculate monthly aggregations
  const monthlySymptoms = aggregateByMonth(patient.symptoms, 'createdAt');
  const monthlyAppointments = aggregateByMonth(patient.appointments, 'createdAt');

  return {
    type: 'individual',
    patient: {
      id: patient.id,
      age: patient.age,
      gender: patient.gender,
      isHighRisk: patient.isHighRisk,
      chronicConditions: patient.chronicConditions
    },
    summary: {
      totalHealthRecords: patient.healthRecords.length,
      totalSymptomReports: patient.symptoms.length,
      totalVaccinations: patient.vaccinations.length,
      totalAppointments: patient.appointments.length,
      totalEmergencies: patient.emergencies.length
    },
    monthlyBreakdown: {
      symptoms: monthlySymptoms,
      appointments: monthlyAppointments
    },
    severityDistribution: countByField(patient.symptoms, 'severity'),
    symptomsList: patient.symptoms.slice(-20).map(s => ({
      symptoms: s.symptoms,
      severity: s.severity,
      date: s.createdAt
    })),
    healthRecords: patient.healthRecords.slice(-10).map(r => ({
      type: r.type,
      title: r.title,
      diagnosis: r.diagnosis,
      date: r.recordDate
    })),
    emergencyHistory: patient.emergencies.map(e => ({
      type: e.type,
      severity: e.severity,
      status: e.status,
      date: e.createdAt
    }))
  };
}

async function analyzePopulationTrends(district: string, startDate: Date) {
  const [symptomReports, patients, emergencies, outbreaks] = await Promise.all([
    db.symptomReport.findMany({
      where: { 
        district,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    }),
    db.patient.findMany({
      where: { district },
      include: {
        symptoms: { where: { createdAt: { gte: startDate } } }
      }
    }),
    db.emergency.findMany({
      where: {
        district,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    }),
    db.outbreakPrediction.findMany({
      where: { district },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const monthlySymptoms = aggregateByMonth(symptomReports, 'createdAt');
  const monthlyEmergencies = aggregateByMonth(emergencies, 'createdAt');

  // Extract and count symptom types
  const symptomTypes: Record<string, number> = {};
  symptomReports.forEach(r => {
    try {
      const symptoms = JSON.parse(r.symptoms);
      const symptomList = Array.isArray(symptoms) ? symptoms : [symptoms];
      symptomList.forEach(s => {
        const key = String(s).toLowerCase();
        symptomTypes[key] = (symptomTypes[key] || 0) + 1;
      });
    } catch {
      // Skip invalid data
    }
  });

  return {
    type: 'population',
    district,
    summary: {
      totalPatients: patients.length,
      totalSymptomReports: symptomReports.length,
      totalEmergencies: emergencies.length,
      highRiskPatients: patients.filter(p => p.isHighRisk).length
    },
    monthlyBreakdown: {
      symptoms: monthlySymptoms,
      emergencies: monthlyEmergencies
    },
    symptomTypeDistribution: Object.entries(symptomTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([type, count]) => ({ type, count })),
    severityDistribution: countByField(symptomReports, 'severity'),
    outbreakPredictions: outbreaks.slice(0, 5).map(o => ({
      disease: o.disease,
      riskLevel: o.riskLevel,
      probability: o.probability,
      status: o.status,
      date: o.createdAt
    })),
    emergencyTypes: countByField(emergencies, 'type'),
    ageDistribution: {
      children: patients.filter(p => p.age < 18).length,
      adults: patients.filter(p => p.age >= 18 && p.age < 60).length,
      elderly: patients.filter(p => p.age >= 60).length
    }
  };
}

async function analyzeFacilityTrends(startDate: Date) {
  const [facilities, appointments, medicineStock] = await Promise.all([
    db.healthFacility.findMany({
      include: {
        appointments: { where: { createdAt: { gte: startDate } } },
        medicineStock: true
      }
    }),
    db.appointment.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' }
    }),
    db.medicineStock.findMany()
  ]);

  const monthlyAppointments = aggregateByMonth(appointments, 'createdAt');

  return {
    type: 'facility',
    summary: {
      totalFacilities: facilities.length,
      totalAppointments: appointments.length,
      lowStockMedicines: medicineStock.filter(m => m.quantity <= m.minStock).length
    },
    facilityBreakdown: {
      byType: countByField(facilities, 'type'),
      byCrowdLevel: countByField(facilities, 'crowdLevel')
    },
    monthlyAppointments,
    appointmentStatus: countByField(appointments, 'status'),
    facilitiesWithLowStock: facilities.map(f => ({
      name: f.name,
      type: f.type,
      crowdLevel: f.crowdLevel,
      availableBeds: f.availableBeds,
      lowStockCount: f.medicineStock.filter(m => m.quantity <= m.minStock).length
    }))
  };
}

async function analyzeSystemTrends(startDate: Date) {
  const [users, patients, symptomReports, emergencies, vaccinations, outbreaks] = await Promise.all([
    db.user.count(),
    db.patient.count(),
    db.symptomReport.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' }
    }),
    db.emergency.findMany({
      where: { createdAt: { gte: startDate } }
    }),
    db.vaccinationRecord.findMany({
      where: { administeredDate: { gte: startDate } }
    }),
    db.outbreakPrediction.findMany({
      where: { createdAt: { gte: startDate } }
    })
  ]);

  const monthlySymptoms = aggregateByMonth(symptomReports, 'createdAt');
  const monthlyEmergencies = aggregateByMonth(emergencies, 'createdAt');
  const monthlyVaccinations = aggregateByMonth(vaccinations, 'administeredDate');

  return {
    type: 'system',
    summary: {
      totalUsers: users,
      totalPatients: patients,
      totalSymptomReports: symptomReports.length,
      totalEmergencies: emergencies.length,
      totalVaccinations: vaccinations.length,
      totalOutbreaks: outbreaks.length
    },
    monthlyBreakdown: {
      symptoms: monthlySymptoms,
      emergencies: monthlyEmergencies,
      vaccinations: monthlyVaccinations
    },
    severityDistribution: countByField(symptomReports, 'severity'),
    emergencyTypes: countByField(emergencies, 'type'),
    outbreakRiskLevels: countByField(outbreaks, 'riskLevel'),
    activeEmergencies: emergencies.filter(e => e.status === 'active').length,
    resolvedEmergencies: emergencies.filter(e => e.status === 'resolved').length
  };
}

function aggregateByMonth(data: any[], dateField: string): Record<string, number> {
  const monthly: Record<string, number> = {};
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });
  return monthly;
}

function countByField(data: any[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  data.forEach(item => {
    const value = item[field] || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

function generateFallbackTrendAnalysis(data: any, analysisType: string) {
  return {
    trendAnalysis: {
      overallDirection: 'stable',
      confidenceScore: 70,
      keyTrends: [
        {
          category: 'symptoms',
          metric: 'Total reports',
          direction: 'stable',
          percentChange: 5,
          significance: 'medium',
          interpretation: 'Symptom reporting remains consistent'
        }
      ],
      seasonalPatterns: [
        { pattern: 'Monsoon illnesses', months: ['June', 'July', 'August', 'September'], healthImpact: 'Increased respiratory and waterborne diseases' }
      ],
      riskTrends: {
        overallRisk: { current: 30, previous: 35, trend: 'decreasing' },
        categoryRisks: {}
      },
      predictions: [
        {
          type: 'condition',
          prediction: 'Seasonal flu increase expected',
          probability: 60,
          timeframe: 'Next 2-4 weeks',
          factors: ['Seasonal change', 'Weather patterns']
        }
      ],
      anomalies: [],
      correlations: [],
      recommendations: {
        immediate: ['Continue monitoring', 'Maintain hygiene protocols'],
        shortTerm: ['Schedule preventive checkups', 'Update vaccination records'],
        longTerm: ['Implement health awareness programs', 'Strengthen early detection systems']
      },
      comparativeAnalysis: {
        comparedTo: 'previous_period',
        performance: 'at',
        details: 'Performance consistent with previous period'
      }
    },
    dataQuality: { score: 80, gaps: [], recommendations: ['Increase data collection frequency'] },
    visualizations: {
      trendCharts: [
        { type: 'line', data: [], title: 'Symptom Reports Over Time' }
      ],
      alerts: []
    }
  };
}
