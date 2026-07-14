import { useEffect, useRef } from "react";

interface ConfettiProps {
  duration?: number; // ms
}

export default function Confetti({ duration = 4000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // Resize to fill screen
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = Math.random() * -50 - 20;
        this.size = Math.random() * 8 + 6;
        
        const colors = [
          "#7C3AED", // Purple
          "#EC4899", // Pink
          "#3B82F6", // Blue
          "#10B981", // Green
          "#F59E0B", // Yellow
          "#EF4444"  // Red
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Reset if goes off bottom
        if (canvas && this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.speedY = Math.random() * 5 + 4;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        
        // Render simple rectangular strip
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        
        ctx.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: 120 }, () => new Particle());

    // Loop
    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isRunning) {
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // End run after duration
    const timeout = setTimeout(() => {
      isRunning = false;
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, duration);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
