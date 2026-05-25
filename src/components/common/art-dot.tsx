import type { Texture } from "pixi.js";
import { Application, Graphics, Particle, ParticleContainer } from "pixi.js";
import { createNoise3D } from "simplex-noise";
import { useEffect, useRef } from "react";
import { ClientOnly } from "@tanstack/react-router";

const SCALE = 200;
const LENGTH = 5;
const SPACING = 15;

const noise3d = createNoise3D();

function getForceOnPoint(x: number, y: number, z: number) {
	return (noise3d(x / SCALE, y / SCALE, z) - 0.5) * 2 * Math.PI;
}

function createDotTexture(app: Application) {
	const g = new Graphics().circle(0, 0, 1).fill(0xcccccc);
	return app.renderer.generateTexture(g);
}

function addPoints({
	dotTexture,
	particleContainer,
	existingPoints,
	points,
	w,
	h,
}: {
	dotTexture: Texture;
	particleContainer: ParticleContainer;
	existingPoints: Set<string>;
	points: { x: number; y: number; opacity: number; particle: Particle }[];
	w: number;
	h: number;
}) {
	for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
		for (let y = -SPACING / 2; y < h + SPACING; y += SPACING) {
			const id = `${x}-${y}`;
			if (existingPoints.has(id)) continue;
			existingPoints.add(id);

			const particle = new Particle(dotTexture);
			particle.anchorX = 0.5;
			particle.anchorY = 0.5;
			particleContainer.addParticle(particle);

			const opacity = Math.random() * 0.5 + 0.5;
			points.push({ x, y, opacity, particle });
		}
	}
}

const ArtDot = () => {
	const elRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!elRef.current) return;

		let w = window.innerWidth;
		let h = window.innerHeight;
		let app: Application | null = null;
		let destroyed = false;

		const existingPoints = new Set<string>();
		const points: {
			x: number;
			y: number;
			opacity: number;
			particle: Particle;
		}[] = [];

		const setup = async () => {
			app = new Application();
			await app.init({
				backgroundAlpha: 0,
				antialias: true,
				resolution: window.devicePixelRatio,
				eventMode: "none",
				autoDensity: true,
			});

			if (destroyed || !elRef.current) {
				app.destroy(true, {
					children: true,
					texture: true,
					textureSource: true,
				});
				return;
			}

			elRef.current.appendChild(app.canvas);
			app.renderer.resize(window.innerWidth, window.innerHeight);

			const particleContainer = new ParticleContainer({
				dynamicProperties: { position: true, alpha: true },
			});
			app.stage.addChild(particleContainer);

			const dotTexture = createDotTexture(app);
			addPoints({
				dotTexture,
				particleContainer,
				existingPoints,
				points,
				w,
				h,
			});

			app.ticker.add(() => {
				const t = Date.now() / 10000;
				for (const p of points) {
					const { x, y, opacity, particle } = p;
					const rad = getForceOnPoint(x, y, t);
					const len = (noise3d(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH;
					particle.x = x + Math.cos(rad) * len;
					particle.y = y + Math.sin(rad) * len;
					particle.alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity;
				}
			});

			const onResize = () => {
				w = window.innerWidth;
				h = window.innerHeight;
				app?.renderer.resize(w, h);
				addPoints({
					dotTexture,
					particleContainer,
					existingPoints,
					points,
					w,
					h,
				});
			};

			window.addEventListener("resize", onResize);

			return () => {
				window.removeEventListener("resize", onResize);
			};
		};

		let cleanupResize: (() => void) | undefined;

		setup().then((cleanup) => {
			cleanupResize = cleanup;
		});

		return () => {
			destroyed = true;
			cleanupResize?.();
			try {
				app?.destroy(true, {
					children: true,
					texture: true,
					textureSource: true,
				});
			} catch (error) {}
		};
	}, []);

	return (
		<ClientOnly>
			<div
				ref={elRef}
				className="dark:invert fixed inset-0 z-[-1] pointer-events-none w-full h-full"
			/>
		</ClientOnly>
	);
};

export default ArtDot;
