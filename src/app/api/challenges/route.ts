import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Participant {
  userId: string;
  userName: string;
  progress: number;
  completed: boolean;
  joinedAt: string;
  completedAt?: string;
}

// GET - List health challenges
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const challengeId = searchParams.get('challengeId');
    const userId = searchParams.get('userId');

    // Get single challenge
    if (challengeId) {
      const challenge = await db.healthChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        return NextResponse.json({
          success: false,
          error: 'Challenge not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        challenge: {
          ...challenge,
          participants: JSON.parse(challenge.participants)
        }
      });
    }

    // Get user's challenges
    if (userId) {
      const allChallenges = await db.healthChallenge.findMany({
        orderBy: { startDate: 'desc' }
      });

      const userChallenges = allChallenges.filter(c => {
        const participants = JSON.parse(c.participants) as Participant[];
        return participants.some(p => p.userId === userId);
      });

      return NextResponse.json({
        success: true,
        challenges: userChallenges.map(c => ({
          ...c,
          participants: JSON.parse(c.participants)
        }))
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const challenges = await db.healthChallenge.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      challenges: challenges.map(c => ({
        ...c,
        participants: JSON.parse(c.participants)
      })),
      total: challenges.length
    });

  } catch (error) {
    console.error('Health challenges fetch error:', error);
    
    // Return mock data
    return NextResponse.json({
      success: true,
      challenges: getMockChallenges(),
      total: getMockChallenges().length
    });
  }
}

// POST - Create new challenge or join challenge
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { action, challengeId, userId, userName, ...challengeData } = data;

    // Join a challenge
    if (action === 'join' && challengeId && userId) {
      const challenge = await db.healthChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        return NextResponse.json({
          success: false,
          error: 'Challenge not found'
        }, { status: 404 });
      }

      const participants = JSON.parse(challenge.participants) as Participant[];
      
      // Check if already joined
      if (participants.some(p => p.userId === userId)) {
        return NextResponse.json({
          success: false,
          error: 'Already joined this challenge'
        }, { status: 400 });
      }

      const newParticipant: Participant = {
        userId,
        userName: userName || 'Anonymous',
        progress: 0,
        completed: false,
        joinedAt: new Date().toISOString()
      };

      const updated = await db.healthChallenge.update({
        where: { id: challengeId },
        data: {
          participants: JSON.stringify([...participants, newParticipant]),
          totalParticipants: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Successfully joined challenge',
        challenge: {
          ...updated,
          participants: JSON.parse(updated.participants)
        }
      });
    }

    // Create new challenge
    const challenge = await db.healthChallenge.create({
      data: {
        title: challengeData.title,
        description: challengeData.description,
        type: challengeData.type || 'exercise',
        targetValue: challengeData.targetValue || 10000,
        startDate: new Date(challengeData.startDate),
        endDate: new Date(challengeData.endDate),
        durationDays: challengeData.durationDays || 30,
        points: challengeData.points || 100,
        badge: challengeData.badge,
        participants: '[]',
        totalParticipants: 0,
        completions: 0,
        status: challengeData.status || 'upcoming',
        difficulty: challengeData.difficulty || 'medium',
        createdBy: challengeData.createdBy
      }
    });

    return NextResponse.json({
      success: true,
      challenge: {
        ...challenge,
        participants: []
      }
    });

  } catch (error) {
    console.error('Create/join challenge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

// PUT - Update progress or complete challenge
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { challengeId, userId, progress, action } = data;

    if (!challengeId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Challenge ID and User ID are required'
      }, { status: 400 });
    }

    const challenge = await db.healthChallenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return NextResponse.json({
        success: false,
        error: 'Challenge not found'
      }, { status: 404 });
    }

    const participants = JSON.parse(challenge.participants) as Participant[];
    const participantIndex = participants.findIndex(p => p.userId === userId);

    if (participantIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'User not participating in this challenge'
      }, { status: 400 });
    }

    // Update progress
    if (action === 'updateProgress' && progress !== undefined) {
      participants[participantIndex].progress = progress;
      
      // Check if completed
      if (progress >= challenge.targetValue && !participants[participantIndex].completed) {
        participants[participantIndex].completed = true;
        participants[participantIndex].completedAt = new Date().toISOString();
        
        await db.healthChallenge.update({
          where: { id: challengeId },
          data: {
            participants: JSON.stringify(participants),
            completions: { increment: 1 }
          }
        });

        return NextResponse.json({
          success: true,
          completed: true,
          points: challenge.points,
          badge: challenge.badge,
          message: 'Congratulations! You completed the challenge!'
        });
      }

      const updated = await db.healthChallenge.update({
        where: { id: challengeId },
        data: { participants: JSON.stringify(participants) }
      });

      return NextResponse.json({
        success: true,
        progress,
        targetValue: challenge.targetValue,
        percentage: Math.round((progress / challenge.targetValue) * 100),
        challenge: {
          ...updated,
          participants: JSON.parse(updated.participants)
        }
      });
    }

    // Leave challenge
    if (action === 'leave') {
      const filteredParticipants = participants.filter(p => p.userId !== userId);
      
      await db.healthChallenge.update({
        where: { id: challengeId },
        data: {
          participants: JSON.stringify(filteredParticipants),
          totalParticipants: { decrement: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Left challenge successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No valid action specified'
    }, { status: 400 });

  } catch (error) {
    console.error('Update challenge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update challenge'
    }, { status: 500 });
  }
}

