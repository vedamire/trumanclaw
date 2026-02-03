"use client";

import Image from "next/image";

export function MirageSubject() {
  return (
    <div className="relative w-[95%] sm:w-[85%] md:w-[80%] mx-auto">
      {/* Blocky glow effect */}
      <div className="absolute inset-0 bg-white/10 blur-2xl" />

      <div className="relative pixel-panel p-4 sm:p-6 md:p-8">
        {/* Subject image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src="/mirage-subject.png"
            alt="Subject"
            fill
            className="object-cover"
            style={{ imageRendering: 'auto' }}
            priority
          />
          {/* Overlay gradient for better integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Question text */}
        <p
          className="text-white text-3xl sm:text-4xl md:text-5xl mt-4 sm:mt-6 text-center font-medium"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          Will she survive next 24h?
        </p>
      </div>
    </div>
  );
}
