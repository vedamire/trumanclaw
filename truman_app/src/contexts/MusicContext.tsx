"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

interface MusicContextType {
  isMuted: boolean;
  toggleMusic: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
}

interface MusicProviderProps {
  children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = useCallback(() => {
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
  }, [isMuted]);

  return (
    <MusicContext.Provider value={{ isMuted, toggleMusic }}>
      <audio ref={audioRef} src="/music/trumusic.mp3" loop />
      {children}
    </MusicContext.Provider>
  );
}
