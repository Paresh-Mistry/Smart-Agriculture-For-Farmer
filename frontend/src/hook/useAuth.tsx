"use client";

import { useState } from "react";
import axios, { formToJSON } from "axios";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

export function useAuth() {
  const [error, setError] = useState<string | null>(null);

  const router = useRouter()

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  }) => {
    try {
      setError(null);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("role", data.role);

      return await axios.post(`${API_BASE}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err: any) {
      let errorMessage = "Something went wrong";

      const errorData = err.response?.data;

      if (Array.isArray(errorData)) {
        // FastAPI validation errors
        errorMessage = errorData
          .map((e: any) => `${e.loc.join(" → ")}: ${e.msg}`)
          .join(" | ");
      } else if (typeof errorData === "object" && errorData?.detail) {
        errorMessage = errorData.detail;
      }

      setError(errorMessage);
    } finally {
      console.log("Terminating process..");
    }
  };

  const login = async (data: { email: string; password: string }) => {
    try {
      setError(null);

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      console.log("Working");

      const res = await axios.post(`${API_BASE}/login`, formData, {
        withCredentials: true,
      });

      console.log(res.data)

      return res;
    } catch (err: any) {
      let errorMessage = "Something went wrong";

      const errorData = err.response?.data;

      if (Array.isArray(errorData)) {
        // FastAPI validation errors
        errorMessage = errorData
          .map((e: any) => `${e.loc.join(" → ")}: ${e.msg}`)
          .join(" | ");
      } else if (typeof errorData === "object" && errorData?.detail) {
        errorMessage = errorData.detail;
      }

      setError(errorMessage);
    } finally {
      console.log("Process Terminated..");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload()
    router.push("/auth")
    console.log("Logout User");
  };

  const getToken = () => localStorage.getItem("token");
  // console.log("Token after login: ",getToken())

  return { register, login, logout, getToken, error };
}
