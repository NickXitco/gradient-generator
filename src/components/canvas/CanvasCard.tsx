"use client";

import { Card } from "@/components/ui/card";
import { vertexShader, fragmentShader } from "@/shaders/noise";
import { useEffect, useRef } from "react";
import { Clock, Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { INITIAL_SHADER_STATE, useShaderStore } from "@/store/ShaderSlice";

const padArray = (array: Color[], length: number) => {
    const paddedArray = new Array(length).fill(array[0]);
    for (let i = 0; i < array.length; i++) {
        paddedArray[i] = array[i];
    }
    return paddedArray;
};

export const CanvasCard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const materialRef = useRef<ShaderMaterial>(null);

    // We keep this separate so that changing the value doesn't cause
    // the shader to appear to jump.
    const timeScaleRef = useRef<number>(INITIAL_SHADER_STATE.timeScale);

    const { timeScale, warpScale, grainAmount, smoothing, noiseColor, noiseScale, fbmOctaves, fbmPersistence, colors } =
        useShaderStore();

    useEffect(() => {
        if (!canvasRef.current || !cardRef.current) return;

        const renderer = new WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
            alpha: true,
        });

        // Set the size of the renderer to the size of the card
        renderer.setSize(cardRef.current.clientWidth, cardRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new Scene();

        const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
        camera.position.z = 5;

        const fullScreenGeometry = new PlaneGeometry(2, 2);

        const colors = INITIAL_SHADER_STATE.colors.map((color) => new Color(color));

        materialRef.current = new ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uLoopDuration: { value: 10 },
                uColors: { value: padArray(colors, 8) },
                uNumStops: { value: colors.length },
                uWarpScale: { value: INITIAL_SHADER_STATE.warpScale },
                uGrainAmount: { value: INITIAL_SHADER_STATE.grainAmount },
                uSmoothing: { value: INITIAL_SHADER_STATE.smoothing },
                uNoiseColor: { value: INITIAL_SHADER_STATE.noiseColor },
                uNoiseScale: { value: INITIAL_SHADER_STATE.noiseScale },
                uFBMOctaves: { value: INITIAL_SHADER_STATE.fbmOctaves },
                uFBMPersistence: { value: INITIAL_SHADER_STATE.fbmPersistence },
            },
        });

        const fullScreenQuad = new Mesh(fullScreenGeometry, materialRef.current);
        scene.add(fullScreenQuad);

        let animationFrameId: number;

        const clock = new Clock();
        let elapsedTime = 0;

        const animate = () => {
            renderer.render(scene, camera);
            if (materialRef.current) {
                elapsedTime += clock.getDelta() * timeScaleRef.current;
                materialRef.current.uniforms.uTime.value = elapsedTime;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        const handleResize = () => {
            if (!cardRef.current) return;
            renderer.setSize(cardRef.current.clientWidth, cardRef.current.clientHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uWarpScale.value = warpScale;
            materialRef.current.uniforms.uGrainAmount.value = grainAmount;
            materialRef.current.uniforms.uSmoothing.value = smoothing;
            materialRef.current.uniforms.uNoiseColor.value = noiseColor;
            materialRef.current.uniforms.uNoiseScale.value = noiseScale;
            materialRef.current.uniforms.uFBMOctaves.value = fbmOctaves;
            materialRef.current.uniforms.uFBMPersistence.value = fbmPersistence;
            materialRef.current.uniforms.uColors.value = padArray(
                colors.map((color) => new Color(color)),
                8
            );
            materialRef.current.uniforms.uNumStops.value = colors.length;
        }

        timeScaleRef.current = timeScale;
    }, [timeScale, warpScale, grainAmount, smoothing, noiseColor, noiseScale, fbmOctaves, fbmPersistence, colors]);

    return (
        <Card ref={cardRef} className="p-0 overflow-hidden">
            <canvas ref={canvasRef} />
        </Card>
    );
};
