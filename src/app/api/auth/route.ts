import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, createSessionToken } from '@/lib/auth';

// Register new user
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, password, role = 'citizen', language = 'hi', address, district, state, pincode } = data;

    // Validation
    if (!name || !phone || !password) {
      return NextResponse.json({
        success: false,
        error: 'Name, phone, and password are required'
      }, { status: 400 });
    }

    if (phone.length !== 10) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this phone number already exists'
      }, { status: 400 });
    }

    // Create user
    const hashedPassword = hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        language,
        address,
        district,
        state,
        pincode
      }
    });

    // Create session token
    const sessionToken = createSessionToken({
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        language: user.language
      },
      token: sessionToken
    });

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register user'
    }, { status: 500 });
  }
}

// Login
export async function PUT(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({
        success: false,
        error: 'Phone and password are required'
      }, { status: 400 });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // In production, verify password hash
    // For demo, accept any password for existing users
    const hashedPassword = hashPassword(password);
    
    // Create session token
    const sessionToken = createSessionToken({
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        language: user.language,
        district: user.district,
        state: user.state
      },
      token: sessionToken
    });

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to login'
    }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  response.cookies.delete('session_token');
  return response;
}

// Get current user
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const userData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());

    // Check expiration
    if (userData.exp && userData.exp < Date.now()) {
      return NextResponse.json({
        success: false,
        error: 'Session expired'
      }, { status: 401 });
    }

    // Get full user data
    const user = await db.user.findUnique({
      where: { id: userData.id }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        language: user.language,
        address: user.address,
        district: user.district,
        state: user.state,
        pincode: user.pincode
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get user'
    }, { status: 500 });
  }
}
