import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const r180 = Math.PI;
const r90 = Math.PI / 2;
const r15 = Math.PI / 12;
const color = "#88888825";
const MIN_BRANCH = 30;

function initCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D & {
		webkitBackingStorePixelRatio?: number;
		mozBackingStorePixelRatio?: number;
		msBackingStorePixelRatio?: number;
		oBackingStorePixelRatio?: number;
		backingStorePixelRatio?: number;
	};
	const dpr = window.devicePixelRatio || 1;
	const bsr =
		ctx.webkitBackingStorePixelRatio ||
		ctx.mozBackingStorePixelRatio ||
		ctx.msBackingStorePixelRatio ||
		ctx.oBackingStorePixelRatio ||
		ctx.backingStorePixelRatio ||
		1;
	const dpi = dpr / bsr;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	canvas.width = dpi * width;
	canvas.height = dpi * height;
	ctx.scale(dpi, dpi);
	return { ctx, dpi };
}

function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
	return [x + r * Math.cos(theta), y + r * Math.sin(theta)];
}

function PlumCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const width = window.innerWidth;
		const height = window.innerHeight;
		const { ctx } = initCanvas(canvas, width, height);

		let rafId: number;
		let steps: (() => void)[] = [];
		let prevSteps: (() => void)[] = [];
		let lastTime = performance.now();
		const interval = 1000 / 40;

		const step = (
			x: number,
			y: number,
			rad: number,
			counter = { value: 0 },
		) => {
			const length = Math.random() * 6;
			counter.value += 1;
			const [nx, ny] = polar2cart(x, y, length, rad);

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(nx, ny);
			ctx.stroke();

			if (nx < -100 || nx > width + 100 || ny < -100 || ny > height + 100)
				return;

			const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5;
			if (Math.random() < rate)
				steps.push(() => step(nx, ny, rad + Math.random() * r15, counter));
			if (Math.random() < rate)
				steps.push(() => step(nx, ny, rad - Math.random() * r15, counter));
		};

		const randomMiddle = () => Math.random() * 0.6 + 0.2;

		const startAnimation = () => {
			cancelAnimationFrame(rafId);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 1;
			ctx.strokeStyle = color;
			prevSteps = [];
			steps = [
				() => step(randomMiddle() * width, -5, r90),
				() => step(randomMiddle() * width, height + 5, -r90),
				() => step(-5, randomMiddle() * height, 0),
				() => step(width + 5, randomMiddle() * height, r180),
			];
			if (width < 500) steps = steps.slice(0, 2);
			lastTime = performance.now();
			frame();
		};

		const frame = () => {
			if (performance.now() - lastTime >= interval) {
				prevSteps = steps;
				steps = [];
				lastTime = performance.now();

				if (!prevSteps.length) return;

				for (const fn of prevSteps) {
					if (Math.random() < 0.5) steps.push(fn);
					else fn();
				}
			}
			rafId = requestAnimationFrame(frame);
		};

		startAnimation();

		const onResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			initCanvas(canvas, w, h);
			startAnimation();
		};
		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	const mask = "radial-gradient(circle, transparent, black)";

	return (
		<div
			className="fixed top-0 left-0 pointer-events-none"
			style={{
				zIndex: -1,
				maskImage: mask,
				WebkitMaskImage: mask,
			}}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}

const ArtPlum = () => {
	return (
		<ClientOnly fallback={null}>
			<PlumCanvas />
		</ClientOnly>
	);
};

export default ArtPlum;
