export const BALL_SIZE = 12;
export const BALL_KE_INITIAL = 1.64e-29; // initial kinetic energy, ~6 px/frame
export const BALL_KE_INCREMENT = 1.68e-30; // kinetic energy increment per bounce, ~0.3 px/frame
export const BALL_MASS = 9.109e-31;

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  ke: number;
  mass: number;
}

export function createBall(canvasWidth: number, canvasHeight: number): Ball {
  const ball: Ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    dx: 0,
    dy: 0,
    ke: BALL_KE_INITIAL,
    mass: BALL_MASS,
  };
  const speed = getSpeed(ball);
  ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = speed * (Math.random() * 0.6 - 0.3);
  return ball;
}

export function resetBall(
  ball: Ball,
  canvasWidth: number,
  canvasHeight: number,
  direction: number,
) {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  ball.ke = BALL_KE_INITIAL;
  ball.mass = BALL_MASS;
  const speed = getSpeed(ball);
  const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
  ball.dx = Math.cos(angle) * speed * direction;
  ball.dy = Math.sin(angle) * speed;
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

export function getSpeed(ball: Ball): number {
  return Math.sqrt((2 * ball.ke) / ball.mass);
}
