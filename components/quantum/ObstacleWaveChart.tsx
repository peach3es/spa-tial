"use client";

import { useMemo } from "react";
import { ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ObstacleChartState } from "@/lib/pong/gameState";
import { generateWaveData } from "@/lib/pong/waveFunction";
import { DISPLAY_K_SCALE } from "@/lib/pong/quantumConstant";

interface Props {
  obstacle: ObstacleChartState;
  canvasWidth: number;
  animFrame: number;
  label: string;
}

const chartConfig: ChartConfig = {
  psiReal: {
    label: "Re(ψ)",
    color: "hsl(220, 90%, 60%)",
  },
  potential: {
    label: "V(x)",
    color: "hsl(0, 90%, 60%)",
  },
};

const COLLISION_FADE_FRAMES = 90;

export function ObstacleWaveChart({
  obstacle,
  canvasWidth,
  animFrame,
  label,
}: Props) {
  const data = useMemo(() => {
    const omega = 0.08;
    const animPhase = animFrame * omega;

    // 2D distance between ball and obstacle centroid
    const ddx = obstacle.ballX - obstacle.obstacleX;
    const ddy = obstacle.ballY - obstacle.obstacleY;
    const dist2D = Math.sqrt(ddx * ddx + ddy * ddy);
    // Only show incoming wave when ball is moving toward this obstacle
    const isApproaching =
      (obstacle.ballX < obstacle.obstacleX && obstacle.ballDirectionX > 0) ||
      (obstacle.ballX > obstacle.obstacleX && obstacle.ballDirectionX < 0);
    const maxDist = canvasWidth * 0.4;

    // Map distance to chart position: always approach from left (-90) toward barrier (0)
    // Far away = -90, close = -5
    const normalizedDist = Math.min(dist2D / maxDist, 1);
    const ballChartX = -5 - normalizedDist * 85; // -90 when far, -5 when at barrier

    // Amplitude ramps up quickly at the edge of detection range,
    // so the packet is visible while still on the far left
    const rawAmp = 1 - dist2D / maxDist; // 0 at edge, 1 at barrier
    const incomingAmplitude = isApproaching
      ? Math.max(0, Math.min(1, rawAmp * 3)) // reach full amplitude at ~33% of the way in
      : 0;

    // After collision: show transmitted or reflected wave, fading out
    let transmittedAmplitude = 0;
    let reflectedAmplitude = 0;
    if (obstacle.framesSinceCollision < COLLISION_FADE_FRAMES) {
      const fade = 1 - obstacle.framesSinceCollision / COLLISION_FADE_FRAMES;
      if (obstacle.collisionT > 0.5) {
        // Ball transmitted: wave appears on the right side only
        transmittedAmplitude = Math.sqrt(obstacle.collisionT) * fade;
      } else {
        // Ball reflected: wave appears on the left side only
        reflectedAmplitude = Math.sqrt(1 - obstacle.collisionT) * fade;
      }
    }

    const displayK = Math.max(0.08, Math.min(0.5, obstacle.waveNumber * DISPLAY_K_SCALE));

    return generateWaveData(
      displayK,
      animPhase,
      ballChartX,
      obstacle.barrierStrength,
      incomingAmplitude,
      transmittedAmplitude,
      reflectedAmplitude,
    );
  }, [
    obstacle.ballX,
    obstacle.ballY,
    obstacle.obstacleX,
    obstacle.obstacleY,
    obstacle.ballDirectionX,
    obstacle.waveNumber,
    obstacle.barrierStrength,
    obstacle.collisionT,
    obstacle.framesSinceCollision,
    canvasWidth,
    animFrame,
  ]);

  return (
    <Card className="flex-1 bg-black/80 border-white/10 py-2">
      <CardHeader className="py-1 px-3">
        <CardTitle className="text-xs text-white/70 flex justify-between font-mono">
          <span>{label}</span>
          <span>
            T={obstacle.transmissionCoeff.toFixed(4)}{" "}
            R={obstacle.reflectionCoeff.toFixed(4)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1">
        <ChartContainer
          config={chartConfig}
          className="h-[calc(30vh-4rem)] w-full"
        >
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 10, bottom: 20, left: 35 }}
          >
            <XAxis
              dataKey="x"
              tick={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              label={{
                value: "x",
                position: "insideBottom",
                offset: -10,
                style: { fill: "rgba(255,255,255,0.6)", fontSize: 12 },
              }}
            />
            <YAxis
              hide={false}
              domain={[-2.5, 2.5]}
              tick={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              label={{
                value: "V(x)",
                angle: -90,
                position: "insideLeft",
                offset: -20,
                style: { fill: "rgba(255,255,255,0.6)", fontSize: 12 },
              }}
            />

            {/* Delta function barrier V(x) */}
            <Line
              dataKey="potential"
              type="monotone"
              stroke="rgba(255, 80, 80, 0.9)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Wave function Re(ψ) */}
            <Line
              dataKey="psiReal"
              type="monotone"
              stroke="rgba(100, 150, 255, 0.9)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
