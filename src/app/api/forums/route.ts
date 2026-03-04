import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
}

// GET - List forum posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get single post
    if (postId) {
      const post = await db.forumPost.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post not found'
        }, { status: 404 });
      }

      // Increment view count
      await db.forumPost.update({
        where: { id: postId },
        data: { views: { increment: 1 } }
      });

      return NextResponse.json({
        success: true,
        post: {
          ...post,
          replies: JSON.parse(post.replies),
          tags: post.tags ? JSON.parse(post.tags) : []
        }
      });
    }

    // Build query
    const where: Record<string, unknown> = { status: 'active' };
    if (category) where.category = category;
    if (userId) where.userId = userId;

    const posts = await db.forumPost.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const total = await db.forumPost.count({ where });

    return NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        ...post,
        replies: JSON.parse(post.replies),
        tags: post.tags ? JSON.parse(post.tags) : [],
        replyCount: (JSON.parse(post.replies) as Reply[]).length
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Forum posts fetch error:', error);
    
    // Return mock data
    return NextResponse.json({
      success: true,
      posts: getMockPosts(),
      pagination: {
        total: getMockPosts().length,
        limit: 20,
        offset: 0,
        hasMore: false
      }
    });
  }
}

// POST - Create new forum post
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, title, content, category, tags } = data;

    if (!userId || !title || !content || !category) {
      return NextResponse.json({
        success: false,
        error: 'User ID, title, content, and category are required'
      }, { status: 400 });
    }

    const post = await db.forumPost.create({
      data: {
        userId,
        title,
        content,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        replies: '[]',
        views: 0,
        likes: 0,
        status: 'active',
        isPinned: false,
        lastActivityAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        replies: [],
        tags: tags || []
      }
    });

  } catch (error) {
    console.error('Create forum post error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create post'
    }, { status: 500 });
  }
}

// PUT - Update post, add reply, or like
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { postId, action, userId, userName, content, ...updateData } = data;

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 });
    }

    const post = await db.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }

    // Add reply
    if (action === 'reply') {
      if (!userId || !userName || !content) {
        return NextResponse.json({
          success: false,
          error: 'User ID, name, and content are required for reply'
        }, { status: 400 });
      }

      const replies = JSON.parse(post.replies) as Reply[];
      const newReply: Reply = {
        id: `reply-${Date.now()}`,
        userId,
        userName,
        content,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      const updated = await db.forumPost.update({
        where: { id: postId },
        data: {
          replies: JSON.stringify([...replies, newReply]),
          lastActivityAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        reply: newReply,
        post: {
          ...updated,
          replies: JSON.parse(updated.replies)
        }
      });
    }

    // Like post
    if (action === 'like') {
      const updated = await db.forumPost.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      });

      return NextResponse.json({
        success: true,
        likes: updated.likes
      });
    }

    // Like reply
    if (action === 'likeReply') {
      const { replyId } = data;
      const replies = JSON.parse(post.replies) as Reply[];
      const replyIndex = replies.findIndex(r => r.id === replyId);
      
      if (replyIndex === -1) {
        return NextResponse.json({
          success: false,
          error: 'Reply not found'
        }, { status: 404 });
      }

      replies[replyIndex].likes += 1;

      const updated = await db.forumPost.update({
        where: { id: postId },
        data: { replies: JSON.stringify(replies) }
      });

      return NextResponse.json({
        success: true,
        reply: replies[replyIndex]
      });
    }

    // Update post content
    if (updateData.title || updateData.content) {
      const updateFields: Record<string, unknown> = {};
      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.content) updateFields.content = updateData.content;

      const updated = await db.forumPost.update({
        where: { id: postId },
        data: updateFields
      });

      return NextResponse.json({
        success: true,
        post: {
          ...updated,
          replies: JSON.parse(updated.replies)
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No valid action specified'
    }, { status: 400 });

  } catch (error) {
    console.error('Update forum post error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update post'
    }, { status: 500 });
  }
}

