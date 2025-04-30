"use client";

import { useShaderStore } from "@/store/ShaderSlice";
import {
    Angry,
    Baby,
    ChartLine,
    ChartSpline,
    Cone,
    Cylinder,
    Rabbit,
    Shell,
    Sparkle,
    Sparkles,
    Target,
    Turtle,
    Wheat,
    WheatOff,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { ColorPicker } from "./ColorPicker";

export const ControlsCard = () => {
    const {
        timeScale,
        warpScale,
        grainAmount,
        smoothing,
        noiseColor,
        noiseScale,
        fbmOctaves,
        fbmPersistence,
        setTimeScale,
        setWarpScale,
        setGrainAmount,
        setSmoothing,
        setNoiseColor,
        setNoiseScale,
        setFBMOctaves,
        setFBMPersistence,
    } = useShaderStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Colors</Label>
                    <ColorPicker />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time-scale">Speed</Label>
                    <WithIcons low={<Turtle size={16} />} high={<Rabbit size={16} />}>
                        <Slider
                            id="time-scale"
                            value={[timeScale]}
                            onValueChange={([value]) => setTimeScale(value)}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </WithIcons>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="noise-scale">Zoom</Label>
                    <WithIcons low={<ZoomIn size={16} />} high={<ZoomOut size={16} />}>
                        <Slider
                            id="noise-scale"
                            value={[noiseScale]}
                            onValueChange={([value]) => setNoiseScale(value)}
                            min={0.1}
                            max={5}
                            step={0.1}
                        />
                    </WithIcons>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="warp-scale">Warp Amount</Label>
                    <WithIcons low={<Target size={16} />} high={<Shell size={16} />}>
                        <Slider
                            id="warp-scale"
                            value={[warpScale]}
                            onValueChange={([value]) => setWarpScale(value)}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </WithIcons>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="smoothing">Smoothness</Label>
                    <WithIcons low={<ChartSpline size={16} />} high={<ChartLine size={16} />}>
                        <Slider
                            id="smoothing"
                            value={[smoothing]}
                            onValueChange={([value]) => setSmoothing(value)}
                            min={1}
                            max={10}
                            step={0.1}
                        />
                    </WithIcons>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="grain-amount">Graininess</Label>
                    <WithIcons low={<WheatOff size={16} />} high={<Wheat size={16} />}>
                        <Slider
                            id="grain-amount"
                            value={[grainAmount]}
                            onValueChange={([value]) => setGrainAmount(value)}
                            min={0}
                            max={0.33}
                            step={0.001}
                        />
                    </WithIcons>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="noise-color">Grain Color</Label>

                    <WithIcons low={<Cylinder size={16} />} high={<Cone size={16} />}>
                        <Slider
                            id="noise-color"
                            value={[noiseColor]}
                            onValueChange={([value]) => setNoiseColor(value)}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </WithIcons>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fbm-octaves">Detail</Label>
                    <WithIcons low={<Sparkle size={16} />} high={<Sparkles size={16} />}>
                        <Slider
                            id="fbm-octaves"
                            value={[fbmOctaves]}
                            onValueChange={([value]) => setFBMOctaves(Math.round(value))}
                            min={1}
                            max={8}
                            step={1}
                        />
                    </WithIcons>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fbm-persistence">Roughness</Label>
                    <WithIcons low={<Baby size={16} />} high={<Angry size={16} />}>
                        <Slider
                            id="fbm-persistence"
                            value={[fbmPersistence]}
                            onValueChange={([value]) => setFBMPersistence(value)}
                            min={0.1}
                            max={0.8}
                            step={0.001}
                        />
                    </WithIcons>
                </div>
            </CardContent>
        </Card>
    );
};

const WithIcons = ({ low, high, children }: { low: ReactNode; high: ReactNode; children: ReactNode }) => {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center">{low}</div>

            {children}
            <div className="flex flex-col items-center">{high}</div>
        </div>
    );
};
