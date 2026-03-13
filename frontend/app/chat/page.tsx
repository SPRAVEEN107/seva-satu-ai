import ChatInterface from "@/components/ChatInterface";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Chat — Savasetu AI",
    description: "Chat with Savasetu AI to discover government schemes, check eligibility, and file grievances in your language.",
};

export default function ChatPage() {
    return <ChatInterface />;
}
