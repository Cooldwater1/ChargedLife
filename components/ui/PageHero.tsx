import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  image?: string;
  className?: string;
  children: ReactNode;
}

/** A page's top banner, optionally backed by an atmosphere photo. Always keeps a dark overlay
 * under the content so text stays readable regardless of what's in the image. */
export function PageHero({ image, className, children }: PageHeroProps) {
  return (
    <div className={cn('relative cl-panel overflow-hidden p-6', className)}>
      {image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(7,11,22,0.93)] via-[rgba(7,11,22,0.8)] to-[rgba(7,11,22,0.6)]" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
