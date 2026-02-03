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

type FallingTVsVariant = "full" | "sides";

interface FallingTVsProps {
  variant?: FallingTVsVariant;
  sideWidthPercent?: number;
  autoSideWidth?: boolean;
  centerAspectRatio?: number; // width / height
  zIndex?: number;
}

function generateTVs(variant: FallingTVsVariant, sideWidthPercent: number): TV[] {
  const tvs: TV[] = [];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const side: "left" | "right" =
      variant === "sides" ? (i % 2 === 0 ? "left" : "right") : "left";
    const isLeft = side === "left";
    const stripStart = isLeft ? 0 : 100 - sideWidthPercent;
    const stripWidth = variant === "sides" ? sideWidthPercent : 100;
    const horizontalPosition =
      variant === "sides"
        ? stripStart + Math.random() * stripWidth
        : Math.random() * 90 + 5;

    tvs.push({
      id: i,
      side,
      horizontalPosition,
      size: Math.random() * 19 + 56,
      rotation: Math.random() * 90 - 45,
      duration: Math.random() * 4 + 5,
      delay: Math.random() * 5,
    });
  }

  return tvs;
}

export function FallingTVs({
  variant = "full",
  sideWidthPercent = 25,
  autoSideWidth = false,
  centerAspectRatio = 9 / 16,
  zIndex = 55,
}: FallingTVsProps) {
  const [tvs, setTVs] = useState<TV[]>([]);
  const [computedSideWidth, setComputedSideWidth] = useState<number>(sideWidthPercent);

  useEffect(() => {
    if (!autoSideWidth || typeof window === "undefined") {
      setComputedSideWidth(sideWidthPercent);
      return;
    }

    const updateSideWidth = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const videoWidth = Math.min(width, height * centerAspectRatio);
      const sideWidth = Math.max(0, (width - videoWidth) / 2);
      const percent = width > 0 ? (sideWidth / width) * 100 : sideWidthPercent;
      setComputedSideWidth(percent);
    };

    updateSideWidth();
    window.addEventListener("resize", updateSideWidth);
    return () => window.removeEventListener("resize", updateSideWidth);
  }, [autoSideWidth, centerAspectRatio, sideWidthPercent]);

  useEffect(() => {
    const width = variant === "sides" ? computedSideWidth : sideWidthPercent;
    setTVs(generateTVs(variant, width));
  }, [variant, computedSideWidth, sideWidthPercent]);

  if (tvs.length === 0) return null;

  const renderTVs = (side?: "left" | "right") =>
    tvs
      .filter((tv) => (variant === "sides" ? tv.side === side : true))
      .map((tv) => (
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
      ));

  if (variant === "sides") {
    if (computedSideWidth < 2) {
      return null;
    }

    const sideStyle = (side: "left" | "right") => ({
      width: `${computedSideWidth}vw`,
      left: side === "left" ? 0 : "auto",
      right: side === "right" ? 0 : "auto",
    });

    return (
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex }}
      >
        <div
          className="absolute top-0 bottom-0 hidden min-[400px]:block"
          style={sideStyle("left")}
        >
          {renderTVs("left")}
        </div>
        <div
          className="absolute top-0 bottom-0 hidden min-[400px]:block"
          style={sideStyle("right")}
        >
          {renderTVs("right")}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex }}
    >
      {renderTVs()}
    </div>
  );
}
