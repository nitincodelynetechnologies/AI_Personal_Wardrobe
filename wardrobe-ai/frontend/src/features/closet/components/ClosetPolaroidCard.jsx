'use client';



import Image from 'next/image';

import { cn } from '@/lib/utils';



const POLAROID_IMAGE = '120px';



function PolaroidPiece({ item, className }) {

  if (!item?.image_url) {

    return (

      <div

        className={cn(

          'flex items-center justify-center bg-gray-100 text-[10px] uppercase tracking-wider text-slate-700 dark:text-gray-400',

          className,

        )}

      >

        —

      </div>

    );

  }



  return (

    <div className={cn('group/piece relative overflow-hidden bg-gray-100', className)}>

      <Image

        src={item.image_url}

        alt={item.sub_category || 'Outfit piece'}

        fill

        sizes={POLAROID_IMAGE}

        className="object-cover transition-transform duration-500 group-hover/piece:scale-105"

      />

    </div>

  );

}



export function ClosetPolaroidCard({ outfit, className, rotation = 0 }) {

  return (

    <div

      style={{ transform: `rotate(${rotation}deg)` }}

      className="transition-transform duration-300 hover:-translate-y-1"

    >

      <article

        className={cn(

          'wardrobe-card-3d group rounded-sm border border-borderColor bg-white dark:bg-[#150d22] p-3 pb-8 shadow-md',

          className,

        )}

      >

        <div className="space-y-2 overflow-hidden rounded-sm">

          <PolaroidPiece item={outfit.top} className="aspect-[4/3] w-full" />

          <div className="grid grid-cols-2 gap-2">

            <PolaroidPiece item={outfit.bottom} className="aspect-square" />

            <PolaroidPiece item={outfit.footwear} className="aspect-square" />

          </div>

        </div>



        <div className="mt-4 rounded-xl border border-borderColor bg-background px-3 py-3 text-center transition-all duration-300 group-hover:border-magenta/20">

          <p className="font-playfair text-sm font-semibold text-slate-900 dark:text-white">

            {outfit.name || 'Saved Look'}

          </p>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">

            {outfit.season_tag} · <span className="text-magenta">{outfit.style_score}%</span> match

          </p>

        </div>

      </article>

    </div>

  );

}


