"use client";

import Navbar from "@/components/Navbar";
import GrievanceForm from "@/components/GrievanceForm";
import { useLanguage } from "@/lib/LanguageContext";

export default function GrievancePage() {
    const { translate } = useLanguage();
    return (
        <>
            <Navbar />
            <main className="min-h-screen mesh-bg pt-16">
                <section className="py-12 px-4 text-center border-b border-card-border">
                    <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
                        {translate("Grievance")} <span className="saffron-text">{translate("Portal")}</span>
                    </h1>
                    <p className="text-muted text-sm">
                        {translate("AI-classified complaints routed to the correct department. Get resolution in")} {" "}
                        <span className="text-saffron">{translate("15–45 days")}</span>.
                    </p>
                </section>
                <div className="py-10 px-4">
                    <GrievanceForm />
                </div>
            </main>
        </>
    );
}
