import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-purple-400 animate-spin" />
    </div>
  );
}
