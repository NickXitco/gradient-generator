"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useShaderStore } from "@/store/ShaderSlice";
import { X } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";

export const ColorPicker = () => {
    const { colors, setColor, addColor, removeColor } = useShaderStore();

    const gradientStyle = {
        background: `linear-gradient(to right, ${colors.join(", ")})`,
    };

    const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;

        // Find the two colors this point is between
        const segmentLength = 1 / (colors.length - 1);
        const index = Math.floor(percentage / segmentLength);
        const color1 = colors[index];
        const color2 = colors[index + 1];

        // Interpolate between the two colors
        const t = (percentage - index * segmentLength) / segmentLength;
        const newColor = interpolateColor(color1, color2, t);

        addColor(index, newColor);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {colors.map((color, index) => (
                    <div key={index} className="group relative">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="h-8 w-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0">
                                <HexColorPicker
                                    color={color}
                                    onChange={(newColor: string) => setColor(index, newColor)}
                                />
                                <HexColorInput
                                    color={color}
                                    onChange={(newColor: string) => setColor(index, newColor)}
                                    placeholder={color}
                                    prefixed
                                />
                            </PopoverContent>
                        </Popover>
                        {colors.length > 2 && (
                            <button
                                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:bg-red-600 group-hover:flex"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeColor(index);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div
                className="relative h-8 w-full cursor-pointer rounded-md"
                style={gradientStyle}
                onClick={handleBarClick}
            >
                {colors.map((_, index) => (
                    <div
                        key={index}
                        className="absolute h-full w-1 bg-white opacity-0 transition-opacity hover:opacity-100"
                        style={{
                            left: `${(index / (colors.length - 1)) * 100}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Helper function to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
