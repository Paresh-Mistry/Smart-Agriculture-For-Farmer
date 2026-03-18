import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@component/services/authService";
import { User } from "@component/types/auth.types";
import { CompleteProfilePayload } from "@component/types/auth.types";


const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// ---------------- CURRENT USER ----------------
export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: userKeys.current(),
    queryFn: authService.getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ---------------- SEND OTP ----------------
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (email: string) => authService.sendOTP(email),
  });
};

// ---------------- VERIFY OTP ----------------
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authService.verifyOTP(email, otp),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.current() }),
  });
};

// ---------------- COMPLETE PROFILE ----------------
export const useCompleteProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: CompleteProfilePayload) => authService.completeProfile(profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.current() }),
  });
};

// ---------------- LOGOUT ----------------
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => queryClient.removeQueries({ queryKey: userKeys.current() }),
  });
};