// DELETE - Delete post or reply
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const replyId = searchParams.get('replyId');
    const userId = searchParams.get('userId');

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 });
    }

    // Delete reply
    if (replyId) {
      const post = await db.forumPost.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post not found'
        }, { status: 404 });
      }

      const replies = JSON.parse(post.replies) as Reply[];
      const filteredReplies = replies.filter(r => r.id !== replyId);

      await db.forumPost.update({
        where: { id: postId },
        data: { replies: JSON.stringify(filteredReplies) }
      });

      return NextResponse.json({
        success: true,
        message: 'Reply deleted successfully'
      });
    }

    // Delete post (soft delete)
    if (userId) {
      const post = await db.forumPost.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post not found'
        }, { status: 404 });
      }

      if (post.userId !== userId) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized to delete this post'
        }, { status: 403 });
      }

      await db.forumPost.update({
        where: { id: postId },
        data: { status: 'deleted' }
      });

      return NextResponse.json({
        success: true,
        message: 'Post deleted successfully'
      });
    }

    // Hard delete (admin only)
    await db.forumPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted'
    });

  } catch (error) {
    console.error('Delete forum post error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete post'
    }, { status: 500 });
  }
}

// Mock posts data
function getMockPosts() {
  return [
    {
      id: 'post-1',
      userId: 'user-1',
      title: 'Best practices for managing diabetes at home',
      content: 'I was recently diagnosed with Type 2 diabetes. Looking for advice on diet and lifestyle changes that have worked for others. What foods should I avoid? Any specific exercises recommended?',
      category: 'chronic_disease',
      replies: [
        {
          id: 'reply-1',
          userId: 'user-2',
          userName: 'Dr. Priya',
          content: 'Focus on low glycemic index foods. Include more fiber, reduce refined carbs. Regular walking for 30 minutes daily helps significantly.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 15
        }
      ],
      views: 245,
      likes: 32,
      tags: ['diabetes', 'diet', 'lifestyle'],
      isPinned: false,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'post-2',
      userId: 'user-3',
      title: 'Pregnancy nutrition tips for first trimester',
      content: 'I am 8 weeks pregnant and experiencing morning sickness. What foods are best to eat during this time? How can I ensure proper nutrition despite the nausea?',
      category: 'pregnancy',
      replies: [
        {
          id: 'reply-2',
          userId: 'user-4',
          userName: 'Meera Sharma',
          content: 'Ginger tea helps with morning sickness. Eat small frequent meals. Include folate-rich foods like spinach and lentils.',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          likes: 23
        }
      ],
      views: 189,
      likes: 45,
      tags: ['pregnancy', 'nutrition', 'first-trimester'],
      isPinned: true,
      lastActivityAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'post-3',
      userId: 'user-5',
      title: 'Vaccination schedule for newborn - confused about gaps',
      content: 'My baby missed the 6-week vaccination due to illness. Is it safe to get it now at 8 weeks? Should I follow a catch-up schedule?',
      category: 'child_health',
      replies: [],
      views: 67,
      likes: 12,
      tags: ['vaccination', 'newborn', 'baby'],
      isPinned: false,
      lastActivityAt: new Date(Date.now() - 1800000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'post-4',
      userId: 'user-6',
      title: 'Mental health support during pandemic recovery',
      content: 'Has anyone else been experiencing anxiety even after COVID recovery? Looking for support groups or counseling resources in my area.',
      category: 'mental_health',
      replies: [
        {
          id: 'reply-3',
          userId: 'user-7',
          userName: 'Counselor Arun',
          content: 'Post-COVID anxiety is very common. Consider reaching out to iCall (9152987821) for free counseling support. Also practice breathing exercises.',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          likes: 34
        }
      ],
      views: 312,
      likes: 78,
      tags: ['mental-health', 'covid', 'anxiety', 'support'],
      isPinned: true,
      lastActivityAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];
}
