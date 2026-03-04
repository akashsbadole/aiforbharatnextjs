import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { district, state, timeRange = '30' } = data;

    const gemini = await GeminiService.create();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const recentSymptoms = await db.symptomReport.findMany({
      where: { createdAt: { gte: startDate }, ...(district && { district }) },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    const prompt = `Predict disease outbreaks for ${district || 'Unknown'}, ${state || 'Unknown'}.
Recent symptoms: ${recentSymptoms.length} reports
Symptom breakdown: ${summarizeSymptoms(recentSymptoms)}

Respond as JSON:
{"predictions":[{"disease":"","probability":0,"riskLevel":"low|moderate|high","affectedAreas":[],"estimatedCases":0,"timeFrame":"","contributingFactors":[],"preventionMeasures":[]}],"overallRiskLevel":"low|moderate|high","keyInsights":[],"recommendations":[]}`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'assistant', content: 'You are an epidemiological AI for India.' },
      { role: 'user', content: prompt }
    ]);

    const response = completion.choices[0]?.message?.content || '{}';
    let prediction;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackPrediction(recentSymptoms.length);
    } catch {
      prediction = generateFallbackPrediction(recentSymptoms.length);
    }

    for (const pred of prediction.predictions || []) {
      await db.outbreakPrediction.create({
        data: {
          disease: pred.disease,
          district: district || 'Unknown',
          state: state || 'Unknown',
          riskLevel: pred.riskLevel,
          probability: pred.probability,
          symptomReports: recentSymptoms.length,
          status: 'predicted'
        }
      });
      if (pred.riskLevel === 'high' || pred.riskLevel === 'critical') {
        await db.alert.create({
          data: {
            title: `${pred.disease} Outbreak Warning`,
            message: `${pred.probability}% probability in ${district}`,
            type: 'outbreak',
            priority: 'high',
            targetType: 'district',
            district
          }
        });
      }
    }

    return NextResponse.json({ success: true, prediction, dataPoints: recentSymptoms.length });

  } catch (error) {
    console.error('Outbreak error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {};
  if (searchParams.get('district')) where.district = searchParams.get('district');
  if (searchParams.get('riskLevel')) where.riskLevel = searchParams.get('riskLevel');

  const predictions = await db.outbreakPrediction.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20 });
  return NextResponse.json({ success: true, predictions });
}

function summarizeSymptoms(symptoms: any[]): string {
  const s: Record<string, number> = {};
  for (const r of symptoms) {
    try {
      const p = JSON.parse(r.symptoms);
      for (const sym of Array.isArray(p) ? p : [p]) s[String(sym).toLowerCase()] = (s[String(sym).toLowerCase()] || 0) + 1;
    } catch { /* skip */ }
  }
  return Object.entries(s).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}:${v}`).join(', ');
}

function generateFallbackPrediction(count: number): any {
  return {
    predictions: [{ disease: 'Seasonal Viral Fever', probability: Math.min(80, 30 + count * 0.5), riskLevel: count > 50 ? 'high' : 'moderate', affectedAreas: [], estimatedCases: Math.floor(count * 1.5), timeFrame: '2-4 weeks', contributingFactors: ['Seasonal'], preventionMeasures: ['Hygiene'] }],
    overallRiskLevel: count > 50 ? 'high' : 'moderate',
    keyInsights: ['Monitoring patterns'],
    recommendations: ['Continue surveillance']
  };
}
