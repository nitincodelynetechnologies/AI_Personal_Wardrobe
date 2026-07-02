'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemographicsForm } from '@/features/profile/components/DemographicsForm';
import { PreferencesForm } from '@/features/profile/components/PreferencesForm';
import { OnboardingStepper } from '@/features/profile/components/OnboardingStepper';
import { FashionDnaLoader } from '@/features/profile/components/FashionDnaLoader';
import { submitOnboarding } from '@/features/profile/services/profileService';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  validateDemographics,
  validatePreferences,
} from '@/features/profile/validations/onboardingSchema';

const INITIAL_DEMOGRAPHICS = {
  gender: '',
  age: '',
  heightCm: 170,
  weightKg: 65,
  bodyType: '',
  skinTone: '',
};

const INITIAL_PREFERENCES = {
  favoriteColors: [],
  favoriteBrands: [],
  budgetSlider: 50,
  fashionStyle: '',
};

function mapValidationErrors(error) {
  if (!error?.errors) return {};
  return Object.fromEntries(error.errors.map((item) => [item.path[0], item.message]));
}

export function MultiStepOnboarding() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const skipOnboarding = useProfileStore((s) => s.skipOnboarding);

  const [step, setStep] = useState(1);
  const [demographics, setDemographics] = useState(INITIAL_DEMOGRAPHICS);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [demographicErrors, setDemographicErrors] = useState({});
  const [preferenceErrors, setPreferenceErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDemographics = useCallback((patch) => {
    setDemographics((prev) => ({ ...prev, ...patch }));
    setDemographicErrors({});
  }, []);

  const updatePreferences = useCallback((patch) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
    setPreferenceErrors({});
  }, []);

  const handleNext = useCallback(() => {
    const result = validateDemographics(demographics);
    if (!result.success) {
      setDemographicErrors(mapValidationErrors(result.error));
      return;
    }
    setStep(2);
  }, [demographics]);

  const handleSubmit = useCallback(async () => {
    const demoResult = validateDemographics(demographics);
    const prefResult = validatePreferences(preferences);

    if (!demoResult.success) {
      setDemographicErrors(mapValidationErrors(demoResult.error));
      setStep(1);
      return;
    }

    if (!prefResult.success) {
      setPreferenceErrors(mapValidationErrors(prefResult.error));
      return;
    }

    if (!accessToken) {
      setSubmitError('You must be signed in to complete onboarding.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await submitOnboarding({
        demographics: demoResult.data,
        preferences: prefResult.data,
        token: accessToken,
      });

      completeOnboarding(result);
      router.push('/dashboard');
    } catch (error) {
      setSubmitError(getNetworkErrorMessage(error));
      setIsSubmitting(false);
    }
  }, [accessToken, completeOnboarding, demographics, preferences, router]);

  const handleSkip = useCallback(() => {
    skipOnboarding(userId);
    router.push('/dashboard');
  }, [skipOnboarding, userId, router]);

  if (isSubmitting) {
    return <FashionDnaLoader />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <header className="mb-8 space-y-4 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet">
          Style Onboarding
        </p>
        <h1 className="font-playfair text-2xl font-semibold sm:text-3xl">
          Build Your Fashion Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Help us personalize recommendations with your fit and style preferences.
        </p>
        <OnboardingStepper currentStep={step} />
      </header>

      <Card className="border-borderColor bg-white/60 dark:bg-[#150d22]/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-playfair text-xl">
            {step === 1 ? 'About You' : 'Your Style DNA Inputs'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Demographic details improve fit recommendations and color matching.'
              : 'Select the colors, brands, and styles that feel most like you.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
            <DemographicsForm
              data={demographics}
              errors={demographicErrors}
              onChange={updateDemographics}
            />
          ) : (
            <PreferencesForm
              data={preferences}
              errors={preferenceErrors}
              onChange={updatePreferences}
            />
          )}

          {submitError && (
            <Alert variant="destructive" role="alert">
              {submitError}
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            {step === 2 ? (
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step === 1 ? (
              <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:items-end">
                <Button onClick={handleNext} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 hover:bg-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip for now
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:items-end">
                <Button onClick={handleSubmit} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate My Fashion DNA
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 hover:bg-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip for now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
