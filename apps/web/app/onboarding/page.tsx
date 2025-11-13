'use client';

import { OnboardingWizard } from '../../src/components/onboarding/onboarding-wizard';
import { AuthGuard } from '../../src/components/auth/auth-guard';

export default function OnboardingPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OnboardingWizard />
    </AuthGuard>
  );
}

