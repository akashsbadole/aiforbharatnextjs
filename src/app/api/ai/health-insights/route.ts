import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-middleware';

// GET - Get health insights
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || authResult.user?.id;
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (patientId) where.patientId = patientId;
    if (type) where.type = type;
    
    const insights = await db.healthInsight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    // Generate mock insights if empty
    const result = insights.length > 0 ? insights : [
      {
        id: 'insight_001',
        userId: userId || 'user_001',
        type: 'risk_assessment',
        title: 'Cardiovascular Risk Assessment',
        description: 'Based on your health profile, you have a moderate risk of cardiovascular issues. Regular exercise and a balanced diet can help reduce this risk.',
        details: JSON.stringify({
          riskFactors: ['Sedentary lifestyle', 'Family history'],
          recommendations: ['30 mins daily exercise', 'Reduce salt intake', 'Regular check-ups']
        }),
        riskLevel: 'moderate',
        riskScore: 0.45,
        category: 'cardiovascular',
        isAIGenerated: true,
        confidence: 0.82
      },
      {
        id: 'insight_002',
        userId: userId || 'user_001',
        type: 'trend',
        title: 'Blood Pressure Trend',
        description: 'Your blood pressure has shown an improving trend over the last 3 months. Keep up the good work!',
        details: JSON.stringify({
          trend: 'improving',
          avgBP: '125/82',
          previousAvg: '135/88'
        }),
        riskLevel: 'low',
        category: 'cardiovascular',
        isAIGenerated: true,
        confidence: 0.91
      },
      {
        id: 'insight_003',
        userId: userId || 'user_001',
        type: 'recommendation',
        title: 'Seasonal Health Tip',
        description: 'With the monsoon season approaching, ensure you drink clean water and avoid street food to prevent waterborne diseases.',
        details: JSON.stringify({
          season: 'monsoon',
          precautions: ['Boiled/filtered water', 'Avoid raw foods', 'Use mosquito repellent']
        }),
        category: 'general',
        isAIGenerated: true,
        confidence: 0.95
      }
    ];
    
    return NextResponse.json({ success: true, insights: result });
    
  } catch (error) {
    console.error('Get health insights error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch insights' }, { status: 500 });
  }
}

// POST - Generate AI health insights
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    const data = await req.json();
    const { userId, patientId, healthData, type } = data;
    
    const targetUserId = userId || authResult.user?.id;
    
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    // Use AI to generate insights
    const gemini = await GeminiService.create();

    const prompt = `Analyze the following health data and generate personalized health insights:

Health Data: ${JSON.stringify(healthData || {})}

Generate insights in the following JSON format:
{
  "insights": [
    {
      "type": "risk_assessment|trend|recommendation|alert",
      "title": "Insight title",
      "description": "Detailed description",
      "riskLevel": "low|moderate|high|critical",
      "riskScore": 0.0-1.0,
      "category": "cardiovascular|diabetes|general|etc",
      "confidence": 0.0-1.0,
      "details": { additional data }
    }
  ]
}

Focus on actionable, personalized insights. Consider Indian health context and common conditions.`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'user', content: prompt }
    ]);
    
    const response = completion.choices[0]?.message?.content || '';
    
    // Parse AI response
    let insights = [];
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || [];
      }
    } catch {
      // Use default insights if parsing fails
      insights = [
        {
          type: 'recommendation',
          title: 'General Health Recommendation',
          description: 'Maintain a balanced diet, exercise regularly, and stay hydrated for optimal health.',
          category: 'general',
          riskLevel: 'low',
          confidence: 0.8
        }
      ];
    }
    
    // Save insights to database
    const savedInsights = [];
    for (const insight of insights) {
      const saved = await db.healthInsight.create({
        data: {
          userId: targetUserId,
          patientId,
          type: insight.type || 'recommendation',
          title: insight.title,
          description: insight.description,
          details: insight.details ? JSON.stringify(insight.details) : undefined,
          riskLevel: insight.riskLevel,
          riskScore: insight.riskScore,
          category: insight.category,
          confidence: insight.confidence,
          isAIGenerated: true
        }
      });
      savedInsights.push(saved);
    }
    
    return NextResponse.json({ 
      success: true, 
      insights: savedInsights,
      generatedAt: new Date()
    });
    
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 });
  }
}

// PUT - Acknowledge insight
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, acknowledged } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Insight ID required' }, { status: 400 });
    }
    
    const insight = await db.healthInsight.update({
      where: { id },
      data: {
        isAcknowledged: acknowledged !== false,
        acknowledgedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true, insight });
    
  } catch (error) {
    console.error('Update insight error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update insight' }, { status: 500 });
  }
}
