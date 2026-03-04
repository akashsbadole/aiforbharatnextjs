import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';

interface SymptomAnalysis {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  possibleConditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  recommendation: string;
  homeRemedies: Array<{
    remedy: string;
    instructions: string;
  }>;
  nearbyFacilities: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
    services: string[];
  }>;
  emergencyAction?: string;
  followUpQuestions?: string[];
  riskFactors?: string[];
  whenToSeekHelp: string[];
  isOutbreakSignal: boolean;
  outbreakType?: string;
  aiConfidence: number;
}

// Symptom severity weights
const severityWeights: Record<string, number> = {
  'difficulty breathing': 10,
  'chest pain': 10,
  'unconscious': 10,
  'severe bleeding': 10,
  'seizure': 10,
  'stroke': 10,
  'high fever': 7,
  'severe pain': 6,
  'vomiting blood': 9,
  'sudden vision loss': 8,
  'severe headache': 5,
  'persistent fever': 5,
  'diarrhea': 4,
  'cough': 2,
  'mild fever': 2,
  'headache': 2,
  'runny nose': 1,
  'mild pain': 1
};

// Outbreak monitoring keywords
const outbreakPatterns = [
  { type: 'dengue', keywords: ['high fever', 'joint pain', 'body ache', 'rash', 'dengue'] },
  { type: 'malaria', keywords: ['high fever', 'chills', 'sweating', 'malaria'] },
  { type: 'chikungunya', keywords: ['joint pain', 'fever', 'rash', 'chikungunya'] },
  { type: 'covid19', keywords: ['breathing difficulty', 'loss of taste', 'loss of smell', 'covid', 'corona'] },
  { type: 'cholera', keywords: ['severe diarrhea', 'watery stool', 'dehydration', 'cholera'] },
  { type: 'typhoid', keywords: ['prolonged fever', 'weakness', 'stomach pain', 'typhoid'] },
  { type: 'hepatitis', keywords: ['jaundice', 'yellow eyes', 'yellow skin', 'hepatitis'] }
];

