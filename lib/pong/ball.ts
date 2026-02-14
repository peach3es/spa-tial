export const BALL_SIZE = 10;
export const BALL_SPEED_INITIAL = 5;
export const BALL_SPEED_INCREMENT = 0.5;

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
}

export function createBall(canvasWidth: number, canvasHeight: number): Ball {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    dx: BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED_INITIAL * (Math.random() * 0.6 - 0.3),
    speed: BALL_SPEED_INITIAL,
  };
}

export function resetBall(ball: Ball, canvasWidth: number, canvasHeight: number, direction: number) {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  ball.speed = BALL_SPEED_INITIAL;
  const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
  ball.dx = Math.cos(angle) * ball.speed * direction;
  ball.dy = Math.sin(angle) * ball.speed;
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}
