"use client";

import { useEffect, useState } from "react";

interface TV {
  id: number;
  side: "left" | "right";
  horizontalPosition: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
}

function generateTVs(): TV[] {
  const tvs: TV[] = [];

  // Generate 12 TVs spread across the entire screen
  for (let i = 0; i < 12; i++) {
    tvs.push({
      id: i,
      side: "left", // Not used anymore, kept for type compatibility
      horizontalPosition: Math.random() * 90 + 5, // 5-95% across entire screen
      size: Math.random() * 19 + 56, // 56-75px
      rotation: Math.random() * 90 - 45, // -45 to +45 degrees
      duration: Math.random() * 4 + 5, // 5-9 seconds
      delay: Math.random() * 5, // 0-5 second stagger
    });
  }

  return tvs;
}

export function FallingTVs() {
  const [tvs, setTVs] = useState<TV[]>([]);

  useEffect(() => {
    setTVs(generateTVs());
  }, []);

  if (tvs.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {tvs.map((tv) => (
        <div
          key={tv.id}
          className="absolute tv-fall"
          style={{
            left: `${tv.horizontalPosition}%`,
            width: `${tv.size}px`,
            height: `${tv.size}px`,
            transform: `rotate(${tv.rotation}deg)`,
            animationDuration: `${tv.duration}s`,
            animationDelay: `${tv.delay}s`,
          }}
        >
          <img
            src="/logo/fallingtv.png"
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.8))",
            }}
          />
        </div>
      ))}
    </div>
  );
}
