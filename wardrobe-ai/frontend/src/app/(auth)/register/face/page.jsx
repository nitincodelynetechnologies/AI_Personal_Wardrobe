import { FaceRegistrationClient } from '@/features/auth/components/FaceRegistrationClient';

export const metadata = {
  title: 'Face Registration',
  description:
    'Register your face to create a secure biometric profile for your AI wardrobe.',
};

export default function FaceRegisterPage() {
  return <FaceRegistrationClient />;
}
