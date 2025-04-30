"use client";

import { CanvasCard } from "@/components/canvas/CanvasCard";
import { ControlsCard } from "@/components/canvas/ControlsCard";
import { useEffect, useState } from "react";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-4 h-screen p-8">
            <CanvasCard />

            <ControlsCard />
        </div>
    );
}
