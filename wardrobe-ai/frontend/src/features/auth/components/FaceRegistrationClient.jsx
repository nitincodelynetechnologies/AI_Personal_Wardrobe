'use client';

import dynamic from 'next/dynamic';
import FaceRegisterLoading from '@/app/(auth)/register/face/loading';

const FaceRegistrationPage = dynamic(
  () =>
    import('@/features/auth/components/FaceRegistrationPage').then(
      (mod) => mod.FaceRegistrationPage,
    ),
  {
    ssr: false,
    loading: () => <FaceRegisterLoading />,
  },
);

export function FaceRegistrationClient() {
  return <FaceRegistrationPage />;
}
