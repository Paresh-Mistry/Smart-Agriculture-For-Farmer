"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useLogout = (setUser: (user: any) => void) => {
  const router = useRouter();
  const API_BASE = "http://localhost:8000";
  

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token"); // remove token
      setUser(null);                            // clear user state
      router.replace("/");                       // redirect to home
    }
  }, [router, setUser]);

  return logout;
};
