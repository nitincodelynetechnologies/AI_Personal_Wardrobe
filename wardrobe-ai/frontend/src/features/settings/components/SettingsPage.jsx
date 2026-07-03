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
import { OrderHistoryPanel } from '@/features/settings/components/OrderHistoryPanel';
import { SupportHelpPanel } from '@/features/settings/components/SupportHelpPanel';
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
import {
  applyServerProfileName,
  mergeProfileWithName,
} from '@/features/profile/utils/profileSync';
import { budgetRangeToSlider } from '@/features/profile/constants/onboardingOptions';

function mapValidationErrors(error) {
  if (!error?.errors) return {};
  return Object.fromEntries(error.errors.map((item) => [item.path[0], item.message]));
}

function mapProfileToForm(profile, name) {
  return {
    name: name ?? profile?.name ?? '',
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
  const [profileForm, setProfileForm] = useState(
    mapProfileToForm(cachedProfile, cachedProfile?.name),
  );
  const [preferencesForm, setPreferencesForm] = useState(mapPreferencesToForm(cachedPreferences));
  const [profileErrors, setProfileErrors] = useState({});
  const [preferenceErrors, setPreferenceErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (['profile', 'preferences', 'orders', 'support'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

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

        setProfile(mergeProfileWithName(response.profile, response.name));
        setPreferences(response.preferences);
        setLoadedProfile(mergeProfileWithName(response.profile, response.name));
        setProfileForm(mapProfileToForm(response.profile, response.name));
        applyServerProfileName(response.name);
        setPreferencesForm(mapPreferencesToForm(response.preferences));
      } catch (error) {
        if (!cancelled) {
          setLoadError(getNetworkErrorMessage(error));
          setProfileForm(mapProfileToForm(cachedProfile, cachedProfile?.name));
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
            name: validated.name,
            gender: validated.gender,
            age: validated.age,
            heightCm: validated.heightCm,
            weightKg: validated.weightKg,
            bodyType: loadedProfile?.body_type,
            skinTone: loadedProfile?.skin_tone,
          },
          accessToken,
        );

        const mergedProfile = mergeProfileWithName(response.profile, response.name);
        setProfile(mergedProfile);
        setLoadedProfile(mergedProfile);
        setPreferences(response.preferences);
        setProfileForm(mapProfileToForm(response.profile, response.name));
        applyServerProfileName(response.name);
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="preferences">Style Preferences</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
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

          <TabsContent value="orders">
            <Card className="border-borderColor bg-white/30 dark:bg-[#150d22]/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg">Order History</CardTitle>
                <CardDescription>
                  Track purchases and download invoices. Status updates sync with our fulfillment team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderHistoryPanel markReadOnMount={activeTab === 'orders'} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card className="border-borderColor bg-white/30 dark:bg-[#150d22]/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg">Support & Help</CardTitle>
                <CardDescription>
                  Raise a ticket for VTON, checkout, or account issues. Replies appear here and in notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupportHelpPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
