'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useFaceStudioStore } from '@/features/face-studio/store/useFaceStudioStore';
import {
  getPrimaryStyle,
  getUserDisplayName,
  getUserInitials,
} from '@/features/dashboard/utils/dashboardUtils';

function isOwnedProfile(profile, userId) {
  if (!profile || !userId) return false;
  if (!profile.user_id) return false;
  return profile.user_id === userId;
}

export function useAuthUser() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const preferences = useProfileStore((state) => state.preferences);
  const fashionDna = useProfileStore((state) => state.fashionDna);
  const userFace = useFaceStudioStore((state) => state.userFace);
  const boundUserId = useFaceStudioStore((state) => state.boundUserId);

  const userId = user?.id ?? null;

  const ownedProfile = useMemo(
    () => (isOwnedProfile(profile, userId) ? profile : null),
    [profile, userId],
  );

  const ownedPreferences = ownedProfile ? preferences : null;
  const ownedFashionDna = ownedProfile ? fashionDna : null;

  const displayName = useMemo(
    () => getUserDisplayName(user, ownedProfile),
    [user, ownedProfile],
  );

  const avatarUrl = useMemo(() => {
    if (userFace && boundUserId === userId) return userFace;
    return user?.avatar_url || user?.avatarUrl || user?.profile_image_url || null;
  }, [user, userFace, boundUserId, userId]);

  const bodyType = ownedProfile?.body_type ?? null;
  const fashionStyle = getPrimaryStyle(ownedFashionDna, ownedPreferences);
  const preferredColors =
    ownedPreferences?.favorite_colors?.length > 0
      ? ownedPreferences.favorite_colors
      : [];

  return {
    user,
    userId,
    profile: ownedProfile,
    preferences: ownedPreferences,
    fashionDna: ownedFashionDna,
    displayName,
    initials: getUserInitials(user),
    avatarUrl,
    bodyType,
    fashionStyle,
    preferredColors,
  };
}
