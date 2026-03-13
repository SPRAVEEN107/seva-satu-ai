"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Flip } from "gsap/all";

// Register all plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip);
}

// ─── 1. Hero entrance animation ──────────────────────────────────────────────
export function animateHero(selector: string) {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    gsap.from(elements, {
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out",
        clearProps: "all",
    });
}

// ─── 2. Animated counter ─────────────────────────────────────────────────────
export function animateCounter(element: HTMLElement, targetNumber: number) {
    const obj = { value: 0 };

    ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        once: true,
        onEnter: () => {
            gsap.to(obj, {
                value: targetNumber,
                duration: 2.5,
                ease: "power2.out",
                onUpdate() {
                    element.textContent = Math.round(obj.value).toLocaleString("en-IN");
                },
            });
        },
    });
}

// ─── 3. Card grid entrance ───────────────────────────────────────────────────
export function animateCards(selector: string, delay: number = 0) {
    const cards = document.querySelectorAll<HTMLElement>(selector);
    if (!cards.length) return;

    gsap.set(cards, { y: 60, opacity: 0 });

    ScrollTrigger.create({
        trigger: cards[0],
        start: "top 85%",
        once: true,
        onEnter: () => {
            gsap.to(cards, {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.7,
                ease: "back.out(1.4)",
                delay,
            });
        },
    });
}

// ─── 4. 3D card tilt on mouse move ───────────────────────────────────────────
export function addCardTilt(element: HTMLElement) {
    const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(element, {
            rotateX: -yPct * 15,
            rotateY: xPct * 15,
            transformPerspective: 800,
            duration: 0.3,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.5)",
        });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
    };
}

// ─── 5. Page transition curtain ──────────────────────────────────────────────
export function animatePageTransition(onComplete?: () => void) {
    const curtain = document.createElement("div");
    curtain.style.cssText = `
    position: fixed; top: 0; left: -100%; width: 100%; height: 100%;
    background: #FF6B00; z-index: 9999; pointer-events: none;
  `;
    document.body.appendChild(curtain);

    const tl = gsap.timeline({
        onComplete: () => {
            document.body.removeChild(curtain);
            onComplete?.();
        },
    });

    tl.to(curtain, { left: "0%", duration: 0.4, ease: "power3.out" }).to(
        curtain,
        { left: "100%", duration: 0.4, ease: "power3.in", delay: 0.1 }
    );
}

// ─── 6. Typing dots animation ────────────────────────────────────────────────
export function animateTypingDots(container: HTMLElement) {
    const dots = container.querySelectorAll<HTMLElement>(".typing-dot");
    if (!dots.length) return;

    const tween = gsap.to(dots, {
        y: -8,
        stagger: 0.15,
        duration: 0.4,
        ease: "power2.out",
        yoyo: true,
        repeat: -1,
    });

    return () => tween.kill();
}

// ─── 7. Multi-step progress stepper ─────────────────────────────────────────
export function animateStepper(activeStep: number) {
    const steps = document.querySelectorAll<HTMLElement>(".stepper-step");
    const bar = document.getElementById("stepper-bar");

    steps.forEach((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;

        gsap.to(step, {
            scale: isActive ? 1.1 : 1,
            backgroundColor: isDone ? "#138808" : isActive ? "#FF6B00" : "#1E1E2E",
            duration: 0.4,
            ease: "power2.inOut",
        });
    });

    if (bar) {
        const pct = (activeStep / (steps.length - 1)) * 100;
        gsap.to(bar, {
            width: `${pct}%`,
            duration: 0.6,
            ease: "power2.inOut",
        });
    }
}

// ─── 8. Voice recording pulse animation ─────────────────────────────────────
export function animateVoicePulse(micButton: HTMLElement) {
    const ring = micButton.querySelector<HTMLElement>(".voice-ring");
    if (!ring) return;

    const tween = gsap.to(ring, {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        yoyo: false,
        repeat: -1,
    });

    return () => {
        tween.kill();
        gsap.set(ring, { scale: 1, opacity: 1 });
    };
}

// ─── 9. Submit success confetti ──────────────────────────────────────────────
export function animateSubmitSuccess(container: HTMLElement) {
    const colors = ["#FF6B00", "#0047AB", "#138808", "#FFD700", "#FF4444", "#FFFFFF"];
    const particles: HTMLElement[] = [];

    for (let i = 0; i < 30; i++) {
        const p = document.createElement("div");
        p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      top: 50%; left: 50%;
      pointer-events: none;
    `;
        container.appendChild(p);
        particles.push(p);

        gsap.to(p, {
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            rotation: Math.random() * 720,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
                if (p.parentNode) p.parentNode.removeChild(p);
            },
        });
    }
}

// ─── 10. Navbar scroll effect ────────────────────────────────────────────────
export function animateNavbar(navbarId: string) {
    const navbar = document.getElementById(navbarId);
    if (!navbar) return;

    ScrollTrigger.create({
        start: "80px top",
        onEnter: () => {
            gsap.to(navbar, {
                backgroundColor: "rgba(10,10,15,0.85)",
                backdropFilter: "blur(12px)",
                borderBottomColor: "rgba(255,107,0,0.2)",
                duration: 0.3,
                ease: "power2.inOut",
            });
        },
        onLeaveBack: () => {
            gsap.to(navbar, {
                backgroundColor: "transparent",
                backdropFilter: "blur(0px)",
                borderBottomColor: "transparent",
                duration: 0.3,
                ease: "power2.inOut",
            });
        },
    });
}

// ─── Typewriter effect using GSAP TextPlugin ────────────────────────────────
export function animateTypewriter(element: HTMLElement, text: string, duration: number = 2) {
    gsap.to(element, {
        text: { value: text, delimiter: "" },
        duration,
        ease: "none",
    });
}

// ─── Score bar animation ─────────────────────────────────────────────────────
export function animateScoreBar(barElement: HTMLElement, score: number) {
    gsap.set(barElement, { width: "0%" });
    ScrollTrigger.create({
        trigger: barElement,
        start: "top 90%",
        once: true,
        onEnter: () => {
            gsap.to(barElement, {
                width: `${score}%`,
                duration: 1,
                ease: "power2.out",
            });
        },
    });
}

export { gsap, ScrollTrigger };
