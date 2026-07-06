'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemographicsForm } from '@/features/profile/components/DemographicsForm';
import { PreferencesForm } from '@/features/profile/components/PreferencesForm';
import { FashionDnaLoader } from '@/features/profile/components/FashionDnaLoader';
import { submitOnboarding } from '@/features/profile/services/profileService';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  validateDemographics,
  validateDemographicsEssentials,
  validatePreferences,
} from '@/features/profile/validations/onboardingSchema';
import { cn } from '@/lib/utils';

const INITIAL_DEMOGRAPHICS = {
  name: '',
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

const STEP_META = {
  1: {
    title: 'The Essentials',
    description: 'Tell us the basics so we can personalize fit and recommendations.',
    progress: 50,
  },
  2: {
    title: 'Your Style Profile',
    description: 'Fine-tune your profile and style DNA — or skip and explore first.',
    progress: 100,
  },
};

function mapValidationErrors(error) {
  if (!error?.errors) return {};
  return Object.fromEntries(error.errors.map((item) => [item.path[0], item.message]));
}

function OnboardingProgressBar({ progress }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Profile setup</span>
        <span className="text-magenta">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet via-magenta to-magenta transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function MultiStepOnboarding() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const skipOnboarding = useProfileStore((s) => s.skipOnboarding);

  const [currentStep, setCurrentStep] = useState(1);
  const [demographics, setDemographics] = useState(INITIAL_DEMOGRAPHICS);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [demographicErrors, setDemographicErrors] = useState({});
  const [preferenceErrors, setPreferenceErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepVisible, setStepVisible] = useState(true);

  const updateDemographics = useCallback((patch) => {
    setDemographics((prev) => ({ ...prev, ...patch }));
    setDemographicErrors({});
  }, []);

  const updatePreferences = useCallback((patch) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
    setPreferenceErrors({});
  }, []);

  const transitionToStep = useCallback((nextStep) => {
    setStepVisible(false);
    window.setTimeout(() => {
      setCurrentStep(nextStep);
      setStepVisible(true);
    }, 220);
  }, []);

  const handleNext = useCallback(() => {
    const result = validateDemographicsEssentials(demographics);
    if (!result.success) {
      setDemographicErrors(mapValidationErrors(result.error));
      return;
    }
    transitionToStep(2);
  }, [demographics, transitionToStep]);

  const handleSubmit = useCallback(async () => {
    const demoResult = validateDemographics(demographics);
    const prefResult = validatePreferences(preferences);

    if (!demoResult.success) {
      const errors = mapValidationErrors(demoResult.error);
      setDemographicErrors(errors);
      const essentialFields = ['name', 'gender', 'age', 'heightCm', 'weightKg'];
      const onEssentialsStep = essentialFields.some((field) => errors[field]);
      setCurrentStep(onEssentialsStep ? 1 : 2);
      setStepVisible(true);
      return;
    }

    if (!prefResult.success) {
      setPreferenceErrors(mapValidationErrors(prefResult.error));
      setCurrentStep(2);
      setStepVisible(true);
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

  const stepMeta = STEP_META[currentStep];

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
      </header>

      <Card className="overflow-hidden border-borderColor bg-white/60 backdrop-blur dark:bg-[#150d22]/60">
        <CardHeader className="space-y-4 border-b border-borderColor/60 pb-6 dark:border-white/5">
          <OnboardingProgressBar progress={stepMeta.progress} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-magenta">
              Step {currentStep} of 2
            </p>
            <CardTitle className="mt-2 font-playfair text-xl">{stepMeta.title}</CardTitle>
            <CardDescription className="mt-1">{stepMeta.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div
            key={currentStep}
            className={cn(
              'transition-all duration-500 ease-in-out',
              stepVisible
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-4 opacity-0',
            )}
          >
            {currentStep === 1 ? (
              <DemographicsForm
                step={1}
                data={demographics}
                errors={demographicErrors}
                onChange={updateDemographics}
              />
            ) : (
              <div className="space-y-8">
                <DemographicsForm
                  step={2}
                  data={demographics}
                  errors={demographicErrors}
                  onChange={updateDemographics}
                />

                <div className="space-y-4 border-t border-borderColor/60 pt-6 dark:border-white/5">
                  <div>
                    <h3 className="font-playfair text-lg font-semibold">Style DNA Inputs</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select colors, brands, and styles that feel most like you.
                    </p>
                  </div>
                  <PreferencesForm
                    data={preferences}
                    errors={preferenceErrors}
                    onChange={updatePreferences}
                  />
                </div>
              </div>
            )}
          </div>

          {submitError && (
            <Alert variant="destructive" role="alert">
              {submitError}
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-borderColor/60 pt-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
            {currentStep === 2 ? (
              <Button
                variant="outline"
                onClick={() => transitionToStep(1)}
                className="gap-2 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep === 1 ? (
              <Button
                onClick={handleNext}
                className="gap-2 transition-all duration-300 sm:ml-auto"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={handleSubmit}
                  className="gap-2 transition-all duration-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Complete Setup
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 transition-all duration-300 hover:bg-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
