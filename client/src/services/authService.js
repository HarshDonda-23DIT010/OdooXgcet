import api from '../lib/axios';

export const authAPI = {
  // Sign up
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Sign in
  signin: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  // Verify email with OTP
  verifyEmail: async ({ email, otp }) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
