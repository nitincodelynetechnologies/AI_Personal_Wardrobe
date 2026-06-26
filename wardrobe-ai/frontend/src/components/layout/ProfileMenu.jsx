'use client';



import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { LogOut, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useAuthUser } from '@/features/auth/hooks/useAuthUser';

import { useAppSignOut } from '@/features/auth/hooks/useAppSignOut';



export function ProfileMenu({ className }) {

  const { displayName, user, avatarUrl, initials } = useAuthUser();

  const handleSignOut = useAppSignOut();



  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuRef = useRef(null);



  const email = user?.email || user?.mobile || 'user@example.com';



  useEffect(() => {

    const handlePointerDown = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setIsProfileOpen(false);

      }

    };



    if (isProfileOpen) {

      document.addEventListener('mousedown', handlePointerDown);

    }



    return () => document.removeEventListener('mousedown', handlePointerDown);

  }, [isProfileOpen]);



  const closeMenu = () => setIsProfileOpen(false);



  return (

    <div ref={menuRef} className={cn('relative', className)}>

      <button

        type="button"

        onClick={() => setIsProfileOpen((open) => !open)}

        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-pink-500 bg-magenta text-xs font-bold text-white shadow-[0_0_16px_rgba(233,30,140,0.35)] transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"

        aria-label="Open profile menu"

        aria-expanded={isProfileOpen}

      >

        {avatarUrl ? (

          // eslint-disable-next-line @next/next/no-img-element

          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />

        ) : (

          <span>{initials}</span>

        )}

      </button>



      {isProfileOpen && (

        <div className="animate-fade-in-view absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#150d22]">

          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-black/20">

            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{displayName}</p>

            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>

          </div>



          <div className="p-2">

            <Link

              href="/settings"

              onClick={closeMenu}

              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"

            >

              <Settings className="h-4 w-4 shrink-0 opacity-70" aria-hidden />

              Account Settings

            </Link>

          </div>



          <div className="border-t border-slate-100 p-2 dark:border-white/5">

            <button

              type="button"

              onClick={() => {

                closeMenu();

                void handleSignOut();

              }}

              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"

            >

              <LogOut className="h-4 w-4 shrink-0" aria-hidden />

              Sign Out

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

