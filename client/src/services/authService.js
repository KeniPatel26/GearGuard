import api from "./axiosInstance";

const sendVerificationOtp = async (email) => {
  const res = await api.post("/auth/send-verification-otp", { email });
  return res.data;
};

const register = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    throw error;
  }
};
const login = async (userData) => {
  const res = await api.post("/auth/login", userData);
  return res.data;
};

const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

const sendResetPasswordOtp = async (email) => {
  const res = await api.post("/auth/send-reset-password-otp", email);
  return res.data;
};

const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

const isMe = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};
export {
  sendVerificationOtp,
  register,
  login,
  logout,
  sendResetPasswordOtp,
  resetPassword,
  isMe,
};
