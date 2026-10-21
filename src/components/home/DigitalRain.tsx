"use client";

import { useEffect, useRef } from "react";

type Stream = {
  x: number;
  y: number;
  speed: number;
  size: number;
  luminance: number;
  delay: number;
};

const GLYPHS = "∑∫∂∇∆∞αλβθπωµφΨΩ0123456789<>≠≈±×÷{}";

/** A contained canvas effect: no React rerenders per frame, no external assets. */
export default function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !container || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let streams: Stream[] = [];
    let frame = 0;
    let raf = 0;
    let lastFrame = 0;
    let inView = false;
    let mouseX = -10000;
    let mouseY = -10000;

    const seedStream = (x: number, randomY = true): Stream => ({
      x,
      y: randomY ? Math.random() * (height * 1.6) - height * 1.1 : -Math.random() * 250,
      speed: 0.75 + Math.random() * 1.75,
      size: 14 + Math.random() * 3,
      luminance: Math.random(),
      delay: Math.floor(Math.random() * 120),
    });

    function resize() {
      if (!canvas || !container || !ctx) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#090a0a";
      ctx.fillRect(0, 0, width, height);
      const gutter = width < 640 ? 24 : 29;
      streams = Array.from({ length: Math.ceil(width / gutter) + 1 }, (_, i) =>
        seedStream(i * gutter + 4)
      );
    }

    function paint() {
      if (!ctx) return;
      // The semi-transparent veil creates fading trails instead of abrupt frames.
      ctx.fillStyle = "rgba(9, 10, 10, 0.072)";
      ctx.fillRect(0, 0, width, height);
      frame++;

      for (const stream of streams) {
        if (frame < stream.delay || frame % (stream.luminance > 0.72 ? 2 : 3) !== 0) continue;
        const character = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const distance = Math.hypot(stream.x - mouseX, stream.y - mouseY);
        const nearCursor = distance < 130;
        const bright = Math.random() > 0.92 || nearCursor;
        const opacity = nearCursor ? 0.98 : (stream.luminance > 0.7 ? 0.76 : 0.37);
        ctx.font = `${stream.size}px ui-monospace, Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.shadowBlur = bright ? 9 : 0;
        ctx.shadowColor = "rgba(245, 215, 155, 0.65)";
        ctx.fillStyle = bright
          ? `rgba(242, 221, 180, ${opacity})`
          : `rgba(161, 125, 76, ${opacity})`;
        ctx.fillText(character, stream.x, stream.y);
        ctx.shadowBlur = 0;
        stream.y += stream.speed * (stream.luminance > 0.7 ? 15 : 11);
        if (stream.y > height + 40) {
          Object.assign(stream, seedStream(stream.x, false));
        }
      }
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      // About 30 frames/second, enough for calm movement, lower CPU usage.
      if (now - lastFrame < 32) return;
      lastFrame = now;
      paint();
    }

    function updatePlayback() {
      const shouldPlay = inView && !document.hidden && !reducedMotion.matches;
      if (shouldPlay && !raf) raf = requestAnimationFrame(loop);
      else if (!shouldPlay) stop();
    }

    function handlePointer(event: PointerEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    }

    function clearPointer() {
      mouseX = -10000;
      mouseY = -10000;
    }

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        updatePlayback();
      },
      { threshold: 0.02 }
    );

    resize();
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    container.addEventListener("pointermove", handlePointer);
    container.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", handlePointer);
      container.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
    };
  }, []);

  return <canvas ref={canvasRef} className="jav-rain-canvas" aria-hidden="true" />;
}
