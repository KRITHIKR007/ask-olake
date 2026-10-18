import { ChatWidget } from "@/components/ChatWidget";

export const metadata = {
  title: "Chat — Ask OLake AI Documentation Assistant",
  description:
    "Interactive technical AI assistant for OLake and Apache Iceberg data lakes.",
};

export default function ChatPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background text-foreground p-0 m-0">
      <ChatWidget />
    </main>
  );
}
