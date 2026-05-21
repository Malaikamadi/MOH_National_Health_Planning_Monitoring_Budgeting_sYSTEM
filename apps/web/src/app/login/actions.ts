'use server';

import { signIn } from '@/lib/auth';

export async function signInWithKeycloak() {
  await signIn('keycloak', { redirectTo: '/dashboard' });
}
