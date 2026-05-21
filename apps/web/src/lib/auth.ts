import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';

/**
 * Auth.js v5 + Keycloak.
 *
 * If you see `/api/auth/error?error=Configuration`, usual causes are:
 * - No **AUTH_SECRET** / **NEXTAUTH_SECRET** (we add a dev-only fallback below).
 * - Keycloak not running or **KEYCLOAK_ISSUER** wrong → OIDC discovery fails.
 * - Client secret mismatch vs Keycloak realm export.
 */

/** Empty strings in .env count as “set”; treat them as missing so the dev fallback applies. */
function resolveAuthSecret(): string | undefined {
  const raw = (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    ''
  ).trim();
  if (raw) return raw;
  if (process.env.NODE_ENV === 'development') {
    return 'local-dev-only-change-me-in-dotenv-local-use-openssl-rand-base64-32';
  }
  return undefined;
}

const authSecret = resolveAuthSecret();

if (!authSecret && process.env.NODE_ENV !== 'development') {
  throw new Error(
    'Set AUTH_SECRET (or NEXTAUTH_SECRET) in production. Run: openssl rand -base64 32',
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  debug: process.env.NODE_ENV === 'development',

  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'nhpmbr-web',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? 'dev-only-web-client-secret-change-me',
      issuer: process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/nhpmbr',
    }),
  ],

  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  trustHost: true,
});

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}
