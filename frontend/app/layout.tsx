import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import AiVoiceAssistant from "@/lib/AiVoiceAssistant";

export const metadata: Metadata = {
    title: "SevaSetu — Citizen-Government Bridge for Rural India",
    description:
        "One platform connecting every citizen to every government scheme. Find eligibility, apply for benefits, file grievances — all in your language.",
    keywords: "government schemes, India, rural, PM Kisan, Ayushman Bharat, eligibility, AI",
    openGraph: {
        title: "SevaSetu",
        description: "AI-powered access to 1000+ government schemes in your language",
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
                </LanguageProvider>
            </body>
        </html>
    );
}
