// src/utils/helpers.js
export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]?.toUpperCase()).slice(0, 2).join('');

export const daysBetween = (a, b) =>
  Math.ceil((new Date(b) - new Date(a)) / 86400000);

export const splitEqually = (amount, n) =>
  Math.round((amount / n) * 100) / 100;

export const truncate = (text = '', max = 50) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const avatarColors = ['#1E3A5F','#2EC4B6','#F4A261','#27AE60','#E74C3C','#9B59B6'];

export const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};
