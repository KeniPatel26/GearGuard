import { isMe, login, logout, register, resetPassword, sendResetPasswordOtp, sendVerificationOtp } from "@/services/authService";
import { useMutation, useQuery } from "@tanstack/react-query";
export const useIsMe = () =>
  useQuery({
    queryKey: ["isMe"],
    queryFn: isMe,
  })

export const useSendVerificationOtp = () =>
  useMutation({
    mutationFn: sendVerificationOtp,
  });

export const useRegister = () =>
  useMutation({
    mutationFn: register,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: login,
  });

export const useSendResetPasswordOtp = () =>
  useMutation({
    mutationFn: sendResetPasswordOtp,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
  });

export const useLogout = () =>
  useMutation({
    mutationFn: logout,
  });

