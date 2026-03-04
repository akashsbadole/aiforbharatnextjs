import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Password hashing
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'swasthya_salt_2024').digest('hex');
}

// Generate session token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify session
export async function verifySession(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                cookies().get('session_token')?.value;
  
  if (!token) {
    return null;
  }

  // In production, use proper session store
  const user = await db.user.findFirst({
    where: {
      // Store session token in a separate table in production
    }
  });

  return null;
}

// Role permissions
export const rolePermissions = {
  citizen: ['view_facilities', 'view_own_records', 'symptom_check', 'book_appointment', 'emergency'],
  health_worker: ['view_patients', 'edit_patients', 'view_alerts', 'create_alerts', 'vaccination', 'all_citizen'],
  doctor: ['view_all_patients', 'edit_health_records', 'prescribe', 'diagnose', 'all_health_worker'],
  admin: ['manage_users', 'manage_facilities', 'view_analytics', 'manage_system', 'all_doctor']
};

// Check permission
export function hasPermission(role: string, permission: string): boolean {
  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [];
  
  // Check hierarchical permissions
  if (permissions.includes(permission)) return true;
  if (permissions.includes('all_citizen') && rolePermissions.citizen.includes(permission)) return true;
  if (permissions.includes('all_health_worker') && 
      (rolePermissions.citizen.includes(permission) || rolePermissions.health_worker.includes(permission))) return true;
  if (permissions.includes('all_doctor') && 
      (rolePermissions.citizen.includes(permission) || 
       rolePermissions.health_worker.includes(permission) || 
       rolePermissions.doctor.includes(permission))) return true;
  
  return false;
}

// Middleware for protected routes
export async function withAuth(req: NextRequest, requiredRole?: string) {
  const sessionToken = req.headers.get('authorization')?.replace('Bearer ', '') ||
                       req.cookies.get('session_token')?.value;

  if (!sessionToken) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }

  // In production, validate against session store
  // For demo, we'll use a simple cookie-based approach
  try {
    const userData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    if (requiredRole && userData.role !== requiredRole && 
        !isHigherRole(userData.role, requiredRole)) {
      return { error: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }), user: null };
    }

    return { error: null, user: userData };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }), user: null };
  }
}

function isHigherRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = ['citizen', 'health_worker', 'doctor', 'admin'];
  return roleHierarchy.indexOf(userRole) > roleHierarchy.indexOf(requiredRole);
}

// Create session token
export function createSessionToken(user: { id: string; phone: string; role: string; name: string }): string {
  const sessionData = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}
