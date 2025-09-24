// Authentication utility functions

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

export const formatUserRole = (role) => {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
};

export const formatTenantPlan = (plan) => {
  return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
};

export const redirectToLogin = () => {
  window.location.href = '/login';
};

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
