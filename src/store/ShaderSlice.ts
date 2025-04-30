import { create, StateCreator } from "zustand";
import { serializeShaderState, deserializeShaderState } from "@/utils/urlParams";

interface ShaderState {
    timeScale: number;
    warpScale: number;
    grainAmount: number;
    smoothing: number;
    noiseColor: number;
    noiseScale: number;
    fbmOctaves: number;
    fbmPersistence: number;
    colors: string[];
}

interface ShaderActions {
    setTimeScale: (value: number) => void;
    setWarpScale: (value: number) => void;
    setGrainAmount: (value: number) => void;
    setSmoothing: (value: number) => void;
    setNoiseColor: (value: number) => void;
    setNoiseScale: (value: number) => void;
    setFBMOctaves: (value: number) => void;
    setFBMPersistence: (value: number) => void;
    setColor: (index: number, color: string) => void;
    addColor: (index: number, color: string) => void;
    removeColor: (index: number) => void;
}

export const INITIAL_SHADER_STATE: ShaderState = {
    timeScale: 0.1,
    warpScale: 0.04,
    grainAmount: 0.056,
    smoothing: 2.6,
    noiseColor: 0.15,
    noiseScale: 0.6,
    fbmOctaves: 2,
    fbmPersistence: 0.492,
    colors: ["#a1a8eb", "#050862"],
};

type ShaderStore = ShaderState & ShaderActions;

// Create a middleware that syncs URL on state changes
const urlSyncMiddleware =
    <T extends ShaderStore>(config: StateCreator<T>): StateCreator<T> =>
    (set, get, store) => {
        return config(
            (args) => {
                set(args);
                // Update URL after state changes
                const state = get();
                const filteredState = Object.fromEntries(
                    Object.entries(state).filter(([key]) => key in INITIAL_SHADER_STATE)
                );
                const params = serializeShaderState(filteredState as ShaderState);
                const newUrl = params ? `${window.location.pathname}?${params}` : window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            },
            get,
            store
        );
    };

export const useShaderStore = create<ShaderStore>()(
    urlSyncMiddleware((set) => {
        // Initialize from URL params if present
        const searchParams =
            typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
        const initialState = searchParams.toString() ? deserializeShaderState(searchParams) : INITIAL_SHADER_STATE;

        return {
            ...initialState,
            setTimeScale: (value: number) => set({ timeScale: value }),
            setWarpScale: (value: number) => set({ warpScale: value }),
            setGrainAmount: (value: number) => set({ grainAmount: value }),
            setSmoothing: (value: number) => set({ smoothing: value }),
            setNoiseColor: (value: number) => set({ noiseColor: value }),
            setNoiseScale: (value: number) => set({ noiseScale: value }),
            setFBMOctaves: (value: number) => set({ fbmOctaves: value }),
            setFBMPersistence: (value: number) => set({ fbmPersistence: value }),
            setColor: (index: number, color: string) =>
                set((state) => {
                    const newColors = [...state.colors];
                    newColors[index] = color;
                    return { colors: newColors };
                }),
            addColor: (index: number, color: string) =>
                set((state) => {
                    const newColors = [...state.colors];
                    newColors.splice(index + 1, 0, color);
                    return { colors: newColors };
                }),
            removeColor: (index: number) =>
                set((state) => {
                    if (state.colors.length <= 2) return state;
                    const newColors = [...state.colors];
                    newColors.splice(index, 1);
                    return { colors: newColors };
                }),
        };
    })
);
