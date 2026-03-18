// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Use global store to persist between API calls
// In production, use Redis, Memcached, or database
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number }> | undefined;
}

// Initialize or reuse existing store
if (!global.otpStore) {
  global.otpStore = new Map<string, { otp: string; expiresAt: number }>();
}

export const otpStore = global.otpStore;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    console.log('📥 Send OTP request received for:', phone);

    // Validation
    if (!phone || typeof phone !== 'string') {
      console.log('❌ Phone number missing or invalid type');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      console.log('❌ Invalid phone format:', phone);
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      );
    }

    // Check rate limiting (optional but recommended)
    const existingOTP = otpStore.get(phone);
    if (existingOTP && existingOTP.expiresAt > Date.now()) {
      const remainingTime = Math.ceil(
        (existingOTP.expiresAt - Date.now()) / 1000
      );
      console.log(`⏳ OTP already exists for ${phone}, ${remainingTime}s remaining`);
      return NextResponse.json(
        {
          error: `OTP already sent. Please wait ${remainingTime} seconds before requesting again.`,
          remainingTime,
        },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP
    otpStore.set(phone, { otp, expiresAt });

    // Verify storage
    const stored = otpStore.get(phone);
    console.log('✅ OTP stored successfully:', stored ? 'YES' : 'NO');
    console.log('📊 Total OTPs in store:', otpStore.size);

    // Send SMS in production
    // Example with Twilio:
    /*
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });
    */

    // Log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log('─────────────────────────────────');
      console.log(`📱 OTP for ${phone}: ${otp}`);
      console.log(`⏰ Expires at: ${new Date(expiresAt).toLocaleString()}`);
      console.log('─────────────────────────────────');
    }

    // Response
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 300, // 5 minutes in seconds
        // Only return OTP in development mode for testing
        ...(isDevelopment && { otp, phone }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send OTP',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: Get OTP status (for debugging in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    // Show all OTPs
    const otpList = Array.from(otpStore.entries()).map(([phone, data]) => ({
      phone,
      otp: data.otp,
      expiresAt: new Date(data.expiresAt).toISOString(),
      isValid: data.expiresAt > Date.now(),
    }));

    return NextResponse.json({
      total: otpStore.size,
      otps: otpList,
    });
  }

  const otpData = otpStore.get(phone);

  if (!otpData) {
    return NextResponse.json({ error: 'No OTP found for this phone' }, { status: 404 });
  }

  return NextResponse.json({
    phone,
    otp: otpData.otp,
    expiresAt: new Date(otpData.expiresAt).toISOString(),
    isValid: otpData.expiresAt > Date.now(),
  });
}