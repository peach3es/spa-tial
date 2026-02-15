import { G_MIN, G_MAX } from "./quantumConstant";

export interface WaveDataPoint {
  x: number;
  psiReal: number;
  potential: number;
}

const PACKET_SIGMA = 18;
const SPIKE_WIDTH = 1.5;

export function generateWaveData(
  displayK: number,
  animPhase: number,
  ballChartX: number,
  barrierStrength: number,
  incomingAmplitude: number,
  transmittedAmplitude: number,
  reflectedAmplitude: number,
  numPoints: number = 150,
): WaveDataPoint[] {
  const xRange = 100;
  const points: WaveDataPoint[] = [];

  // Normalize barrier strength (g) to visible spike height
  const normalizedG = (barrierStrength - G_MIN) / (G_MAX - G_MIN);
  const spikeHeight = 0.5 + normalizedG * 2.0;

  // Incoming packet centered at ball's chart position (clamped to left side)
  const incomingCenter = Math.min(ballChartX, -5);
  const reflectedCenter = incomingCenter;
  // Transmitted packet centered at mirrored position past barrier
  const transmittedCenter = Math.max(-ballChartX, 5);

  for (let i = 0; i <= numPoints; i++) {
    const x = -xRange + (2 * xRange * i) / numPoints;

    // Delta function spike at x = 0
    const potential =
      spikeHeight * Math.exp(-(x * x) / (2 * SPIKE_WIDTH * SPIKE_WIDTH));

    let psiReal = 0;

    if (x < 0) {
      const incomingEnv = Math.exp(
        -((x - incomingCenter) * (x - incomingCenter)) /
          (2 * PACKET_SIGMA * PACKET_SIGMA),
      );
      const incoming =
        incomingEnv * Math.cos(displayK * x - animPhase) * incomingAmplitude;

      const reflectedEnv = Math.exp(
        -((x - reflectedCenter) * (x - reflectedCenter)) /
          (2 * PACKET_SIGMA * PACKET_SIGMA),
      );
      const reflected =
        reflectedEnv *
        Math.cos(displayK * x + animPhase) *
        reflectedAmplitude;

      psiReal = incoming + reflected;
    } else {
      const transmittedEnv = Math.exp(
        -((x - transmittedCenter) * (x - transmittedCenter)) /
          (2 * PACKET_SIGMA * PACKET_SIGMA),
      );
      psiReal =
        transmittedEnv *
        Math.cos(displayK * x - animPhase) *
        transmittedAmplitude;
    }

    points.push({ x, psiReal, potential });
  }

  return points;
}
