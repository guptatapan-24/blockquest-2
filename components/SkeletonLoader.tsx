'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  className?: string;
}

export function SkeletonLoader({ count = 1, height = 20, className }: SkeletonLoaderProps) {
  return (
    <div className={className} role="status" aria-label="Loading content">
      <Skeleton count={count} height={height} baseColor="#1f2937" highlightColor="#374151" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ProofCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg" role="status" aria-label="Loading proof">
      <div className="space-y-4">
        <Skeleton height={24} width="60%" baseColor="#1f2937" highlightColor="#374151" />
        <Skeleton count={3} height={16} baseColor="#1f2937" highlightColor="#374151" />
        <div className="flex gap-2">
          <Skeleton height={32} width={100} baseColor="#1f2937" highlightColor="#374151" />
          <Skeleton height={32} width={100} baseColor="#1f2937" highlightColor="#374151" />
        </div>
      </div>
      <span className="sr-only">Loading proof card...</span>
    </div>
  );
}

export function SocialCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg" role="status" aria-label="Loading post">
      <div className="space-y-3">
        <Skeleton height={28} width="80%" baseColor="#1f2937" highlightColor="#374151" />
        <Skeleton height={16} width="40%" baseColor="#1f2937" highlightColor="#374151" />
        <Skeleton count={2} height={14} baseColor="#1f2937" highlightColor="#374151" />
        <div className="flex gap-4">
          <Skeleton height={20} width={80} baseColor="#1f2937" highlightColor="#374151" />
          <Skeleton height={20} width={120} baseColor="#1f2937" highlightColor="#374151" />
        </div>
      </div>
      <span className="sr-only">Loading social post...</span>
    </div>
  );
}
