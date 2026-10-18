import { ChatWidget } from "@/components/ChatWidget";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Layers } from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-background p-3 sm:p-5 lg:p-6 text-foreground">
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Ask <span className="text-blue-600">OLake</span>
              </h1>
              <Badge variant="brand" className="text-[10px] h-4.5 px-1.5 font-mono">
                Iceberg Lakehouse
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI technical documentation & troubleshooting assistant
            </p>
          </div>
        </div>

        {/* Links & Attribution */}
        <div className="flex items-center gap-2">
          <a
            href="https://olake.io/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>Docs</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>

          <a
            href="https://github.com/datazip-inc/olake"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Chat Interface */}
      <section className="w-full max-w-4xl flex-1 flex flex-col min-h-0" style={{ height: "calc(100vh - 120px)" }}>
        <ChatWidget />
      </section>

      {/* Subtle Footer */}
      <footer className="mt-3 text-center text-[11px] text-muted-foreground">
        <span>Grounded on official </span>
        <a
          href="https://olake.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-blue-600 underline underline-offset-2"
        >
          OLake
        </a>
        <span> documentation and repositories • Fast replication to Apache Iceberg</span>
      </footer>
    </main>
  );
}
