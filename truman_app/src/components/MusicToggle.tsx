"use client";

import { useRef, useState } from "react";

type MusicToggleVariant = "fixed" | "inline";

interface MusicToggleProps {
  variant?: MusicToggleVariant;
}

export function MusicToggle({ variant = "fixed" }: MusicToggleProps) {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.play().catch(() => {
        // Autoplay might be blocked until user interaction.
      });
    } else {
      audio.pause();
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio ref={audioRef} src="/music/trumusic.mp3" loop />
      <button
        className={`music-toggle ${variant === "inline" ? "music-toggle--inline" : ""}`}
        onClick={toggleMusic}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
    </>
  );
}
