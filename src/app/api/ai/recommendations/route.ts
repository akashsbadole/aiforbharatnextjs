import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { patientId, context } = data;

    const gemini = await GeminiService.create();

    let patient = null;
    if (patientId) {
      patient = await db.patient.findUnique({
        where: { id: patientId },
        include: { vaccinations: true, healthRecords: { take: 5, orderBy: { recordDate: 'desc' } } }
      });
    }

    const prompt = `Generate health recommendations for:
${JSON.stringify({ patient: patient ? { age: patient.age, gender: patient.gender, conditions: patient.chronicConditions, isHighRisk: patient.isHighRisk } : null, context }, null, 2)}

Respond as JSON:
{"personalizedRecommendations":[{"category":"preventive|lifestyle|diet","priority":"high|medium|low","title":"","description":"","action":"","timeline":""}],"upcomingScreenings":[],"dietRecommendations":{"include":[],"avoid":[],"localFoods":[]},"exerciseRecommendations":{"type":"","duration":"","frequency":""},"warningSigns":[{"symptom":"","action":"","urgency":"immediate|24hours|week"}],"schemeEligibility":[],"summary":""}`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'assistant', content: 'You are a personalized health AI for India.' },
      { role: 'user', content: prompt }
    ]);

    const response = completion.choices[0]?.message?.content || '{}';
    let recommendations;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackRecs(patient);
    } catch {
      recommendations = generateFallbackRecs(patient);
    }

    return NextResponse.json({ success: true, recommendations });

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ success: false, error: 'Failed', recommendations: generateFallbackRecs(null) }, { status: 500 });
  }
}

function generateFallbackRecs(patient: any) {
  const recs = [{ category: 'preventive', priority: 'high', title: 'Annual Checkup', description: 'Schedule health checkup', action: 'Book at PHC', timeline: '30 days' }];
  if (patient?.age > 50) recs.push({ category: 'screening', priority: 'high', title: 'Diabetes Screening', description: 'Regular screening', action: 'Monthly check', timeline: 'Monthly' });
  if (patient?.pregnancyDueDate) recs.push({ category: 'preventive', priority: 'high', title: 'ANC Checkup', description: 'Prenatal care', action: 'Visit facility', timeline: 'As scheduled' });
  return {
    personalizedRecommendations: recs,
    upcomingScreenings: [],
    dietRecommendations: { include: ['Vegetables', 'Fruits'], avoid: ['Sugar'], localFoods: ['Dal', 'Roti'] },
    exerciseRecommendations: { type: 'Walking', duration: '30 min', frequency: 'Daily' },
    warningSigns: [{ symptom: 'High fever', action: 'Visit PHC', urgency: '24hours' }],
    schemeEligibility: [{ scheme: 'PMJAY', eligibility: 'SECC based', benefit: '5 lakh', howToApply: 'pmjay.gov.in' }],
    summary: 'Focus on preventive care.'
  };
}
