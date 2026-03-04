import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface UserData {
  id: string;
  phone: string;
  role: string;
  name: string;
  exp?: number;
}

// Verify admin access
export async function verifyAdmin(req: NextRequest): Promise<{ success: boolean; user?: UserData }> {
  try {
    const sessionToken = req.cookies.get('session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return { success: false };
    }
    
    const userData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    // Check expiration
    if (userData.exp && userData.exp < Date.now()) {
      return { success: false };
    }
    
    // Verify user exists and is admin
    const user = await db.user.findUnique({
      where: { id: userData.id }
    });
    
    if (!user || user.role !== 'admin') {
      return { success: false };
    }
    
    return { success: true, user: userData };
    
  } catch {
    return { success: false };
  }
}

// Verify authenticated user
export async function verifyAuth(req: NextRequest): Promise<{ success: boolean; user?: UserData }> {
  try {
    const sessionToken = req.cookies.get('session_token')?.value ||
                         req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return { success: false };
    }
    
    const userData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    // Check expiration
    if (userData.exp && userData.exp < Date.now()) {
      return { success: false };
    }
    
    return { success: true, user: userData };
    
  } catch {
    return { success: false };
  }
}

// Verify role
export async function verifyRole(req: NextRequest, roles: string[]): Promise<{ success: boolean; user?: UserData }> {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.success || !authResult.user) {
      return { success: false };
    }
    
    if (!roles.includes(authResult.user.role)) {
      return { success: false };
    }
    
    return { success: true, user: authResult.user };
    
  } catch {
    return { success: false };
  }
}
