import { router } from 'expo-router';

/**
 * After any successful sign-in (or skip): leave the sign-in screens and land on Compare.
 *
 * dismissTo pops back to Compare if it's already on the stack (signing in from the
 * Account tab) and navigates to it if not (onboarding, where the protected route has
 * already removed the onboarding screens). dismissAll + replace warned POP_TO_TOP in
 * that second case, because there was nothing left to pop.
 */
export function leaveSignIn() {
  router.dismissTo('/');
}
