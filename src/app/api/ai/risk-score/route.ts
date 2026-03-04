import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { patientId, symptoms, vitals, medicalHistory } = data;

    const gemini = await GeminiService.create();

    let patient = null;
    if (patientId) {
      patient = await db.patient.findUnique({
        where: { id: patientId },
        include: { healthRecords: { take: 5, orderBy: { recordDate: 'desc' } } }
      });
    }

    const prompt = `Analyze health risk for:
${JSON.stringify({ patient: patient ? { age: patient.age, gender: patient.gender, conditions: patient.chronicConditions } : null, symptoms, vitals, medicalHistory }, null, 2)}

Respond as JSON:
{"overallRiskScore":0-100,"riskLevel":"low|moderate|high|critical","riskCategories":{"cardiovascular":{"score":0,"risk":"low"},"respiratory":{"score":0,"risk":"low"},"metabolic":{"score":0,"risk":"low"}},"immediateActions":[],"recommendedTests":[],"warnings":[],"summary":""}`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'assistant', content: 'You are a medical risk assessment AI.' },
      { role: 'user', content: prompt }
    ]);

    const response = completion.choices[0]?.message?.content || '{}';
    let riskAssessment;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      riskAssessment = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackRisk(patient);
    } catch {
      riskAssessment = generateFallbackRisk(patient);
    }

    if (patientId && riskAssessment.overallRiskScore >= 70) {
      await db.patient.update({ where: { id: patientId }, data: { isHighRisk: true } });
      await db.alert.create({
        data: {
          title: 'High Risk Patient',
          message: `Patient scored ${riskAssessment.overallRiskScore}/100`,
          type: 'emergency',
          priority: 'high',
          targetType: 'health_worker'
        }
      });
    }

    return NextResponse.json({ success: true, riskAssessment });

  } catch (error) {
    console.error('Risk error:', error);
    return NextResponse.json({ success: false, error: 'Failed', riskAssessment: generateFallbackRisk(null) }, { status: 500 });
  }
}

function generateFallbackRisk(patient: any) {
  let score = 30;
  if (patient?.age > 60) score += 20;
  if (patient?.chronicConditions?.toLowerCase().includes('diabetes')) score += 15;
  return {
    overallRiskScore: Math.min(100, score),
    riskLevel: score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low',
    riskCategories: { cardiovascular: { score: 30, risk: 'low' }, respiratory: { score: 30, risk: 'low' }, metabolic: { score: 30, risk: 'low' } },
    immediateActions: ['Consult doctor'],
    recommendedTests: ['Health checkup'],
    warnings: [],
    summary: `Risk: ${score}/100`
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  if (!patientId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  
  const records = await db.healthRecord.findMany({ where: { patientId }, orderBy: { recordDate: 'desc' }, take: 20 });
  return NextResponse.json({ success: true, records });
}
