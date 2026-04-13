import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

export function timeUntil(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { expired: false, days, hours, minutes, seconds };
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function isOfferActive(offer) {
  const now = new Date();
  return (
    offer.isActive &&
    new Date(offer.startDate) <= now &&
    new Date(offer.endDate) >= now
  );
}

export function apiResponse(data, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
