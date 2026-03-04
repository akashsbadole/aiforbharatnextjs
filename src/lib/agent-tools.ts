// Agent Tools for Multi-Intelligence Level Chatbot
// Level 3: Tool-using agent capabilities

import { db } from '@/lib/db';

// Tool definitions
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

// Tool 1: Find nearby health facilities
export const findNearbyFacilitiesTool: Tool = {
  name: 'find_nearby_facilities',
  description: 'Find nearby hospitals, PHCs, CHCs based on location or district. Returns facility details including distance, services, and availability.',
  parameters: {
    district: { type: 'string', description: 'District name to search in' },
    facilityType: { type: 'string', description: 'Type: PHC, CHC, hospital, clinic' },
    service: { type: 'string', description: 'Specific service needed (e.g., emergency, maternity, vaccination)' },
    limit: { type: 'number', description: 'Maximum results to return' }
  },
  execute: async (params) => {
    const { district, facilityType, service, limit = 5 } = params;
    
    const where: Record<string, unknown> = {};
    if (district) where.district = district;
    if (facilityType) where.type = facilityType;
    
    const facilities = await db.healthFacility.findMany({
      where,
      take: Number(limit),
      orderBy: { name: 'asc' }
    });

    // Filter by service if specified
    let filtered = facilities;
    if (service) {
      filtered = facilities.filter(f => 
        f.services.toLowerCase().includes(String(service).toLowerCase())
      );
    }

    return {
      success: true,
      count: filtered.length,
      facilities: filtered.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        address: f.address,
        phone: f.phone,
        emergencyPhone: f.emergencyPhone,
        district: f.district,
        isOpen: f.isOpen,
        crowdLevel: f.crowdLevel,
        services: JSON.parse(f.services || '[]')
      }))
    };
  }
};

