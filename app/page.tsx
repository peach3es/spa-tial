"use client";

import { useRef, useEffect } from "react";
import { PongGame } from "@/lib/pong/game";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = new PongGame(canvas, ctx);
    game.start();

    return () => game.stop();
  }, []);

  return <canvas ref={canvasRef} className="block bg-black" />;
}
