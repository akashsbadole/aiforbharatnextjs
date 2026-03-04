import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Submit feedback for a chat message
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      sessionId, 
      messageId, 
      rating, 
      wasHelpful, 
      feedbackText,
      userId,
      intelligenceLevel,
      agentRole
    } = data;

    if (!sessionId || !messageId || rating === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Save feedback to database
    const feedback = await db.feedback.create({
      data: {
        type: 'feedback',
        subject: `Chat Feedback - Session ${sessionId}`,
        description: JSON.stringify({
          messageId,
          rating,
          wasHelpful,
          feedbackText,
          intelligenceLevel,
          agentRole
        }),
        userId: userId || null,
        status: 'pending'
      }
    });

    // Analyze feedback patterns for self-improvement
    const recentFeedback = await db.feedback.findMany({
      where: {
        type: 'feedback',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Calculate improvement insights
    const totalFeedback = recentFeedback.length;
    const positiveFeedback = recentFeedback.filter(f => {
      try {
        const data = JSON.parse(f.description);
        return data.rating >= 4;
      } catch {
        return false;
      }
    }).length;

    const insights = {
      totalFeedback,
      positiveRate: totalFeedback > 0 ? (positiveFeedback / totalFeedback * 100).toFixed(1) : 0,
      improvementNeeded: totalFeedback > 0 && (positiveFeedback / totalFeedback) < 0.7
    };

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: 'Thank you for your feedback! It helps us improve.',
      insights
    });

  } catch (error) {
    console.error('Feedback error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save feedback'
    }, { status: 500 });
  }
}

// Get feedback analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const userId = searchParams.get('userId');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: Record<string, unknown> = {
      type: 'feedback',
      createdAt: { gte: startDate }
    };

    if (userId) {
      where.userId = userId;
    }

    const feedbackData = await db.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Parse and analyze feedback
    const parsed = feedbackData.map(f => {
      try {
        return JSON.parse(f.description);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const ratings = parsed.map(p => p.rating).filter(r => r !== undefined);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    const helpfulCount = parsed.filter(p => p.wasHelpful).length;
    const helpfulRate = parsed.length > 0 
      ? (helpfulCount / parsed.length * 100).toFixed(1) 
      : 0;

    // Group by intelligence level
    const byIntelligenceLevel: Record<number, { count: number; avgRating: number }> = {};
    parsed.forEach(p => {
      if (p.intelligenceLevel) {
        const level = p.intelligenceLevel;
        if (!byIntelligenceLevel[level]) {
          byIntelligenceLevel[level] = { count: 0, avgRating: 0 };
        }
        byIntelligenceLevel[level].count++;
        byIntelligenceLevel[level].avgRating += p.rating || 0;
      }
    });

    // Calculate averages for intelligence levels
    Object.keys(byIntelligenceLevel).forEach(level => {
      const data = byIntelligenceLevel[Number(level)];
      data.avgRating = Number((data.avgRating / data.count).toFixed(2));
    });

    // Group by agent role
    const byAgentRole: Record<string, { count: number; avgRating: number }> = {};
    parsed.forEach(p => {
      if (p.agentRole) {
        const role = p.agentRole;
        if (!byAgentRole[role]) {
          byAgentRole[role] = { count: 0, avgRating: 0 };
        }
        byAgentRole[role].count++;
        byAgentRole[role].avgRating += p.rating || 0;
      }
    });

    // Calculate averages for agent roles
    Object.keys(byAgentRole).forEach(role => {
      const data = byAgentRole[role];
      data.avgRating = Number((data.avgRating / data.count).toFixed(2));
    });

    return NextResponse.json({
      success: true,
      analytics: {
        period: `${days} days`,
        totalFeedback: parsed.length,
        averageRating: avgRating.toFixed(2),
        helpfulRate,
        byIntelligenceLevel,
        byAgentRole,
        recentTrend: parsed.slice(0, 10).map(p => ({
          rating: p.rating,
          wasHelpful: p.wasHelpful,
          intelligenceLevel: p.intelligenceLevel
        }))
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, { status: 500 });
  }
}
