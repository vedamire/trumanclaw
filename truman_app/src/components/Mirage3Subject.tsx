"use client";

import { useRef, useEffect } from "react";

interface Mirage3SubjectProps {
  videoSrc: string;
  isLooping: boolean;
  onEnded?: () => void;
  phase: "deciding" | "conclusion" | "result" | "publish";
}

export function Mirage3Subject({ videoSrc, isLooping, onEnded, phase }: Mirage3SubjectProps) {
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

  // Show publish phase content
  if (phase === "publish") {
    return (
      <div className="relative w-[95%] sm:w-[85%] md:w-[80%] mx-auto">
        {/* Blocky glow effect */}
        <div className="absolute inset-0 bg-white/10 blur-2xl" />

        <div className="relative pixel-panel p-4 sm:p-6 md:p-8">
          {/* Video thumbnail/preview container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/videos/result_tiktok.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80"
            />
            {/* Overlay with share message */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex items-center justify-center">
              <div className="text-center">
                <ShareIcon className="w-16 h-16 mx-auto text-white mb-4 animate-bounce" />
                <p className="text-white text-2xl font-bold">Share & Earn!</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <p
            className="text-white text-3xl sm:text-4xl md:text-5xl mt-4 sm:mt-6 text-center font-medium"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
          >
            Download & Post for $100!
          </p>
        </div>
      </div>
    );
  }

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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
