import { INITIAL_SHADER_STATE } from "@/store/ShaderSlice";
import { Color } from "three";

type ShaderState = typeof INITIAL_SHADER_STATE;

export const serializeShaderState = (state: ShaderState) => {
    const params = new URLSearchParams();

    // Only serialize values that differ from initial state
    Object.entries(state).forEach(([key, value]) => {
        if (key === "colors") {
            const colors = value.map((color: Color) => color.toString());
            const colorString = colors.map((color: string) => color.replace("#", "")).join(",");
            params.set(key, colorString);
        } else {
            params.set(key, value.toString());
        }
    });

    return params.toString();
};

export const deserializeShaderState = (searchParams: URLSearchParams) => {
    const state = { ...INITIAL_SHADER_STATE };

    try {
        searchParams.forEach((value, key) => {
            if (key === "colors") {
                try {
                    const colors = value.split(",").map((color: string) => `#${color}`);
                    state.colors = colors;
                } catch (e) {
                    console.error("Failed to parse colors from URL", e);
                }
            } else if (key in state) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    (state[key as keyof ShaderState] as number) = numValue;
                }
            }
        });
    } catch (e) {
        console.error("Failed to deserialize shader state", e);
        return INITIAL_SHADER_STATE;
    }

    return state;
};
