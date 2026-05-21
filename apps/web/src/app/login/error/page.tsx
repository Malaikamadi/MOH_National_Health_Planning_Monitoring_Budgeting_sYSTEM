import Link from 'next/link';

type Props = {
  searchParams: { error?: string };
};

const MESSAGES: Record<string, string> = {
  Configuration:
    'Authentication is misconfigured. Check AUTH_SECRET, AUTH_URL, and Keycloak settings in Vercel.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid.',
  OAuthSignin: 'Could not start sign-in with the identity provider.',
  OAuthCallback: 'Sign-in callback failed. Check Keycloak redirect URIs match this site URL.',
  OAuthCreateAccount: 'Could not create an account from the provider profile.',
  default: 'Sign-in failed. Try again or contact your administrator.',
};

export default function LoginErrorPage({ searchParams }: Props) {
  const code = searchParams.error ?? 'default';
  const message = MESSAGES[code] ?? MESSAGES.default;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Sign-in problem</h1>
      <p className="mt-3 text-slate-600">{message}</p>
      {code !== 'default' && (
        <p className="mt-2 font-mono text-sm text-slate-500">Code: {code}</p>
      )}
      <Link
        href="/login"
        className="mt-8 inline-flex w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Back to login
      </Link>
    </main>
  );
}
