// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Access the global OTP store
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number }> | undefined;
}

const otpStore = global.otpStore || new Map<string, { otp: string; expiresAt: number }>();

// Mock user database - Replace with actual database in production
const users = new Map<string, {
  id: string;
  phone: string;
  role: 'buyer' | 'farmer';
  name: string;
  createdAt: string;
}>([
  [
    '9876543210',
    {
      id: '1',
      phone: '9876543210',
      role: 'buyer',
      name: 'John Doe',
      createdAt: new Date().toISOString(),
    },
  ],
  [
    '9876543211',
    {
      id: '2',
      phone: '9876543211',
      role: 'farmer',
      name: 'Jane Smith',
      createdAt: new Date().toISOString(),
    },
  ],
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, role } = body;

    console.log('📥 Verify OTP request:', { phone, otp, role });
    console.log('📊 Current store size:', otpStore.size);

    // Validation
    if (!phone || typeof phone !== 'string') {
      console.log('❌ Phone number missing');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      console.log('❌ OTP missing');
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Verify phone format
    if (!/^[0-9]{10}$/.test(phone)) {
      console.log('❌ Invalid phone format');
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Verify OTP format
    if (!/^[0-9]{6}$/.test(otp)) {
      console.log('❌ Invalid OTP format');
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedData = otpStore.get(phone);

    if (!storedData) {
      console.log('❌ OTP not found in store for:', phone);
      console.log('📋 Available phones in store:', Array.from(otpStore.keys()));
      return NextResponse.json(
        { error: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    console.log('✅ OTP found in store:', storedData);

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      console.log('⏰ OTP expired');
      otpStore.delete(phone);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('❌ OTP mismatch:', { provided: otp, stored: storedData.otp });
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    console.log('✅ OTP verified successfully');

    // OTP is valid, clear it
    otpStore.delete(phone);

    // Check if user exists
    let user = users.get(phone);

    // If user doesn't exist and no role provided, ask for role
    if (!user && !role) {
      console.log('👤 New user detected, role required');
      return NextResponse.json(
        {
          message: 'New user detected',
          requiresRole: true,
        },
        { status: 404 }
      );
    }

    // Create new user if doesn't exist
    if (!user && role) {
      // Validate role
      if (role !== 'buyer' && role !== 'farmer') {
        console.log('❌ Invalid role:', role);
        return NextResponse.json(
          { error: 'Invalid role. Must be "buyer" or "farmer".' },
          { status: 400 }
        );
      }

      // Create new user
      user = {
        id: `user_${Date.now()}`,
        phone,
        role,
        name: `User ${phone.slice(-4)}`,
        createdAt: new Date().toISOString(),
      };

      // Save user to "database"
      users.set(phone, user);

      console.log('✅ New user created:', user);
    }

    if (!user) {
      console.log('❌ User not found after checks');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('👤 User authenticated:', user);

    // Generate JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const token = await new SignJWT({
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token expires in 7 days
      .sign(secret);

    console.log('🔐 JWT token generated');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          name: user.name,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/', // Cookie available for entire site
    });

    console.log('✅ Auth cookie set');

    return response;
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while verifying OTP',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: Logout endpoint
export async function DELETE(request: NextRequest) {
  console.log('👋 Logout request received');
  
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the auth cookie
  response.cookies.delete('auth-token');

  return response;
}