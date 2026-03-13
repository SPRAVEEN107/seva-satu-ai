"use client";

import { useEffect, useRef } from "react";
import { addCardTilt, animateScoreBar } from "@/lib/gsap";
import type { Scheme, SuggestedScheme } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

interface SchemeCardProps {
    scheme: Scheme | SuggestedScheme;
    matchScore?: number;
    isEligible?: boolean;
    onApply?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Agriculture: "#138808",
    Health: "#DC3545",
    Housing: "#0047AB",
    Education: "#6F42C1",
    Women: "#E83E8C",
    Business: "#FD7E14",
    Employment: "#20C997",
    "Senior Citizen": "#6C757D",
    default: "#FF6B00",
};

export default function SchemeCard({ scheme, matchScore, isEligible, onApply }: SchemeCardProps) {
    const { translate } = useLanguage();
    const cardRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    const name = "name" in scheme ? scheme.name : "";
    const ministry = "ministry" in scheme ? scheme.ministry : undefined;
    const category = "category" in scheme ? scheme.category : undefined;
    const description =
        "description" in scheme
            ? scheme.description
            : "eligibility_reason" in scheme
                ? scheme.eligibility_reason
                : undefined;
    const benefitAmount =
        "benefit_amount" in scheme ? scheme.benefit_amount : "benefit" in scheme ? scheme.benefit : undefined;
    const applyUrl = "apply_url" in scheme ? scheme.apply_url : undefined;
    const score = matchScore ?? ("match_score" in scheme ? (scheme as SuggestedScheme).match_score : undefined);

    const catColor = CATEGORY_COLORS[category || "default"] || CATEGORY_COLORS.default;

    useEffect(() => {
        if (cardRef.current) addCardTilt(cardRef.current);
        if (barRef.current && score !== undefined) animateScoreBar(barRef.current, score);
    }, [score]);

    return (
        <div
            ref={cardRef}
            className="scheme-card glass-card rounded-2xl p-5 flex flex-col gap-4 border border-card-border"
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: catColor + "33", border: `1px solid ${catColor}66` }}
                >
                    <span style={{ color: catColor }}>
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base text-text-primary leading-tight line-clamp-2">
                        {name}
                    </h3>
                    {ministry && (
                        <p className="text-muted text-xs mt-0.5 truncate">{ministry}</p>
                    )}
                </div>
                {category && (
                    <span
                        className="badge text-xs flex-shrink-0"
                        style={{ backgroundColor: catColor + "20", color: catColor }}
                    >
                        {category}
                    </span>
                )}
            </div>

            {/* Benefit amount */}
            {benefitAmount && (
                <div className="text-saffron font-bold text-lg font-mono">
                    {benefitAmount}
                </div>
            )}

            {/* Description */}
            {description && (
                <p className="text-muted text-sm leading-relaxed line-clamp-2">{description}</p>
            )}

            {/* Match score */}
            {score !== undefined && (
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <span
                            className={`text-xs font-medium ${isEligible !== false
                                    ? score >= 70
                                        ? "text-india-green"
                                        : "text-amber-400"
                                    : "text-muted"
                                }`}
                        >
                            {score >= 70 ? translate("✓ Likely Eligible") : translate("~ Partial Match")}
                        </span>
                        <span className="text-xs text-muted font-mono">{score}%</span>
                    </div>
                    <div className="score-bar-track">
                        <div
                            ref={barRef}
                            className="score-bar-fill"
                            style={{ width: "0%" }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-1">
                {onApply ? (
                    <button
                        onClick={onApply}
                        className="btn-saffron flex-1 py-2 rounded-lg text-sm font-medium"
                    >
                        {translate("Apply Now →")}
                    </button>
                ) : applyUrl ? (
                    <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-saffron flex-1 py-2 rounded-lg text-sm font-medium text-center"
                    >
                        {translate("Apply Now →")}
                    </a>
                ) : null}
                {applyUrl && (
                    <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline px-3 py-2 rounded-lg text-sm font-medium"
                    >
                        {translate("Learn More")}
                    </a>
                )}
            </div>
        </div>
    );
}
