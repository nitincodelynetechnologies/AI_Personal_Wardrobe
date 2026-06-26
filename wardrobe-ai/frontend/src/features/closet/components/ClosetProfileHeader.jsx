'use client';



import { ClosetRadialScore } from '@/features/closet/components/ClosetRadialScore';

import { getUserInitials } from '@/features/dashboard/utils/dashboardUtils';



export function ClosetProfileHeader({ user, profile, lookCount }) {

  const initials = getUserInitials(user);

  const displayName = 'Personal Closet';

  const subtitle = user?.email || user?.mobile || 'Fashion DNA & curated AI looks';

  const styleMatch = profile?.style_match ?? 85;



  return (

    <header className="glass-hud relative overflow-hidden px-6 py-8">

      <div

        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-magenta/10 blur-3xl"

        aria-hidden

      />



      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-5">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-magenta font-playfair text-xl font-semibold text-white shadow-sm transition-transform duration-300 hover:scale-105">

            {initials}

          </div>

          <div>

            <h1 className="font-playfair text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">

              {displayName}

            </h1>

            <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">{subtitle}</p>

          </div>

        </div>



        <div className="flex flex-wrap items-center gap-4">
          <div className="glass-hud flex min-w-[100px] flex-col items-center px-5 py-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="font-playfair text-2xl font-semibold text-slate-900 dark:text-white">{lookCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400">Saved Looks</p>
          </div>

          <div className="glass-hud px-4 py-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">

            <ClosetRadialScore value={styleMatch} label="Style Match" size={120} strokeWidth={8} />

          </div>

        </div>

      </div>

    </header>

  );

}