export async function POST(req: NextRequest) {
  try {
    const { symptoms, language = 'hi', inputType = 'text', transcription, userId, latitude, longitude } = await req.json();

    if (!symptoms && !transcription) {
      return NextResponse.json(
        { success: false, error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    const symptomText = transcription || symptoms;
    const gemini = await GeminiService.create();

    // Analyze symptoms with AI
    const systemPrompt = `You are an expert AI medical triage assistant for India. Analyze symptoms and provide structured assessment.

CRITICAL RULES:
1. Always identify emergency symptoms first
2. Consider common tropical diseases in India
3. Factor in local health infrastructure
4. Provide culturally appropriate home remedies
5. Never diagnose - only suggest possibilities

Analyze symptoms and respond in this JSON format:
{
  "severity": "low|moderate|high|critical",
  "possibleConditions": [{"name": "condition", "probability": 0.8, "description": "brief description"}],
  "recommendation": "Clear action recommendation",
  "homeRemedies": [{"remedy": "name", "instructions": "how to use"}],
  "emergencyAction": "Only if critical - emergency instructions",
  "followUpQuestions": ["questions to better assess"],
  "riskFactors": ["identified risk factors"],
  "whenToSeekHelp": ["warning signs to watch for"],
  "summary": "Brief summary for the patient"
}

EMERGENCY SIGNS (severity: critical):
- Difficulty breathing
- Chest pain
- Severe bleeding
- Unconsciousness
- Seizures
- Signs of stroke
- Severe allergic reaction

Consider common Indian conditions: Dengue, Malaria, Chikungunya, Typhoid, Cholera, Hepatitis, COVID-19, Tuberculosis`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: `Analyze symptoms: "${symptomText}". Language: ${language}. Provide structured analysis.` }
    ]);

    const aiResponse = completion.choices[0]?.message?.content || '';
    
    // Parse AI response
    let analysis: SymptomAnalysis;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysis = {
          severity: parsed.severity || 'moderate',
          possibleConditions: parsed.possibleConditions || [],
          recommendation: parsed.recommendation || 'Please consult a healthcare professional.',
          homeRemedies: parsed.homeRemedies || [],
          nearbyFacilities: [],
          followUpQuestions: parsed.followUpQuestions || [],
          riskFactors: parsed.riskFactors || [],
          whenToSeekHelp: parsed.whenToSeekHelp || ['Symptoms worsen', 'New symptoms develop'],
          isOutbreakSignal: false,
          aiConfidence: 0.85
        };
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      analysis = {
        severity: 'moderate',
        possibleConditions: [{ name: 'Requires Medical Evaluation', probability: 0.5, description: 'Symptoms need professional assessment' }],
        recommendation: 'Please consult a healthcare professional for proper diagnosis.',
        homeRemedies: [
          { remedy: 'Rest', instructions: 'Get adequate rest and avoid strenuous activity' },
          { remedy: 'Hydration', instructions: 'Drink plenty of fluids' }
        ],
        nearbyFacilities: [],
        whenToSeekHelp: ['Symptoms worsen', 'Fever increases', 'New symptoms develop'],
        isOutbreakSignal: false,
        aiConfidence: 0.6
      };
    }

    // Calculate severity score
    const severityScore = calculateSeverityScore(symptomText);
    if (severityScore > 8) analysis.severity = 'critical';
    else if (severityScore > 5) analysis.severity = 'high';
    else if (severityScore > 2) analysis.severity = 'moderate';

    // Check for outbreak signals
    const outbreakDetection = detectOutbreak(symptomText);
    analysis.isOutbreakSignal = outbreakDetection.isOutbreak;
    analysis.outbreakType = outbreakDetection.type;

    // Fetch nearby facilities
    try {
      let facilitiesQuery: Record<string, unknown> = {};
      
      if (analysis.severity === 'critical' || analysis.severity === 'high') {
        facilitiesQuery = { type: 'District Hospital' };
      } else if (analysis.severity === 'moderate') {
        facilitiesQuery = { type: { in: ['CHC', 'District Hospital'] } };
      }
      
      const facilities = await db.healthFacility.findMany({
        where: facilitiesQuery,
        take: 5
      });
      
      analysis.nearbyFacilities = facilities.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        distance: 0, // Would calculate with actual coordinates
        services: JSON.parse(f.services || '[]')
      }));
    } catch {
      analysis.nearbyFacilities = [
        { id: '1', name: 'Primary Health Center', type: 'PHC', distance: 2.5, services: ['General Medicine', 'Vaccination'] },
        { id: '2', name: 'Community Health Center', type: 'CHC', distance: 5.0, services: ['Emergency', 'Maternity', 'Pediatrics'] }
      ];
    }

    // Add emergency action for critical cases
    if (analysis.severity === 'critical') {
      analysis.emergencyAction = '🚨 EMERGENCY: Call 108 immediately or go to nearest hospital. Do not drive yourself.';
    }

    // Save symptom report to database
    let symptomReport = null;
    try {
      symptomReport = await db.symptomReport.create({
        data: {
          userId: userId || null,
          symptoms: JSON.stringify(symptomText.split(',').map(s => s.trim())),
          inputType,
          transcription: transcription || null,
          latitude: latitude || null,
          longitude: longitude || null,
          aiDiagnosis: JSON.stringify(analysis),
          severity: analysis.severity,
          recommendation: analysis.recommendation,
          homeRemedies: JSON.stringify(analysis.homeRemedies),
          isOutbreakSignal: analysis.isOutbreakSignal,
          outbreakType: analysis.outbreakType
        }
      });

      // If outbreak signal, create alert
      if (analysis.isOutbreakSignal && analysis.outbreakType) {
        await createOutbreakAlert(analysis.outbreakType, userId);
      }
    } catch {
      // Failed to save, continue
    }

    return NextResponse.json({
      success: true,
      analysis,
      originalSymptoms: symptomText,
      language,
      inputType,
      symptomReportId: symptomReport?.id,
      timestamp: new Date().toISOString(),
      emergencyNumbers: {
        ambulance: '108',
        emergency: '112',
        poison: '1066'
      }
    });

  } catch (error) {
    console.error('Symptom check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze symptoms. Please try again.',
      analysis: {
        severity: 'moderate',
        possibleConditions: [],
        recommendation: 'Please consult a healthcare professional for proper diagnosis.',
        homeRemedies: [],
        nearbyFacilities: [],
        whenToSeekHelp: ['Symptoms worsen'],
        isOutbreakSignal: false,
        aiConfidence: 0
      },
      emergencyNumbers: { ambulance: '108', emergency: '112' }
    }, { status: 500 });
  }
}

function calculateSeverityScore(symptoms: string): number {
  const lowerSymptoms = symptoms.toLowerCase();
  let score = 0;
  
  for (const [symptom, weight] of Object.entries(severityWeights)) {
    if (lowerSymptoms.includes(symptom)) {
      score = Math.max(score, weight);
    }
  }
  
  // Additional scoring for multiple symptoms
  const symptomCount = symptoms.split(/[,&]/).length;
  if (symptomCount > 3) score += 1;
  
  return score;
}

function detectOutbreak(symptoms: string): { isOutbreak: boolean; type?: string } {
  const lowerSymptoms = symptoms.toLowerCase();
  
  for (const pattern of outbreakPatterns) {
    const matchCount = pattern.keywords.filter(kw => lowerSymptoms.includes(kw)).length;
    if (matchCount >= 2) {
      return { isOutbreak: true, type: pattern.type };
    }
  }
  
  return { isOutbreak: false };
}

async function createOutbreakAlert(outbreakType: string, _userId?: string) {
  try {
    await db.alert.create({
      data: {
        title: `Potential ${outbreakType.toUpperCase()} Outbreak Signal`,
        message: `AI has detected symptoms consistent with ${outbreakType}. Please monitor and verify.`,
        type: 'outbreak',
        priority: 'high',
        targetType: 'district',
        status: 'active'
      }
    });
  } catch {
    // Failed to create alert
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  try {
    const reports = await db.symptomReport.findMany({
      where: userId ? { userId } : {},
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      reports
    });
  } catch {
    return NextResponse.json({
      success: true,
      reports: []
    });
  }
}
