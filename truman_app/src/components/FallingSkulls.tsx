"use client";

import { useEffect, useState } from "react";

interface Skull {
  id: number;
  side: "left" | "right";
  horizontalPosition: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
}

function generateSkulls(): Skull[] {
  const skulls: Skull[] = [];

  // Generate 12 skulls spread across the entire screen
  for (let i = 0; i < 12; i++) {
    skulls.push({
      id: i,
      side: "left", // Not used anymore, kept for type compatibility
      horizontalPosition: Math.random() * 90 + 5, // 5-95% across entire screen
      size: Math.random() * 19 + 56, // 56-75px (25% bigger again)
      rotation: Math.random() * 90 - 45, // -45 to +45 degrees
      duration: Math.random() * 4 + 5, // 5-9 seconds
      delay: Math.random() * 5, // 0-5 second stagger
    });
  }

  return skulls;
}

export function FallingSkulls() {
  const [skulls, setSkulls] = useState<Skull[]>([]);

  useEffect(() => {
    setSkulls(generateSkulls());
  }, []);

  if (skulls.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {skulls.map((skull) => (
        <div
          key={skull.id}
          className="absolute skull-fall"
          style={{
            left: `${skull.horizontalPosition}%`,
            width: `${skull.size}px`,
            height: `${skull.size}px`,
            transform: `rotate(${skull.rotation}deg)`,
            animationDuration: `${skull.duration}s`,
            animationDelay: `${skull.delay}s`,
          }}
        >
          <img
            src="/logo/pixel_grim_logo_transparent.png"
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
