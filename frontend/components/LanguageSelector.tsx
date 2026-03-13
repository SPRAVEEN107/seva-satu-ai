"use client";

interface LanguageSelectorProps {
    selected: string;
    onChange: (code: string) => void;
    className?: string;
}

const LANGUAGES = [
    { code: "hi", label: "हिंदी" },
    { code: "te", label: "తెలుగు" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "mr", label: "मराठी" },
    { code: "ta", label: "தமிழ்" },
    { code: "en", label: "English" },
];

export default function LanguageSelector({ selected, onChange, className = "" }: LanguageSelectorProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => onChange(lang.code)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${selected === lang.code
                            ? "bg-saffron border-saffron text-white"
                            : "border-card-border text-muted hover:border-saffron/50 hover:text-text-primary"
                        }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
