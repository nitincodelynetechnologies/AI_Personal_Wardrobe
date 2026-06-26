'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToastStore } from '@/components/ui/toaster';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SettingsProfileForm } from '@/features/settings/components/SettingsProfileForm';
import { SettingsPreferencesForm } from '@/features/settings/components/SettingsPreferencesForm';
import {
  validateSettingsPreferences,
  validateSettingsProfile,
} from '@/features/settings/validations/settingsSchema';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  getProfile,
  updatePreferences,
  updateProfile,
} from '@/features/profile/services/profileService';
import { budgetRangeToSlider } from '@/features/profile/constants/onboardingOptions';

function mapValidationErrors(error) {
  if (!error?.errors) return {};
  return Object.fromEntries(error.errors.map((item) => [item.path[0], item.message]));
}

function mapProfileToForm(profile) {
  return {
    gender: profile?.gender ?? '',
    age: profile?.age ?? '',
    heightCm: profile?.height ?? 170,
    weightKg: profile?.weight ?? 65,
  };
}

function mapPreferencesToForm(preferences) {
  return {
    favoriteColors: preferences?.favorite_colors ?? [],
    budgetSlider: budgetRangeToSlider(preferences?.budget_range),
  };
}

export function SettingsPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cachedProfile = useProfileStore((state) => state.profile);
  const cachedPreferences = useProfileStore((state) => state.preferences);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setPreferences = useProfileStore((state) => state.setPreferences);
  const setFashionDna = useProfileStore((state) => state.setFashionDna);
  const showToast = useToastStore((state) => state.showToast);

  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadedProfile, setLoadedProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(mapProfileToForm(cachedProfile));
  const [preferencesForm, setPreferencesForm] = useState(mapPreferencesToForm(cachedPreferences));
  const [profileErrors, setProfileErrors] = useState({});
  const [preferenceErrors, setPreferenceErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !accessToken) {
      router.replace('/login/face');
    }
  }, [hydrated, isAuthenticated, accessToken, router]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;

    let cancelled = false;

    async function loadSettings() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getProfile(accessToken);
        if (cancelled) return;

        setProfile(response.profile);
        setPreferences(response.preferences);
        setLoadedProfile(response.profile);
        setProfileForm(mapProfileToForm(response.profile));
        setPreferencesForm(mapPreferencesToForm(response.preferences));
      } catch (error) {
        if (!cancelled) {
          setLoadError(getNetworkErrorMessage(error));
          setProfileForm(mapProfileToForm(cachedProfile));
          setPreferencesForm(mapPreferencesToForm(cachedPreferences));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken, setProfile, setPreferences]);

  const handleProfileSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const result = validateSettingsProfile(profileForm);
      if (!result.success) {
        setProfileErrors(mapValidationErrors(result.error));
        return;
      }

      setIsSavingProfile(true);
      setProfileErrors({});

      try {
        const validated = result.data;
        const response = await updateProfile(
          {
            gender: validated.gender,
            age: validated.age,
            heightCm: validated.heightCm,
            weightKg: validated.weightKg,
            bodyType: loadedProfile?.body_type,
            skinTone: loadedProfile?.skin_tone,
          },
          accessToken,
        );

        setProfile(response.profile);
        setLoadedProfile(response.profile);
        setPreferences(response.preferences);
        setProfileForm(mapProfileToForm(response.profile));
        showToast({ message: 'Profile updated successfully!', variant: 'success' });
      } catch (error) {
        showToast({
          message: getNetworkErrorMessage(error),
          variant: 'destructive',
        });
      } finally {
        setIsSavingProfile(false);
      }
    },
    [accessToken, loadedProfile, profileForm, setProfile, showToast],
  );

  const handlePreferencesSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const result = validateSettingsPreferences(preferencesForm);
      if (!result.success) {
        setPreferenceErrors(mapValidationErrors(result.error));
        return;
      }

      setIsSavingPreferences(true);
      setPreferenceErrors({});

      try {
        const validated = result.data;
        const response = await updatePreferences(
          {
            favoriteColors: validated.favoriteColors,
            favoriteBrands: cachedPreferences?.favorite_brands ?? [],
            budgetSlider: validated.budgetSlider,
            fashionStyle: cachedPreferences?.fashion_style ?? 'casual',
          },
          accessToken,
        );

        setPreferences(response.preferences);
        setFashionDna(response.fashion_dna);
        showToast({ message: 'Style preferences updated.', variant: 'success' });
      } catch (error) {
        showToast({
          message: getNetworkErrorMessage(error),
          variant: 'destructive',
        });
      } finally {
        setIsSavingPreferences(false);
      }
    },
    [
      accessToken,
      cachedPreferences,
      preferencesForm,
      setFashionDna,
      setPreferences,
      showToast,
    ],
  );

  if (!hydrated) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet">Account</p>
          <h1 className="font-playfair text-2xl font-semibold sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile details, style preferences, and appearance.
          </p>
        </div>

        <Card className="border-border bg-card/40">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">Appearance</CardTitle>
            <CardDescription>Switch between light and dark mode across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle showLabel />
          </CardContent>
        </Card>

        {loadError && (
          <Alert variant="destructive" role="alert">
            {loadError}
          </Alert>
        )}

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="preferences">Style Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-borderColor bg-white/30 dark:bg-[#150d22]/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg">My Profile</CardTitle>
                <CardDescription>Keep your fit profile accurate for better recommendations.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading profile...
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <SettingsProfileForm
                      data={profileForm}
                      errors={profileErrors}
                      onChange={(patch) => {
                        setProfileForm((current) => ({ ...current, ...patch }));
                        setProfileErrors({});
                      }}
                    />
                    <Button type="submit" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-borderColor bg-white/30 dark:bg-[#150d22]/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg">Style Preferences</CardTitle>
                <CardDescription>Adjust budget and color preferences for the AI stylist.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading preferences...
                  </div>
                ) : (
                  <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                    <SettingsPreferencesForm
                      data={preferencesForm}
                      errors={preferenceErrors}
                      onChange={(patch) => {
                        setPreferencesForm((current) => ({ ...current, ...patch }));
                        setPreferenceErrors({});
                      }}
                    />
                    <Button type="submit" disabled={isSavingPreferences}>
                      {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
