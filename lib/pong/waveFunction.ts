import { G_MIN, G_MAX } from "./quantumConstant";

export interface WaveDataPoint {
  x: number;
  psiReal: number;
  potential: number;
}

const PACKET_SIGMA = 30; // width of Gaussian wave packet
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

  // Incoming packet starts at far left (-90) and moves toward barrier (0)
  // Map ballChartX so the packet travels from -90 toward -5
  const incomingCenter = Math.max(-90, Math.min(-5, ballChartX));
  const reflectedCenter = incomingCenter;
  // Transmitted packet moves away from barrier toward the right
  const transmittedCenter = Math.max(5, Math.min(90, -ballChartX));

  const sigma2 = 2 * PACKET_SIGMA * PACKET_SIGMA;

  for (let i = 0; i <= numPoints; i++) {
    const x = -xRange + (2 * xRange * i) / numPoints;

    // Delta function spike at x = 0
    const potential =
      spikeHeight * Math.exp(-(x * x) / (2 * SPIKE_WIDTH * SPIKE_WIDTH));

    let psiReal = 0;

    if (x < 0) {
      // Incoming wave packet: Gaussian envelope centered at incomingCenter
      const incomingEnv = Math.exp(
        -((x - incomingCenter) * (x - incomingCenter)) / sigma2,
      );
      const incoming =
        incomingEnv * Math.cos(displayK * x - animPhase) * incomingAmplitude;

      // Reflected wave packet: same center, traveling opposite direction
      const reflectedEnv = Math.exp(
        -((x - reflectedCenter) * (x - reflectedCenter)) / sigma2,
      );
      const reflected =
        reflectedEnv *
        Math.cos(displayK * x + animPhase) *
        reflectedAmplitude;

      psiReal = incoming + reflected;
    } else {
      // Transmitted wave packet: Gaussian envelope moving past barrier
      const transmittedEnv = Math.exp(
        -((x - transmittedCenter) * (x - transmittedCenter)) / sigma2,
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