// Tool 2: Get patient health records
export const getPatientRecordsTool: Tool = {
  name: 'get_patient_records',
  description: 'Retrieve patient health records, vaccination history, and medical history.',
  parameters: {
    patientId: { type: 'string', description: 'Patient ID', required: true },
    recordType: { type: 'string', description: 'Type of record: all, vaccinations, symptoms, appointments' }
  },
  execute: async (params) => {
    const { patientId, recordType = 'all' } = params;
    
    const result: Record<string, unknown> = { patientId };
    
    if (recordType === 'all' || recordType === 'vaccinations') {
      result.vaccinations = await db.vaccinationRecord.findMany({
        where: { patientId: String(patientId) },
        orderBy: { administeredDate: 'desc' },
        take: 10
      });
    }
    
    if (recordType === 'all' || recordType === 'symptoms') {
      result.symptoms = await db.symptomReport.findMany({
        where: { patientId: String(patientId) },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }
    
    if (recordType === 'all' || recordType === 'appointments') {
      result.appointments = await db.appointment.findMany({
        where: { patientId: String(patientId) },
        orderBy: { appointmentDate: 'desc' },
        take: 10
      });
    }

    return { success: true, records: result };
  }
};

// Tool 3: Check medicine availability
export const checkMedicineAvailabilityTool: Tool = {
  name: 'check_medicine_availability',
  description: 'Check if a medicine is available at nearby facilities or pharmacies.',
  parameters: {
    medicineName: { type: 'string', description: 'Name of the medicine', required: true },
    facilityId: { type: 'string', description: 'Specific facility ID to check' },
    district: { type: 'string', description: 'District to search in' }
  },
  execute: async (params) => {
    const { medicineName, facilityId, district } = params;
    
    const where: Record<string, unknown> = {};
    if (facilityId) where.facilityId = facilityId;
    
    const stocks = await db.medicineStock.findMany({
      where: {
        ...where,
        medicineName: { contains: String(medicineName), mode: 'insensitive' }
      },
      include: { facility: true }
    });

    // Filter by district if specified
    let filtered = stocks;
    if (district) {
      filtered = stocks.filter(s => 
        s.facility.district.toLowerCase() === String(district).toLowerCase()
      );
    }

    return {
      success: true,
      medicine: medicineName,
      availability: filtered.map(s => ({
        facility: s.facility.name,
        district: s.facility.district,
        quantity: s.quantity,
        unit: s.unit,
        expiryDate: s.expiryDate
      }))
    };
  }
};

// Tool 4: Calculate health metrics
export const calculateHealthMetricsTool: Tool = {
  name: 'calculate_health_metrics',
  description: 'Calculate BMI, due dates, dosage, and other health-related calculations.',
  parameters: {
    calculationType: { type: 'string', description: 'Type: bmi, pregnancy_due_date, dosage, water_intake, calorie', required: true },
    inputs: { type: 'object', description: 'Input values for calculation' }
  },
  execute: async (params) => {
    const { calculationType, inputs } = params;
    const data = inputs as Record<string, number>;
    
    let result: Record<string, unknown> = {};
    
    switch (calculationType) {
      case 'bmi':
        if (data.weight && data.height) {
          const bmi = data.weight / ((data.height / 100) ** 2);
          let category = '';
          if (bmi < 18.5) category = 'Underweight';
          else if (bmi < 25) category = 'Normal';
          else if (bmi < 30) category = 'Overweight';
          else category = 'Obese';
          
          result = { bmi: bmi.toFixed(1), category, healthyRange: '18.5 - 24.9' };
        }
        break;
        
      case 'pregnancy_due_date':
        if (data.lastPeriodDate) {
          const lmp = new Date(data.lastPeriodDate as unknown as string);
          const dueDate = new Date(lmp);
          dueDate.setDate(dueDate.getDate() + 280);
          result = { 
            dueDate: dueDate.toISOString().split('T')[0],
            currentWeek: Math.floor((Date.now() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)),
            trimester: Math.ceil(Math.floor((Date.now() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)) / 13)
          };
        }
        break;
        
      case 'water_intake':
        if (data.weight) {
          const liters = (data.weight * 0.033).toFixed(1);
          result = { 
            dailyWaterIntake: `${liters} liters`,
            glasses: Math.ceil(Number(liters) * 4),
            recommendation: 'Drink water throughout the day, not all at once'
          };
        }
        break;
        
      case 'dosage':
        if (data.weight && data.medicineType) {
          // Common pediatric dosage calculations
          const dosePerKg = data.medicineType === 'paracetamol' ? 15 : 10; // mg/kg
          const dose = data.weight * dosePerKg;
          result = {
            recommendedDose: `${dose} mg`,
            frequency: 'Every 4-6 hours as needed',
            maxDailyDose: `${dose * 4} mg`,
            warning: 'Always consult a doctor before giving medication to children'
          };
        }
        break;
        
      default:
        result = { error: 'Unknown calculation type' };
    }

    return { success: true, calculation: calculationType, result };
  }
};

// Tool 5: Check government scheme eligibility
export const checkSchemeEligibilityTool: Tool = {
  name: 'check_scheme_eligibility',
  description: 'Check eligibility for government health schemes like PMJAY, Ayushman Bharat.',
  parameters: {
    schemeName: { type: 'string', description: 'Scheme name: PMJAY, Ayushman Bharat, etc.' },
    criteria: { type: 'object', description: 'User criteria (income, age, category, etc.)' }
  },
  execute: async (params) => {
    const { schemeName, criteria } = params;
    
    const schemes = await db.governmentScheme.findMany({
      where: {
        isActive: true,
        name: schemeName ? { contains: String(schemeName), mode: 'insensitive' } : undefined
      }
    });

    const results = schemes.map(scheme => {
      const eligibilityCriteria = JSON.parse(scheme.eligibilityCriteria || '{}');
      const criteriaData = criteria as Record<string, unknown>;
      
      // Check basic eligibility
      let isEligible = true;
      const reasons: string[] = [];
      
      if (eligibilityCriteria.maxIncome && criteriaData?.income && Number(criteriaData.income) > eligibilityCriteria.maxIncome) {
        isEligible = false;
        reasons.push(`Income exceeds limit of ₹${eligibilityCriteria.maxIncome}`);
      }
      
      if (eligibilityCriteria.minAge && criteriaData?.age && Number(criteriaData.age) < eligibilityCriteria.minAge) {
        isEligible = false;
        reasons.push(`Age must be at least ${eligibilityCriteria.minAge} years`);
      }

      return {
        schemeName: scheme.name,
        isEligible,
        reasons,
        benefits: JSON.parse(scheme.benefits || '[]'),
        coverageAmount: scheme.coverageAmount,
        documents: JSON.parse(scheme.documents || '[]'),
        helpline: scheme.helpline
      };
    });

    return { success: true, schemes: results };
  }
};

// Tool 6: Get vaccination schedule
export const getVaccinationScheduleTool: Tool = {
  name: 'get_vaccination_schedule',
  description: 'Get vaccination schedule for children or adults based on age.',
  parameters: {
    ageInMonths: { type: 'number', description: 'Age in months (for children)' },
    ageInYears: { type: 'number', description: 'Age in years (for adults)' },
    vaccineName: { type: 'string', description: 'Specific vaccine to check' }
  },
  execute: async (params) => {
    const { ageInMonths, ageInYears, vaccineName } = params;
    
    // Indian National Immunization Schedule
    const childSchedule = [
      { age: 'Birth', vaccines: ['BCG', 'Hepatitis B (Birth Dose)', 'OPV (Birth Dose)'] },
      { age: '6 weeks', vaccines: ['Pentavalent-1', 'OPV-1', 'Rotavirus-1', 'PCV-1'] },
      { age: '10 weeks', vaccines: ['Pentavalent-2', 'OPV-2', 'Rotavirus-2'] },
      { age: '14 weeks', vaccines: ['Pentavalent-3', 'OPV-3', 'Rotavirus-3', 'PCV-2'] },
      { age: '6 months', vaccines: ['Vitamin A-1'] },
      { age: '9 months', vaccines: ['Measles/MR-1', 'Vitamin A-2', 'PCV Booster'] },
      { age: '12 months', vaccines: ['JE-1 (in endemic areas)'] },
      { age: '15-18 months', vaccines: ['MR-2', 'DPT Booster-1', 'OPV Booster'] },
      { age: '5 years', vaccines: ['DPT Booster-2'] },
      { age: '10 years', vaccines: ['Tdap', 'HPV (for girls)'] },
      { age: '16 years', vaccines: ['Td'] }
    ];

    const adultSchedule = [
      { age: 'Every year', vaccines: ['Influenza (Flu)'] },
      { age: 'Every 10 years', vaccines: ['Tetanus/Diphtheria'] },
      { age: 'One-time', vaccines: ['Hepatitis B (3 doses)'] },
      { age: 'Age 50+', vaccines: ['Shingles (Herpes Zoster)'] },
      { age: 'Age 65+', vaccines: ['Pneumococcal'] }
    ];

    let dueVaccines: string[] = [];
    let upcomingVaccines: string[] = [];
    
    if (ageInMonths !== undefined) {
      const months = Number(ageInMonths);
      
      // Find due vaccines
      for (const schedule of childSchedule) {
        const scheduleMonth = parseInt(schedule.age) || 0;
        if (scheduleMonth <= months) {
          dueVaccines = dueVaccines.concat(schedule.vaccines);
        } else if (scheduleMonth <= months + 2) {
          upcomingVaccines = upcomingVaccines.concat(schedule.vaccines);
        }
      }
    }

    if (vaccineName) {
      const vaccine = String(vaccineName).toLowerCase();
      const allVaccines = [...childSchedule, ...adultSchedule];
      const found = allVaccines.filter(s => 
        s.vaccines.some(v => v.toLowerCase().includes(vaccine))
      );
      return {
        success: true,
        vaccine: vaccineName,
        schedule: found,
        message: `Found ${found.length} entries for ${vaccineName}`
      };
    }

    return {
      success: true,
      childSchedule: childSchedule,
      adultSchedule: adultSchedule,
      dueVaccines,
      upcomingVaccines
    };
  }
};

// Tool 7: Detect disease outbreak patterns
export const detectOutbreakTool: Tool = {
  name: 'detect_outbreak',
  description: 'Analyze symptom patterns to detect potential disease outbreaks in an area.',
  parameters: {
    district: { type: 'string', description: 'District to analyze', required: true },
    symptoms: { type: 'array', description: 'Symptoms to check' },
    daysLookback: { type: 'number', description: 'Number of days to look back' }
  },
  execute: async (params) => {
    const { district, symptoms, daysLookback = 7 } = params;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(daysLookback));
    
    const reports = await db.symptomReport.findMany({
      where: {
        district: String(district),
        createdAt: { gte: startDate }
      }
    });

    // Analyze symptom patterns
    const symptomCounts: Record<string, number> = {};
    const severityCounts = { low: 0, moderate: 0, high: 0, critical: 0 };
    
    reports.forEach(report => {
      try {
        const reportSymptoms = JSON.parse(report.symptoms || '[]');
        reportSymptoms.forEach((s: string) => {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        });
        severityCounts[report.severity as keyof typeof severityCounts]++;
      } catch {
        // Skip invalid entries
      }
    });

    // Detect potential outbreaks (simplified heuristic)
    const potentialOutbreaks: { disease: string; confidence: number; symptoms: string[] }[] = [];
    
    // Check for dengue-like pattern
    const dengueSymptoms = ['fever', 'headache', 'body pain', 'rash'];
    const dengueMatch = dengueSymptoms.filter(s => symptomCounts[s] && symptomCounts[s] > 3);
    if (dengueMatch.length >= 3) {
      potentialOutbreaks.push({
        disease: 'Dengue',
        confidence: 0.7,
        symptoms: dengueMatch
      });
    }

    // Check for viral fever pattern
    const viralSymptoms = ['fever', 'cough', 'cold', 'body ache'];
    const viralMatch = viralSymptoms.filter(s => symptomCounts[s] && symptomCounts[s] > 5);
    if (viralMatch.length >= 3) {
      potentialOutbreaks.push({
        disease: 'Viral Fever',
        confidence: 0.8,
        symptoms: viralMatch
      });
    }

    return {
      success: true,
      district,
      analysisPeriod: `${daysLookback} days`,
      totalReports: reports.length,
      symptomFrequency: symptomCounts,
      severityDistribution: severityCounts,
      potentialOutbreaks,
      alertLevel: potentialOutbreaks.length > 0 ? 'elevated' : 'normal'
    };
  }
};

// Tool 8: Get doctor availability
export const getDoctorAvailabilityTool: Tool = {
  name: 'get_doctor_availability',
  description: 'Check doctor availability for telemedicine consultations.',
  parameters: {
    specialization: { type: 'string', description: 'Medical specialization needed' },
    date: { type: 'string', description: 'Date for appointment (YYYY-MM-DD)' },
    facilityId: { type: 'string', description: 'Specific facility' }
  },
  execute: async (params) => {
    const { specialization, date, facilityId } = params;
    
    const where: Record<string, unknown> = {
      status: 'active',
      isAvailableOnline: true
    };
    
    if (specialization) {
      where.specialization = { contains: String(specialization), mode: 'insensitive' };
    }
    
    const doctors = await db.doctor.findMany({
      where,
      include: {
        consultations: {
          where: date ? {
            scheduledDate: new Date(String(date))
          } : undefined
        }
      }
    });

    const availableDoctors = doctors.map(doc => {
      const slots = JSON.parse(doc.availability || '{}');
      const bookedSlots = doc.consultations.map(c => c.scheduledTime);
      
      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        qualifications: JSON.parse(doc.qualifications || '[]'),
        experience: doc.yearsOfExperience,
        rating: doc.rating,
        consultationFee: doc.consultationFee,
        videoConsultFee: doc.videoConsultFee,
        languages: JSON.parse(doc.languages || '[]'),
        availableSlots: slots,
        bookedSlots,
        isVerified: doc.isVerified
      };
    });

    return {
      success: true,
      count: availableDoctors.length,
      doctors: availableDoctors
    };
  }
};

