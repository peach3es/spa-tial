import {
  Ball,
  BALL_SIZE,
  BALL_KE_INCREMENT,
  createBall,
  resetBall,
  drawBall,
  getSpeed,
} from "./ball";
import {
  Paddle,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_OFFSET,
  PADDLE_SPEED,
  createPaddle,
  updatePaddle,
  drawPaddle,
} from "./paddle";
import { Obstacle, generateObstacles, drawObstacle, collideBallWithObstacles } from "./obstacle";

const WINNING_SCORE = 10;

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private p1: Paddle;
  private p2: Paddle;
  private ball: Ball;
  private keys: Record<string, boolean> = {};
  private paused = false;
  private gameOver = false;
  private winner = "";
  private animationId = 0;
  private debug = false;
  private bounceCount = 0;
  private obstacles: Obstacle[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.resize();

    this.p1 = createPaddle(PADDLE_OFFSET, canvas.height);
    this.p2 = createPaddle(
      canvas.width - PADDLE_OFFSET - PADDLE_WIDTH,
      canvas.height,
    );
    this.ball = createBall(canvas.width, canvas.height);
    this.obstacles = generateObstacles(canvas.width, canvas.height);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  start() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("resize", this.handleResize);
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.handleResize);
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private handleResize() {
    this.resize();
    this.p2.x = this.canvas.width - PADDLE_OFFSET - PADDLE_WIDTH;
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key] = true;

    if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      this.debug = !this.debug;
      return;
    }

    if (e.key === " " || e.key === "Escape") {
      if (this.gameOver) {
        this.p1.score = 0;
        this.p2.score = 0;
        this.gameOver = false;
        this.winner = "";
        this.paused = false;
        this.bounceCount = 0;
        resetBall(
          this.ball,
          this.canvas.width,
          this.canvas.height,
          Math.random() > 0.5 ? 1 : -1,
        );
        this.obstacles = generateObstacles(this.canvas.width, this.canvas.height);
      } else {
        this.paused = !this.paused;
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key] = false;
  }

  private updatePaddles() {
    if (this.keys["w"] || this.keys["W"]) this.p1.dy = -PADDLE_SPEED;
    else if (this.keys["s"] || this.keys["S"]) this.p1.dy = PADDLE_SPEED;
    else this.p1.dy = 0;

    if (this.keys["ArrowUp"]) this.p2.dy = -PADDLE_SPEED;
    else if (this.keys["ArrowDown"]) this.p2.dy = PADDLE_SPEED;
    else this.p2.dy = 0;

    updatePaddle(this.p1, this.canvas.height);
    updatePaddle(this.p2, this.canvas.height);
  }

  private updateBall() {
    const ball = this.ball;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall bounce
    if (ball.y - BALL_SIZE / 2 <= 0) {
      ball.y = BALL_SIZE / 2;
      ball.dy = Math.abs(ball.dy);
    }
    if (ball.y + BALL_SIZE / 2 >= this.canvas.height) {
      ball.y = this.canvas.height - BALL_SIZE / 2;
      ball.dy = -Math.abs(ball.dy);
    }

    // P1 paddle collision
    if (
      ball.dx < 0 &&
      ball.x - BALL_SIZE / 2 <= this.p1.x + PADDLE_WIDTH &&
      ball.x + BALL_SIZE / 2 >= this.p1.x &&
      ball.y >= this.p1.y &&
      ball.y <= this.p1.y + PADDLE_HEIGHT
    ) {
      this.bounceBallOff(this.p1, 1);
    }

    // P2 paddle collision
    if (
      ball.dx > 0 &&
      ball.x + BALL_SIZE / 2 >= this.p2.x &&
      ball.x - BALL_SIZE / 2 <= this.p2.x + PADDLE_WIDTH &&
      ball.y >= this.p2.y &&
      ball.y <= this.p2.y + PADDLE_HEIGHT
    ) {
      this.bounceBallOff(this.p2, -1);
    }

    // Obstacle collision
    collideBallWithObstacles(ball, this.obstacles);

    // Scoring
    if (ball.x < 0) {
      this.p2.score++;
      if (this.p2.score >= WINNING_SCORE) {
        this.gameOver = true;
        this.winner = "Player 2";
      } else {
        resetBall(ball, this.canvas.width, this.canvas.height, 1);
        this.obstacles = generateObstacles(this.canvas.width, this.canvas.height);
      }
    }

    if (ball.x > this.canvas.width) {
      this.p1.score++;
      if (this.p1.score >= WINNING_SCORE) {
        this.gameOver = true;
        this.winner = "Player 1";
      } else {
        resetBall(ball, this.canvas.width, this.canvas.height, -1);
        this.obstacles = generateObstacles(this.canvas.width, this.canvas.height);
      }
    }
  }

  private bounceBallOff(paddle: Paddle, directionX: number) {
    this.bounceCount++;
    const hitPos = (this.ball.y - paddle.y) / PADDLE_HEIGHT - 0.5;
    this.ball.ke += BALL_KE_INCREMENT;
    const speed = getSpeed(this.ball);
    const angle = hitPos * (Math.PI / 3);
    this.ball.dx = Math.cos(angle) * speed * directionX;
    this.ball.dy = Math.sin(angle) * speed;

    this.ball.x =
      directionX === 1
        ? paddle.x + PADDLE_WIDTH + BALL_SIZE / 2
        : paddle.x - BALL_SIZE / 2;
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // Center dashed line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(this.p1.score), w / 2 - 60, 60);
    ctx.fillText(String(this.p2.score), w / 2 + 60, 60);

    // Obstacles
    for (const obs of this.obstacles) {
      drawObstacle(ctx, obs);
    }

    // Paddles & ball
    drawPaddle(ctx, this.p1);
    drawPaddle(ctx, this.p2);
    drawBall(ctx, this.ball);

    // Debug overlay
    if (this.debug) this.drawDebug();

    // Paused overlay
    if (this.paused && !this.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 40px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", w / 2, h / 2);
      ctx.font = "20px monospace";
      ctx.fillText("Press SPACE or ESC to resume", w / 2, h / 2 + 40);
    }

    // Game over overlay
    if (this.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${this.winner} Wins!`, w / 2, h / 2);
      ctx.font = "20px monospace";
      ctx.fillText("Press SPACE to play again", w / 2, h / 2 + 40);
    }
  }

  private drawDebug() {
    const ctx = this.ctx;
    const speed = getSpeed(this.ball);
    const lines = [
      `Speed: ${speed.toFixed(2)} px/frame`,
      `KE: ${this.ball.ke.toExponential(3)}`,
      `Mass: ${this.ball.mass.toExponential(3)}`,
      `dx: ${this.ball.dx.toFixed(2)}`,
      `dy: ${this.ball.dy.toFixed(2)}`,
      `Bounces: ${this.bounceCount}`,
      ``,
      ...this.obstacles.flatMap((obs, i) => [
        `--- Obstacle ${i + 1} ---`,
        `  g (strength): ${obs.barrierStrength.toFixed(3)}`,
        `  T (transmit): ${obs.potentialBarrier.toExponential(3)}`,
        `  R (reflect):  ${(1 - obs.potentialBarrier).toFixed(6)}`,
      ]),
    ];

    const padding = 12;
    const lineHeight = 20;
    const panelW = 260;
    const panelH = lines.length * lineHeight + padding * 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 80, panelW, panelH);

    ctx.fillStyle = "#0f0";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      ctx.fillText(line, 10 + padding, 80 + padding + 14 + i * lineHeight);
    });
  }

  private loop() {
    if (!this.paused && !this.gameOver) {
      this.updatePaddles();
      this.updateBall();
    }
    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  }
}
