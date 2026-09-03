import React from 'react';

// ============================================================================
// 1. BASE SKELETON PRIMITIVE
// ============================================================================
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rect' | 'circle' | 'rounded' | 'text' | 'pill';
  shimmer?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  shimmer = true,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rect: 'rounded-none',
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4',
    pill: 'rounded-full h-7',
  }[variant];

  const shimmerStyle = shimmer
    ? 'skeleton-shimmer'
    : 'bg-zinc-800/80 animate-pulse';

  return (
    <div
      className={`${shimmerStyle} ${variantStyles} ${className} pointer-events-none select-none`}
      aria-hidden="true"
      {...props}
    />
  );
}

// ============================================================================
// 2. TEXT SKELETON
// ============================================================================
export function SkeletonText({
  lines = 2,
  className = '',
  widths = ['w-full', 'w-3/4', 'w-1/2'],
}: {
  lines?: number;
  className?: string;
  widths?: string[];
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={`${widths[i % widths.length]} h-3.5`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 3. HERO BANNER SKELETON
// ============================================================================
export function SkeletonHero({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-zinc-800/80 p-5 sm:p-8 md:p-10 shadow-2xl ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Column Text & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="pill" className="w-32 h-6" />
            <Skeleton variant="pill" className="w-20 h-6" />
          </div>

          <div className="space-y-2">
            <Skeleton variant="text" className="w-4/5 h-8 sm:h-10 rounded-lg" />
            <Skeleton variant="text" className="w-2/3 h-8 sm:h-10 rounded-lg" />
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton variant="text" className="w-full h-4" />
            <Skeleton variant="text" className="w-11/12 h-4" />
            <Skeleton variant="text" className="w-3/5 h-4" />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Skeleton variant="rounded" className="w-36 h-11 rounded-2xl" />
            <Skeleton variant="rounded" className="w-32 h-11 rounded-2xl" />
          </div>
        </div>

        {/* Right Column Artwork Skeleton */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden p-2 bg-zinc-950/80 border border-zinc-800/80 shadow-2xl">
            <Skeleton variant="rounded" className="w-full h-full rounded-xl sm:rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. TRACK / AUDIO CARD SKELETON (GRID ITEM)
// ============================================================================
export function SkeletonTrackCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-4 space-y-3 shadow-lg ${className}`}
    >
      {/* Cover Image Placeholder */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900">
        <Skeleton variant="rounded" className="w-full h-full" />
        <div className="absolute top-2 right-2">
          <Skeleton variant="circle" className="w-6 h-6" />
        </div>
        <div className="absolute bottom-2 right-2">
          <Skeleton variant="circle" className="w-10 h-10 shadow-lg" />
        </div>
      </div>

      {/* Info Lines */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <Skeleton variant="text" className="w-3/4 h-4 rounded" />
          <Skeleton variant="pill" className="w-10 h-4" />
        </div>
        <Skeleton variant="text" className="w-1/2 h-3.5 rounded" />
        
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
          <Skeleton variant="text" className="w-16 h-3 rounded" />
          <Skeleton variant="text" className="w-12 h-3 rounded" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TRACK ROW SKELETON (LIST ITEM)
// ============================================================================
export function SkeletonTrackRow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
        <Skeleton variant="rounded" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-1.5 min-w-0 flex-1">
          <Skeleton variant="text" className="w-48 sm:w-64 h-4 max-w-full" />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="pill" className="w-12 h-3.5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Skeleton variant="text" className="w-10 h-3.5 hidden sm:block" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
    </div>
  );
}

// ============================================================================
// 6. CHAT CONVERSATION / MESSAGE SKELETON
// ============================================================================
export function SkeletonConversationRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/60">
      <Skeleton variant="circle" className="w-11 h-11 shrink-0" />
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-12 h-3" />
        </div>
        <Skeleton variant="text" className="w-3/4 h-3.5" />
      </div>
    </div>
  );
}

export function SkeletonChatMessage({ isMine = false }: { isMine?: boolean }) {
  return (
    <div className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMine && <Skeleton variant="circle" className="w-8 h-8 shrink-0" />}
      <div className={`space-y-1 max-w-[70%]`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isMine
              ? 'bg-amber-500/20 border border-amber-500/30 rounded-br-none'
              : 'bg-zinc-800/80 border border-zinc-700/50 rounded-bl-none'
          }`}
        >
          <Skeleton variant="text" className="w-40 sm:w-56 h-4" />
          <Skeleton variant="text" className="w-24 sm:w-36 h-3 mt-1.5" />
        </div>
        <Skeleton variant="text" className={`w-12 h-2.5 ${isMine ? 'ml-auto' : 'mr-auto'}`} />
      </div>
    </div>
  );
}

// ============================================================================
// 7. SOCIAL FEED POST SKELETON
// ============================================================================
export function SkeletonPostCard() {
  return (
    <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-4 sm:p-6 space-y-4 shadow-xl">
      {/* Author Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="w-11 h-11 shrink-0" />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-32 h-4" />
            <Skeleton variant="text" className="w-20 h-3" />
          </div>
        </div>
        <Skeleton variant="pill" className="w-16 h-6" />
      </div>

      {/* Post Text */}
      <div className="space-y-2 pt-1">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
      </div>

      {/* Post Media Placeholder */}
      <Skeleton variant="rounded" className="w-full h-48 sm:h-64 rounded-2xl" />

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-4">
          <Skeleton variant="pill" className="w-16 h-7" />
          <Skeleton variant="pill" className="w-16 h-7" />
        </div>
        <Skeleton variant="circle" className="w-7 h-7" />
      </div>
    </div>
  );
}

// ============================================================================
// 8. FINANCE 6-JARS SKELETON
// ============================================================================
export function SkeletonFinanceJar() {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-4 sm:p-5 space-y-3.5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton variant="rounded" className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="text" className="w-14 h-3" />
          </div>
        </div>
        <Skeleton variant="pill" className="w-12 h-6" />
      </div>

      <div className="space-y-1.5">
        <Skeleton variant="text" className="w-36 h-6 rounded" />
        <Skeleton variant="rounded" className="w-full h-2 rounded-full" />
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/40">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-20 h-3" />
      </div>
    </div>
  );
}

// ============================================================================
// 9. USER PROFILE SKELETON
// ============================================================================
export function SkeletonProfile() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900/90 border border-zinc-800 h-40 sm:h-52 p-4">
        <Skeleton variant="rounded" className="w-full h-full rounded-2xl" />
      </div>

      {/* Profile Info Bar */}
      <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <Skeleton variant="circle" className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-zinc-950 shrink-0" />
            <div className="space-y-2">
              <Skeleton variant="text" className="w-40 sm:w-56 h-6 mx-auto sm:mx-0" />
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Skeleton variant="pill" className="w-20 h-5" />
                <Skeleton variant="pill" className="w-24 h-5" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="w-28 h-10 rounded-xl" />
            <Skeleton variant="rounded" className="w-28 h-10 rounded-xl" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-center">
              <Skeleton variant="text" className="w-16 h-3 mx-auto" />
              <Skeleton variant="text" className="w-20 h-5 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. NOTIFICATION & TRANSACTION ITEM SKELETON
// ============================================================================
export function SkeletonNotificationItem() {
  return (
    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/60 flex items-start gap-3">
      <Skeleton variant="rounded" className="w-9 h-9 rounded-xl shrink-0" />
      <div className="space-y-1.5 flex-1 min-w-0">
        <Skeleton variant="text" className="w-3/4 h-4" />
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-20 h-2.5" />
      </div>
    </div>
  );
}

export function SkeletonTransactionRow() {
  return (
    <div className="py-3 flex items-center justify-between gap-4">
      <div className="space-y-1.5 min-w-0 flex-1">
        <Skeleton variant="text" className="w-44 sm:w-60 h-4" />
        <Skeleton variant="text" className="w-28 h-3" />
      </div>
      <div className="shrink-0 text-right">
        <Skeleton variant="pill" className="w-16 h-5" />
      </div>
    </div>
  );
}

// ============================================================================
// 11. GRID / LIST CONTAINERS
// ============================================================================
export function SkeletonGrid({
  count = 6,
  columns = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  className = '',
}: {
  count?: number;
  columns?: string;
  className?: string;
}) {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTrackCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 6,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 sm:space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTrackRow key={i} />
      ))}
    </div>
  );
}
