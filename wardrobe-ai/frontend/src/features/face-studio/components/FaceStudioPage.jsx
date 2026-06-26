'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { FaceStudioPanel } from '@/features/face-studio/components/FaceStudioPanel';
import { BodyAnalysisPanel } from '@/features/face-studio/components/BodyAnalysisPanel';
import { StyleProfileModeTabs } from '@/features/face-studio/components/StyleProfileModeTabs';

export function FaceStudioPage() {
  const { ready } = useOnboardingGuard();
  const [activeMode, setActiveMode] = useState('face');

  if (!ready) return null;

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6 md:px-8 md:py-8">
        <header className="mx-auto mb-6 max-w-7xl space-y-4">
          <div className="space-y-2">
            <h1 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
              Style Profile
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-gray-400">
              Dual-mode biometric intelligence — analyze facial morphology and full-body measurements
              to personalize virtual try-on, fit recommendations, and styling guidance.
            </p>
          </div>

          <StyleProfileModeTabs activeMode={activeMode} onChange={setActiveMode} />
        </header>

        {activeMode === 'face' && <FaceStudioPanel />}

        {activeMode === 'body' && <BodyAnalysisPanel />}

        <p className="mx-auto mt-8 max-w-7xl text-center text-xs text-slate-500 dark:text-gray-500">
          Biometric data is stored locally in your browser and used for virtual try-on and analysis
          previews.
        </p>
      </div>
    </DashboardLayout>
  );
}
