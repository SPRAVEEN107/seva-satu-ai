"use client";

import { useEffect, useRef } from "react";
import { animateCounter } from "@/lib/gsap";

interface AnimatedCounterProps {
    target: number;
    suffix?: string;
    className?: string;
}

export default function AnimatedCounter({ target, suffix = "", className = "" }: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (ref.current) animateCounter(ref.current, target);
    }, [target]);

    return (
        <span className={className}>
            <span ref={ref}>0</span>
            {suffix}
        </span>
    );
}
