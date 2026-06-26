'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatLabel, getUserInitials } from '@/features/dashboard/utils/dashboardUtils';

export function DashboardGreeting({ user, profile, preferences }) {
  const displayName = user?.email?.split('@')[0] || 'Style Explorer';
  const bodyType = profile?.body_type;

  return (
    <section className="animate-fade-in-view flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{getUserInitials(user)}</AvatarFallback>
        </Avatar>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet">Welcome back</p>
          <h1 className="font-playfair text-2xl font-semibold sm:text-3xl">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            Your AI-powered fashion command center is ready.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {bodyType && <Badge variant="secondary">Body: {formatLabel(bodyType)}</Badge>}
        {preferences?.budget_range && (
          <Badge variant="outline">Budget: {formatLabel(preferences.budget_range)}</Badge>
        )}
      </div>
    </section>
  );
}
