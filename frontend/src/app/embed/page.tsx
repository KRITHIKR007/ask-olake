import { ChatWidget } from "@/components/ChatWidget";

export const metadata = {
  title: "Ask OLake — Embeddable Chat",
  description: "Embeddable OLake documentation assistant widget",
};

export default function EmbedPage() {
  return (
    <div className="w-full h-screen p-0 m-0 bg-white dark:bg-gray-950">
      <ChatWidget />
    </div>
  );
}
