// lib/otp-store.ts
// Centralized OTP storage that works across API routes

interface OTPData {
  otp: string;
  expiresAt: number;
  createdAt: number;
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
    // Clean up expired OTPs every minute
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  set(phone: string, otp: string, expiresAt: number): void {
    this.store.set(phone, {
      otp,
      expiresAt,
      createdAt: Date.now(),
    });
    console.log(`✅ OTP stored for ${phone}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);
  }

  get(phone: string): OTPData | undefined {
    const data = this.store.get(phone);
    console.log(`🔍 Getting OTP for ${phone}:`, data ? 'Found' : 'Not found');
    return data;
  }

  delete(phone: string): boolean {
    const result = this.store.delete(phone);
    console.log(`🗑️ Deleted OTP for ${phone}:`, result);
    return result;
  }

  isValid(phone: string): boolean {
    const data = this.store.get(phone);
    if (!data) return false;
    const valid = data.expiresAt > Date.now();
    console.log(`⏰ OTP valid for ${phone}:`, valid);
    return valid;
  }

  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [phone, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(phone);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
    }
  }

  // Debug: View all OTPs (development only)
  getAll(): Map<string, OTPData> {
    return new Map(this.store);
  }

  size(): number {
    return this.store.size;
  }
}

// Create a singleton instance
const globalForOTP = globalThis as unknown as {
  otpStore: OTPStore | undefined;
};

export const otpStore = globalForOTP.otpStore ?? new OTPStore();

if (process.env.NODE_ENV !== 'production') {
  globalForOTP.otpStore = otpStore;
}

export default otpStore;