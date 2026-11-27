export function isAdminSession(value: unknown): value is {
  authenticated: true;
  role: 'admin';
} {
  return typeof value === 'object'
    && value !== null
    && 'authenticated' in value
    && value.authenticated === true
    && 'role' in value
    && value.role === 'admin';
}
