import { ChatWidget } from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background text-foreground p-0 m-0">
      <ChatWidget />
    </main>
  );
}
