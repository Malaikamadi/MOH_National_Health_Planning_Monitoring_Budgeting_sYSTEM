import Image from 'next/image';
import { cn } from '@/lib/cn';

const sizeMap = {
  sm: { box: 'h-14 w-14', img: 52, ring: 'ring-2' },
  md: { box: 'h-20 w-20', img: 76, ring: 'ring-[3px]' },
  lg: { box: 'h-28 w-28', img: 108, ring: 'ring-[3px]' },
  xl: { box: 'h-44 w-44', img: 168, ring: 'ring-4' },
  hero: { box: 'h-64 w-64 sm:h-72 sm:w-72 lg:h-80 lg:w-80', img: 300, ring: 'ring-4' },
  showcase: { box: 'h-80 w-80 lg:h-[22rem] lg:w-[22rem]', img: 340, ring: 'ring-[5px]' },
} as const;

export type MinistryLogoSize = keyof typeof sizeMap;

type MinistryLogoProps = {
  size?: MinistryLogoSize;
  className?: string;
  /** Show green outer ring like the official seal */
  showSealRing?: boolean;
  priority?: boolean;
};

export function MinistryLogo({
  size = 'md',
  className,
  showSealRing = true,
  priority = false,
}: MinistryLogoProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        'relative shrink-0 grid place-items-center rounded-full bg-white shadow-elevated',
        s.box,
        showSealRing && cn(s.ring, 'ring-accent-500/90 ring-offset-2 ring-offset-white'),
        className,
      )}
      aria-hidden={false}
    >
      <Image
        src="/mohs-logo.png"
        alt="Ministry of Health — Government of Sierra Leone"
        width={s.img}
        height={s.img}
        priority={priority}
        className="h-[88%] w-[88%] object-contain"
      />
    </div>
  );
}

export function MinistryWordmark({
  className,
  subtitle = 'Government of Sierra Leone',
  compact = false,
  variant = 'default',
}: {
  className?: string;
  subtitle?: string;
  compact?: boolean;
  variant?: 'default' | 'light';
}) {
  const titleClass =
    variant === 'light' ? 'text-white' : 'text-brand-900';
  const subClass =
    variant === 'light' ? 'text-accent-300' : 'text-accent-700';

  return (
    <div className={cn('min-w-0', className)}>
      <p
        className={cn(
          'font-bold tracking-tight',
          titleClass,
          compact ? 'text-sm leading-tight' : 'text-lg sm:text-xl leading-tight',
        )}
      >
        Ministry of Health
      </p>
      <p
        className={cn(
          'font-semibold uppercase tracking-[0.12em]',
          subClass,
          compact ? 'text-[9px] mt-0.5' : 'text-[10px] sm:text-xs mt-1',
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}