// Tool 9: Create emergency alert
export const createEmergencyAlertTool: Tool = {
  name: 'create_emergency_alert',
  description: 'Create an emergency alert for immediate response.',
  parameters: {
    type: { type: 'string', description: 'Emergency type: medical, accident, pregnancy, disaster', required: true },
    description: { type: 'string', description: 'Description of emergency', required: true },
    latitude: { type: 'number', description: 'Location latitude' },
    longitude: { type: 'number', description: 'Location longitude' },
    userId: { type: 'string', description: 'User ID' }
  },
  execute: async (params) => {
    const { type, description, latitude, longitude, userId } = params;
    
    const emergency = await db.emergency.create({
      data: {
        type: String(type),
        description: String(description),
        severity: 'high',
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        userId: userId ? String(userId) : null,
        status: 'active'
      }
    });

    return {
      success: true,
      emergencyId: emergency.id,
      message: 'Emergency alert created successfully',
      emergencyNumbers: {
        ambulance: '108',
        emergency: '112',
        women_helpline: '181',
        child_helpline: '1098'
      }
    };
  }
};

// Tool 10: Save user feedback for learning
export const saveFeedbackTool: Tool = {
  name: 'save_feedback',
  description: 'Save user feedback about AI responses for self-improvement.',
  parameters: {
    sessionId: { type: 'string', description: 'Chat session ID', required: true },
    messageId: { type: 'string', description: 'Message ID being rated' },
    rating: { type: 'number', description: 'Rating 1-5', required: true },
    feedback: { type: 'string', description: 'User feedback text' },
    wasHelpful: { type: 'boolean', description: 'Was the response helpful?' },
    userId: { type: 'string', description: 'User ID' }
  },
  execute: async (params) => {
    const { sessionId, rating, feedback, wasHelpful, userId } = params;
    
    // Store feedback for learning
    const feedbackRecord = await db.feedback.create({
      data: {
        type: 'feedback',
        subject: `Chat Feedback - Session ${sessionId}`,
        description: `Rating: ${rating}/5. ${feedback || ''}`,
        userId: userId ? String(userId) : null,
        status: 'pending'
      }
    });

    return {
      success: true,
      feedbackId: feedbackRecord.id,
      message: 'Thank you for your feedback! It helps us improve.'
    };
  }
};

// All tools registry
export const allTools: Tool[] = [
  findNearbyFacilitiesTool,
  getPatientRecordsTool,
  checkMedicineAvailabilityTool,
  calculateHealthMetricsTool,
  checkSchemeEligibilityTool,
  getVaccinationScheduleTool,
  detectOutbreakTool,
  getDoctorAvailabilityTool,
  createEmergencyAlertTool,
  saveFeedbackTool
];

// Tool executor
export async function executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    return { success: false, error: `Unknown tool: ${name}` };
  }
  
  try {
    return await tool.execute(params);
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Tool execution failed' 
    };
  }
}

// Get tool definitions for AI
export function getToolDefinitions(): Array<{
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}> {
  return allTools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters
  }));
}
