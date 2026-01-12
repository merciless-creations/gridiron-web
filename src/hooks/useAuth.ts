/**
 * Re-export useAuth from the auth module for backward compatibility.
 * The actual implementation is now in src/auth/ with provider-based DI.
 */
export { useAuth } from '../auth';
export type { AuthUser, AuthContextValue } from '../auth';
