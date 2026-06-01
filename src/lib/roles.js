// Single source of truth for role definitions — imported by auth.js AND middleware.js
export const ADMIN_ROLES  = ['admin', 'editor', 'manager'];
export const STAFF_ROLES  = ['admin', 'editor', 'manager', 'staff'];
export const CLIENT_ROLES = ['client'];
export const ALL_ROLES    = ['admin', 'editor', 'manager', 'staff', 'client'];

export const ROLE_COOKIE = {
  admin:   'admin_token',
  editor:  'admin_token',
  manager: 'admin_token',
  staff:   'staff_token',
  client:  'client_token',
};

export function getCookieName(role) {
  return ROLE_COOKIE[role] ?? 'client_token';
}
