"use client";

import { useRef, useEffect } from "react";

interface Mirage2SubjectProps {
  videoSrc: string;
  isLooping: boolean;
  onEnded?: () => void;
}

export function Mirage2Subject({ videoSrc, isLooping, onEnded }: Mirage2SubjectProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, user interaction required
      });
    }
  }, [videoSrc]);

  return (
    <div className="relative w-[95%] sm:w-[85%] md:w-[80%] mx-auto">
      {/* Blocky glow effect */}
      <div className="absolute inset-0 bg-white/10 blur-2xl" />

      <div className="relative pixel-panel p-4 sm:p-6 md:p-8">
        {/* Video container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop={isLooping}
            muted
            playsInline
            onEnded={onEnded}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for better integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Question text */}
        <p
          className="text-white text-3xl sm:text-4xl md:text-5xl mt-4 sm:mt-6 text-center font-medium"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          Wife, Mom or $90M?
        </p>
      </div>
    </div>
  );
}