// DELETE - Delete challenge
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json({
        success: false,
        error: 'Challenge ID is required'
      }, { status: 400 });
    }

    await db.healthChallenge.delete({
      where: { id: challengeId }
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully'
    });

  } catch (error) {
    console.error('Delete challenge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete challenge'
    }, { status: 500 });
  }
}

// Mock challenges data
function getMockChallenges() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 7);
  
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 23);

  return [
    {
      id: 'challenge-1',
      title: '10,000 Steps Daily Challenge',
      description: 'Walk 10,000 steps every day for 30 days. Improve your cardiovascular health and boost energy levels.',
      type: 'steps',
      targetValue: 10000,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 30,
      points: 500,
      badge: 'Walker Champion',
      participants: [
        { userId: 'u1', userName: 'Rahul', progress: 7500, completed: false, joinedAt: startDate.toISOString() },
        { userId: 'u2', userName: 'Priya', progress: 10000, completed: true, joinedAt: startDate.toISOString() }
      ],
      totalParticipants: 1245,
      completions: 89,
      status: 'active',
      difficulty: 'medium'
    },
    {
      id: 'challenge-2',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily for 2 weeks. Stay hydrated and improve your skin health.',
      type: 'water',
      targetValue: 8,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 14,
      points: 200,
      badge: 'Hydration Hero',
      participants: [],
      totalParticipants: 856,
      completions: 234,
      status: 'active',
      difficulty: 'easy'
    },
    {
      id: 'challenge-3',
      title: 'Sleep Well Challenge',
      description: 'Get 7-8 hours of quality sleep each night for 21 days. Improve your mental health and productivity.',
      type: 'sleep',
      targetValue: 8,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 21,
      points: 400,
      badge: 'Sleep Master',
      participants: [],
      totalParticipants: 567,
      completions: 145,
      status: 'active',
      difficulty: 'medium'
    },
    {
      id: 'challenge-4',
      title: 'Meditation Journey',
      description: 'Practice 15 minutes of meditation daily for 30 days. Reduce stress and improve mental clarity.',
      type: 'meditation',
      targetValue: 15,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 30,
      points: 600,
      badge: 'Zen Master',
      participants: [],
      totalParticipants: 432,
      completions: 67,
      status: 'active',
      difficulty: 'hard'
    },
    {
      id: 'challenge-5',
      title: 'Nutrition Champion',
      description: 'Eat 5 servings of fruits and vegetables daily for 30 days. Boost your immunity and energy.',
      type: 'nutrition',
      targetValue: 5,
      startDate: new Date(now.getTime() + 86400000 * 3).toISOString(),
      endDate: new Date(now.getTime() + 86400000 * 33).toISOString(),
      durationDays: 30,
      points: 450,
      badge: 'Nutrition Champion',
      participants: [],
      totalParticipants: 0,
      completions: 0,
      status: 'upcoming',
      difficulty: 'medium'
    }
  ];
}
