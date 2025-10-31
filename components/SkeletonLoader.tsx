'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <Skeleton height={20} width="60%" baseColor="#1f2937" highlightColor="#374151" />
          <Skeleton height={15} count={2} baseColor="#1f2937" highlightColor="#374151" className="mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <Skeleton height={50} baseColor="#1f2937" highlightColor="#374151" />
        </div>
      ))}
    </div>
  );
}
