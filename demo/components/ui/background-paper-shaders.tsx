"use client";

import { useState } from "react";
import { DotOrbit, MeshGradient } from "@paper-design/shaders-react";

import { cn } from "@/lib/utils";

export function BackgroundPaperShaders({ className }: { className?: string }) {
  const [intensity] = useState(1.5);
  const [speed] = useState(1.0);
  const [activeEffect] = useState("mesh");

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      {activeEffect === "mesh" && (
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
          speed={speed}
        />
      )}

      {activeEffect === "dots" && (
        <div className="absolute inset-0 h-full w-full bg-black">
          <DotOrbit
            className="h-full w-full"
            colorBack="#1a1a1a"
            colors={["#333333", "#2a2a2a", "#404040"]}
            speed={speed}
            spreading={0.8 * intensity}
            size={0.7}
            sizeRange={0.15}
          />
        </div>
      )}

      {activeEffect === "combined" && (
        <>
          <MeshGradient
            className="absolute inset-0 h-full w-full"
            colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
            speed={speed * 0.5}
          />
          <div className="absolute inset-0 h-full w-full opacity-60">
            <DotOrbit
              className="h-full w-full"
              colorBack="#1a1a1a"
              colors={["#333333", "#2a2a2a", "#404040"]}
              speed={speed * 1.5}
              spreading={0.8 * intensity * 0.8}
              size={0.7}
              sizeRange={0.15}
            />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-gray-800/5 blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full bg-white/2 blur-2xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-gray-900/3 blur-xl animate-pulse"
          style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
        />
      </div>
    </div>
  );
}
