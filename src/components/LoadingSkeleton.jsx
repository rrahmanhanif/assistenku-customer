import React from "react";

export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="h-4 bg-gray-200 rounded" />
      ))}
    </div>
  );
}
