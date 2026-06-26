import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useFaceStudioStore } from '@/features/face-studio/store/useFaceStudioStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { useOrderStore } from '@/features/checkout/store/useOrderStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';

const PERSISTED_USER_STORES = [
  useAuthStore,
  useProfileStore,
  useFaceStudioStore,
  useCartStore,
  useWishlistStore,
  useOrderStore,
];

export function resetInMemoryUserState() {
  useAuthStore.getState().logout();
  useProfileStore.getState().resetProfile();
  useFaceStudioStore.getState().clearUserFace();
  useWardrobeStore.getState().resetWardrobe();
  useOutfitStore.getState().resetOutfits();
  useCartStore.getState().resetCart();
  useWishlistStore.getState().resetWishlist();
  useOrderStore.getState().resetOrders();
  useDashboardStore.getState().resetDashboard();
}

export async function purgePersistedUserSession() {
  await Promise.all(PERSISTED_USER_STORES.map((store) => store.persist.clearStorage()));

  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }
}

export async function clearUserSession() {
  resetInMemoryUserState();
  await purgePersistedUserSession();
}

function bindSessionAvatar(user) {
  const avatarUrl = user?.avatar_url || user?.avatarUrl || user?.profile_image_url;
  if (avatarUrl && user?.id) {
    useFaceStudioStore.getState().setUserFace(avatarUrl, user.id);
  }
}

export async function establishAuthenticatedSession({
  user,
  accessToken,
  routingToken,
  isRegistration = false,
}) {
  await clearUserSession();

  if (isRegistration) {
    useAuthStore.getState().completeFaceRegistration({
      routingToken,
      accessToken: accessToken ?? routingToken,
      user,
    });
  } else {
    useAuthStore.getState().completeFaceLogin({
      user,
      accessToken,
    });
  }

  bindSessionAvatar(user);
}

export function enforceSessionOwnership() {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  const profile = useProfileStore.getState().profile;
  if (profile?.user_id && profile.user_id !== userId) {
    useProfileStore.getState().resetProfile();
  }

  const { boundUserId } = useFaceStudioStore.getState();
  if (boundUserId && boundUserId !== userId) {
    useFaceStudioStore.getState().clearUserFace();
  }
}
