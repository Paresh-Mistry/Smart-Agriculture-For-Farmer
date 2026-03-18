import apiInstance from "./apiInstance";
import { CompleteProfilePayload, TokenResponse, User } from "../types/auth.types";

export const authService = {
  sendOTP: async (email: string) => {
    const res = await apiInstance.post("/auth/send-otp", { email });
    return res.data;
  },

  verifyOTP: async (email: string, otp: string): Promise<TokenResponse> => {
    const res = await apiInstance.post("/auth/verify-otp", { email, otp });
    localStorage.setItem("access_token", res.data.access_token);
    return res.data;
  },

  completeProfile: async (profile: CompleteProfilePayload) => {
    const token = localStorage.getItem("access_token");
    const res = await apiInstance.post("/auth/complete-profile", profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
      const res = await apiInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      localStorage.removeItem("access_token");
      return null;
    }
  },

  logout: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    await apiInstance.post("/auth/logout", null, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});

    localStorage.removeItem("access_token");
  },
};
