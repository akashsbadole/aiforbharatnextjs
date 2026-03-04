import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Test users with different roles
const testUsers = [
  {
    name: 'Rahul Kumar',
    phone: '9876543210',
    email: 'rahul@example.com',
    password: 'test123',
    role: 'citizen',
    language: 'hi',
    district: 'Lucknow',
    state: 'Uttar Pradesh'
  },
  {
    name: 'Priya Sharma',
    phone: '9876543211',
    email: 'priya@example.com',
    password: 'test123',
    role: 'health_worker',
    language: 'hi',
    district: 'Varanasi',
    state: 'Uttar Pradesh'
  },
  {
    name: 'Dr. Amit Verma',
    phone: '9876543212',
    email: 'dr.amit@example.com',
    password: 'test123',
    role: 'doctor',
    language: 'en',
    district: 'Delhi',
    state: 'Delhi'
  },
  {
    name: 'Admin User',
    phone: '9876543213',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    language: 'en',
    district: 'Mumbai',
    state: 'Maharashtra'
  }
];

export async function POST(req: NextRequest) {
  try {
    const results = [];
    
    for (const userData of testUsers) {
      const existingUser = await db.user.findUnique({
        where: { phone: userData.phone }
      });
      
      if (existingUser) {
        results.push({ phone: userData.phone, status: 'already_exists', role: existingUser.role });
        continue;
      }
      
      const user = await db.user.create({
        data: {
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          role: userData.role as 'citizen' | 'health_worker' | 'doctor' | 'admin',
          language: userData.language,
          district: userData.district,
          state: userData.state
        }
      });
      
      results.push({ phone: userData.phone, status: 'created', role: user.role, name: user.name });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test users seeded successfully',
      users: results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed users'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    testCredentials: testUsers.map(u => ({
      phone: u.phone,
      password: u.password,
      role: u.role,
      name: u.name
    }))
  });
}
