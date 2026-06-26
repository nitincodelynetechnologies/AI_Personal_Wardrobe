'use client';



import { useEffect, useId, useState } from 'react';

import { cn } from '@/lib/utils';



const MAGENTA = '#e91e8c';

const TRACK_COLOR = '#150d22';



export function ClosetRadialScore({

  value = 0,

  label,

  sublabel,

  size = 168,

  strokeWidth = 10,

  animate = true,

  className,

}) {

  const [mounted, setMounted] = useState(!animate);

  const glowFilterId = useId().replace(/:/g, '');



  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  const stroke = strokeWidth;

  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const targetOffset = circumference - (safeValue / 100) * circumference;



  useEffect(() => {

    if (!animate) return;

    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);

  }, [animate, safeValue]);



  return (

    <div className={cn('relative inline-flex flex-col items-center', className)}>

      <svg width={size} height={size} className="-rotate-90">

        <defs>

          <filter id={`magentaGlow-${glowFilterId}`} x="-50%" y="-50%" width="200%" height="200%">

            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(233,30,140,0.35)" />

          </filter>

        </defs>

        <circle

          cx={size / 2}

          cy={size / 2}

          r={radius}

          fill="none"

          stroke={TRACK_COLOR}

          strokeWidth={stroke}

        />

        <circle

          cx={size / 2}

          cy={size / 2}

          r={radius}

          fill="none"

          stroke={MAGENTA}

          strokeWidth={stroke}

          strokeLinecap="round"

          strokeDasharray={circumference}

          filter={`url(#magentaGlow-${glowFilterId})`}

          className={cn(

            'ring-magenta-glow',

            animate && 'transition-[stroke-dashoffset] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',

          )}

          style={{

            strokeDashoffset: mounted ? targetOffset : circumference,

          }}

        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">

        <span className="font-playfair text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">

          {Math.round(safeValue)}%

        </span>

        {label && (

          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">

            {label}

          </span>

        )}

        {sublabel && <span className="mt-0.5 text-xs text-slate-700 dark:text-gray-400">{sublabel}</span>}

      </div>

    </div>

  );

}


