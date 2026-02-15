"use client";

import { useRef, useEffect, useMemo } from "react";
import { PongGame } from "@/lib/pong/game";
import { createGameStateStore } from "@/lib/pong/gameState";
import { PotentialEnergyPanel } from "@/components/quantum/PotentialEnergyPanel";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useMemo(() => createGameStateStore(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = new PongGame(canvas, ctx, store);
    game.start();

    return () => game.stop();
  }, [store]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block bg-black" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] z-10">
        <PotentialEnergyPanel store={store} />
      </div>
    </div>
  );
}
