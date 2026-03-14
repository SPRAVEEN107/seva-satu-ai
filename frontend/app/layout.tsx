import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import AiVoiceAssistant from "@/lib/AiVoiceAssistant";
import VoiceAssistant from "@/components/VoiceAssistant";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

export const metadata: Metadata = {
    title: "SevaSetu — National Single Window Portal | Govt of India",
    description:
        "National Single Window Portal (NSWP) — One platform for all Central & State Government Schemes. Accessible to all citizens including blind, deaf & speech-impaired. AI-powered in 14+ languages.",
    keywords: "NSWP, National Single Window Portal, government schemes, India, PM Kisan, Ayushman Bharat, BPL schemes, women schemes, SevaSetu, Digital India",
    openGraph: {
        title: "SevaSetu NSWP — National Single Window Portal",
        description: "All Government Schemes. All Citizens. All Languages.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Yatra+One&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-dark-bg text-text-primary font-body antialiased">
                <LanguageProvider>
                    {children}
                    <AiVoiceAssistant />
                    <VoiceAssistant />
                    <AccessibilityToolbar />
                </LanguageProvider>
            </body>
        </html>
    );
}
