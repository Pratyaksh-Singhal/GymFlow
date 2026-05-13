// lib/auth.ts
// Authentication utilities and JWT handling
import 'dotenv/config';
import { jwtVerify, SignJWT } from 'jose';
import { supabaseAdmin } from './supabase';
import { createClient } from '@supabase/supabase-js';
import prisma from '../lib/prisma.ts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const jwtSecret = process.env.SUPABASE_JWT_SECRET || 'dev-secret';
const SECRET_KEY = new TextEncoder().encode(jwtSecret);

// ============================================================================
// JWT Token Operations
// ============================================================================

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  tenant_id: string;
  user_role: 'owner' | 'trainer' | 'member' | 'super_admin';
  iat: number;
  exp: number;
}

/**
 * Create custom JWT token with tenant and role claims
 */
export async function createJWT(
  userId: string,
  email: string,
  tenantId: string,
  role: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    sub: userId,
    email,
    tenant_id: tenantId,
    user_role: role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify JWT token and extract payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// ============================================================================
// Signup
// ============================================================================

export interface SignupData {
  gymName: string;
  ownerEmail: string;
  ownerName: string;
  password: string;
}

export async function signup(data: SignupData) {
  try {
    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.ownerEmail,
      password: data.password,
      options: {
        data: {
          full_name: data.ownerName,
        },
      },
    });

    if (authError || !authData.user?.id) {
      throw new Error(`Auth signup failed: ${authError?.message}`);
    }

    const userId = authData.user.id;

    // 2. Create Tenant in database
    const slug = data.gymName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);

    const tenant = await prisma.tenant.create({
      data: {
        name: data.gymName,
        slug: `${slug}-${Date.now().toString(36)}`, // Ensure uniqueness
        subscriptionTier: 'free',
      },
    });

    // 3. Create User record (owner)
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: data.ownerEmail,
        tenantId: tenant.id,
        role: 'owner',
      },
    });

    // 4. Create JWT with custom claims
    const jwtToken = await createJWT(
      userId,
      data.ownerEmail,
      tenant.id,
      'owner',
      3600 // 1 hour
    );

    // 5. Create refresh token for longer-lived sessions
    const refreshToken = await createJWT(
      userId,
      data.ownerEmail,
      tenant.id,
      'owner',
      604800 // 7 days
    );

    return {
      success: true,
      user,
      tenant,
      token: jwtToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// ============================================================================
// Login
// ============================================================================

export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData) {
  try {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user?.id) {
      throw new Error(`Login failed: ${authError?.message || 'Unknown error'}`);
    }

    // 2. Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    // 3. Create custom JWT
    const jwtToken = await createJWT(
      user.id,
      user.email,
      user.tenantId,
      user.role,
      3600 // 1 hour
    );

    // 4. Create refresh token (7 days)
    const refreshToken = await createJWT(
      user.id,
      user.email,
      user.tenantId,
      user.role,
      604800 // 7 days
    );

    return {
      success: true,
      user,
      token: jwtToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// ============================================================================
// Refresh Token
// ============================================================================

export async function refreshToken(refreshToken: string) {
  try {
    // Verify refresh token
    const payload = await verifyJWT(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create new JWT (1 hour)
    const newToken = await createJWT(user.id, user.email, user.tenantId, user.role, 3600);

    return {
      success: true,
      token: newToken,
      user,
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}

// ============================================================================
// Password Reset
// ============================================================================

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export async function resetPassword(data: ResetPasswordData) {
  try {
    const { data: verificationData, error: verificationError } = await supabaseAdmin.auth.verifyOtp(
      {
        email: data.email,
        token: data.token,
        type: 'recovery',
      }
    );

    if (verificationError || !verificationData?.user?.id) {
      throw new Error(
        `Password reset verification failed: ${verificationError?.message || 'Invalid recovery token'}`
      );
    }

    const userId = verificationData.user.id;
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: data.newPassword,
      }
    );

    if (updateError) {
      throw new Error(`Password reset failed: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Password updated successfully',
      user: updatedUser?.user || null,
    };
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// ============================================================================
// Send Password Reset Email
// ============================================================================

export async function sendPasswordResetEmail(email: string) {
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error(`Failed to send reset email: ${error.message}`);
    }

    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Send reset email error:', error);
    throw error;
  }
}

// ============================================================================
// Logout (Token Revocation)
// ============================================================================

export async function logout() {
  try {
    // No server-side session is stored in this service-role client.
    // Log out by clearing refresh token cookies on the client.
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get user session with all details
 */
export async function getUserSession(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      user,
      tenant: user.tenant,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  if (typeof requiredRole === 'string') {
    return userRole === requiredRole;
  }
  return requiredRole.includes(userRole);
}

/**
 * Check if user can access tenant
 */
export function canAccessTenant(
  userTenantId: string,
  targetTenantId: string,
  userRole: string
): boolean {
  // Super admin can access any tenant
  if (userRole === 'super_admin') {
    return true;
  }

  // Others can only access their own tenant
  return userTenantId === targetTenantId;
}
