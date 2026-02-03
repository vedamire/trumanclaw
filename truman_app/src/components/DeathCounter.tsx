"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatNumber, getChangeColor, getChangeArrow } from "@/lib/gameLogic";
import { formatDateReadable } from "@/lib/mockData";

interface DeathCounterProps {
  date: string;
  count: number;
  previousCount?: number;
  previousDate?: string;
  label?: string;
}

export function DeathCounter({ date, count, previousCount, previousDate, label = "Today's Global Death Count" }: DeathCounterProps) {
  const [displayCount, setDisplayCount] = useState(count);
  const [displayPreviousCount, setDisplayPreviousCount] = useState(previousCount ?? 0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isPreviousGlitching, setIsPreviousGlitching] = useState(false);

  // Track previous count value to detect changes
  const [prevCount, setPrevCount] = useState(count);
  const [prevPreviousCount, setPrevPreviousCount] = useState(previousCount);

  // Trigger glitch animation when count prop changes from database
  useEffect(() => {
    if (count !== prevCount) {
      setIsGlitching(true);
      setDisplayCount(count);
      setPrevCount(count);
      setTimeout(() => setIsGlitching(false), 200);
    }
  }, [count, prevCount]);

  // Trigger glitch animation when previousCount prop changes from database
  useEffect(() => {
    if (previousCount !== undefined && previousCount !== prevPreviousCount) {
      setIsPreviousGlitching(true);
      setDisplayPreviousCount(previousCount);
      setPrevPreviousCount(previousCount);
      setTimeout(() => setIsPreviousGlitching(false), 200);
    }
  }, [previousCount, prevPreviousCount]);

  // Live update with glitch animation every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Glitch today's count
      setIsGlitching(true);
      const todayChange = (Math.floor(Math.random() * 22) + 1) * (Math.random() < 0.5 ? 1 : -1);
      setDisplayCount(prev => Math.max(count - 500, prev + todayChange));
      setTimeout(() => setIsGlitching(false), 200);

      // Glitch yesterday's count (if exists)
      if (previousCount !== undefined) {
        setIsPreviousGlitching(true);
        const yesterdayChange = (Math.floor(Math.random() * 22) + 1) * (Math.random() < 0.5 ? 1 : -1);
        setDisplayPreviousCount(prev => Math.max(previousCount - 500, prev + yesterdayChange));
        setTimeout(() => setIsPreviousGlitching(false), 200);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [count, previousCount]);

  // Calculate dynamic difference from display values
  const hasChange = previousCount !== undefined;
  const diff = displayCount - displayPreviousCount;
  const changeColor = hasChange ? getChangeColor(displayPreviousCount, displayCount) : '';
  const changeArrow = hasChange ? getChangeArrow(displayPreviousCount, displayCount) : '';
  const changePercent = hasChange && displayPreviousCount !== 0
    ? ((diff / displayPreviousCount) * 100)
    : 0;

  return (
    <div className="relative w-[95%] sm:w-[85%] md:w-[80%] mx-auto">
      {/* Blocky glow effect */}
      <div className="absolute inset-0 bg-red-600/20 blur-2xl" />

      <div className="relative pixel-panel-red p-4 sm:p-6 md:p-8 text-center">
        {/* Date */}
        <p className="text-gray-500 text-[8px] sm:text-[10px] mb-1 sm:mb-2 uppercase tracking-wider">{formatDateReadable(date)}</p>

        {/* Label */}
        <h2 className="text-gray-400 text-[10px] sm:text-xs mb-2 sm:mb-4">{label}</h2>

        {/* Main counter */}
        <div className="relative">
          <p
            className={`text-2xl sm:text-4xl md:text-5xl font-bold tracking-wider text-red-500 glitch-number ${isGlitching ? 'glitch' : ''}`}
            data-text={formatNumber(displayCount)}
          >
            {formatNumber(displayCount)}
          </p>
        </div>

        {/* Change indicator */}
        {hasChange && (
          <div className={`mt-2 sm:mt-4 flex items-center justify-center gap-1 sm:gap-2 ${changeColor}`}>
            <span className="text-base sm:text-xl">{changeArrow}</span>
            <span className="text-[10px] sm:text-xs">
              {formatNumber(Math.abs(diff))} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Yesterday's count with glitch - temporarily hidden
        {hasChange && previousDate && (
          <div className="mt-6 pt-4 border-t-4 border-gray-700">
            <p className="text-gray-500 text-[8px] mb-1 uppercase">
              Yesterday ({formatDateReadable(previousDate)})
            </p>
            <p
              className={`text-lg font-bold text-gray-400 glitch-number ${isPreviousGlitching ? 'glitch' : ''}`}
              data-text={formatNumber(displayPreviousCount)}
            >
              {formatNumber(displayPreviousCount)}
            </p>
          </div>
        )}
        */}

        {/* Decorative skull watermark */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-10">
          <Image
            src="/logo/new_grim_logo.png"
            alt=""
            width={96}
            height={96}
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  );
}
