"use client";

import { useRef, useEffect } from "react";

export type Mirage10Prediction = "bush" | "shaved";

interface Mirage10SubjectProps {
  videoSrc: string;
  isLooping: boolean;
  onEnded?: () => void;
  phase: "deciding" | "conclusion" | "result";
  onPlaceBet: (prediction: Mirage10Prediction) => void;
  disabled: boolean;
  currentBet: { prediction: Mirage10Prediction } | null;
  lastResult: { won: boolean; amount: number } | null;
}

export function Mirage10Subject({
  videoSrc,
  isLooping,
  onEnded,
  phase,
  onPlaceBet,
  disabled,
  currentBet,
  lastResult,
}: Mirage10SubjectProps) {
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
    <div className="relative w-full">
      {/* Video container - full width */}
      <div className="relative w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop={isLooping}
          muted
          playsInline
          onEnded={onEnded}
          className="w-full h-auto"
        />

        {/* Bet buttons overlay - only during deciding phase */}
        {phase === "deciding" && (
          <>
            {/* Question text above buttons */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(50%+50px)] bg-black/70 px-6 sm:px-24 py-2 sm:py-3 rounded-lg">
              <span className="text-white text-2xl sm:text-6xl font-black whitespace-nowrap">Bush or Shaved?</span>
            </div>

            {/* Left button - BUSH */}
            <button
              onClick={() => onPlaceBet("bush")}
              disabled={disabled}
              className={`absolute left-2 top-[calc(50%+150px)] sm:top-[calc(50%+250px)] -translate-y-1/2 px-12 py-8
                bg-amber-700/90 hover:bg-amber-600 text-white font-bold
                pixel-btn border-amber-900 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <span className="text-3xl font-black">BUSH</span>
            </button>

            {/* Right button - SHAVED */}
            <button
              onClick={() => onPlaceBet("shaved")}
              disabled={disabled}
              className={`absolute right-2 top-[calc(50%+150px)] sm:top-[calc(50%+250px)] -translate-y-1/2 px-12 py-8
                bg-pink-500/90 hover:bg-pink-400 text-white font-bold
                pixel-btn border-pink-700 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <span className="text-3xl font-black">SHAVED</span>
            </button>
          </>
        )}

        {/* Current bet indicator during conclusion phase */}
        {phase === "conclusion" && currentBet && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className={`px-6 py-3 border-2 animate-pulse ${
              currentBet.prediction === "bush"
                ? "bg-amber-900/80 border-amber-500"
                : "bg-pink-900/80 border-pink-500"
            }`}>
              <span className="text-white font-bold text-sm sm:text-base">
                YOUR BET: $100 on {currentBet.prediction === "bush" ? "BUSH" : "SHAVED"}
              </span>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {phase === "result" && lastResult && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            lastResult.won ? "bg-green-900/80" : "bg-red-900/80"
          }`}>
            <div className="text-center animate-pulse">
              <p className="text-white text-2xl sm:text-4xl font-black mb-2">
                SHAVED!
              </p>
              <p className={`text-3xl sm:text-5xl font-black ${
                lastResult.won ? "text-green-400" : "text-red-400"
              }`}>
                {lastResult.won ? `YOU WON +$${lastResult.amount}!` : `YOU LOST -$${lastResult.amount}!`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
