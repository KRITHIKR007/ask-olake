import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen,
  Code2,
  Terminal,
  FileText,
  UserCheck,
  GitBranch,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
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

export const metadata = {
  title: "Ask OLake — AI Architecture & Docs Assistant",
  description:
    "Intelligent documentation assistant for OLake: the fastest database replication tool to Apache Iceberg data lakes.",
};

export default function LandingPage() {
  const samplePrompts = [
    {
      title: "MySQL CDC to Iceberg",
      query: "How does OLake Go replicate MySQL to Iceberg without Debezium?",
      tag: "OLake Go",
    },
    {
      title: "Table Maintenance",
      query: "Explain Iceberg table maintenance with OLake Fusion compaction",
      tag: "OLake Fusion",
    },
    {
      title: "PostgreSQL Setup",
      query: "Step-by-step CDC setup for PostgreSQL with logical decoding",
      tag: "Configuration",
    },
  ];

  return (
    <div className="min-h-screen bg-ambient-mesh text-foreground selection:bg-blue-600/20 selection:text-blue-500">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand (Clean raw logo - NO BUBBLE) */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/olake-logo.svg"
              alt="OLake Logo"
              className="h-7 w-7 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                Ask OLake
              </span>
              <span className="hidden sm:inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Iceberg RAG
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a
              href="#overview"
              className="hover:text-foreground transition-colors"
            >
              Overview
            </a>
            <a
              href="#architecture"
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </a>
            <a
              href="#benchmark"
              className="hover:text-foreground transition-colors"
            >
              QA Benchmark
            </a>
            <a
              href="#author"
              className="hover:text-foreground transition-colors"
            >
              Author
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/KRITHIKR007/ask-olake"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-all shadow-2xs"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>

            {/* Primary CTA: Talk to Ask OLake */}
            <Link
              href="/chat"
              id="cta-nav-talk"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Talk to Ask OLake</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dual Engine • OLake Go (CDC) + OLake Fusion (Maintenance)</span>
          </div>

          {/* Pure Logo Presentation (No Bubble Container) */}
          <div className="flex justify-center mb-6">
            <img
              src="/olake-logo.svg"
              alt="OLake"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Main Headline */}
          <h1
            className="font-black tracking-tight text-foreground max-w-3xl mx-auto"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.15 }}
          >
            Instant AI Documentation & Architecture for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              OLake
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            The intelligent technical assistant for replicating production
            databases into <strong className="font-semibold text-foreground">Apache Iceberg</strong> data
            lakes. Grounded across official OLake repositories, connector specs,
            CDC protocols, and table compaction maintenance.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href="/chat"
              id="cta-hero-talk"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Talk to Ask OLake</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#overview"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-all shadow-2xs cursor-pointer"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Key Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3.5 text-left max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                4,586
              </div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                Chunks Indexed
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Complete OLake docs, core repo, & specs
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
                1.09 ms
              </div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                Cosine Similarity
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Pure NumPy vector search, zero C++ bloat
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                QA Audit Passed
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Zero hallucinations on official benchmark
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                8 Sources
              </div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                CDC & Batch Covered
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Postgres, MySQL, Mongo, Oracle, Kafka...
              </div>
            </div>
          </div>

          {/* Interactive Question Prompts */}
          <div className="mt-12 text-left max-w-4xl mx-auto">
            <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3 text-center">
              Popular questions developers ask:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {samplePrompts.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/chat?q=${encodeURIComponent(item.query)}`}
                  className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/70 p-3.5 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    "{item.query}"
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* App Overview Section */}
      <section
        id="overview"
        className="py-16 sm:py-24 border-t border-border/60 bg-card/30"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
              System Architecture
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              What is OLake & What Does Ask OLake Solve?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              OLake is the high-performance open-source replication engine that
              streams databases directly to Apache Iceberg data lakes with sub-minute
              latency. Ask OLake provides instant, verified answers across both
              subsystems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OLake Go Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      OLake Go Engine
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      CDC & Batch Database Replication
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Extracts data from 8 production source systems with native log
                  readers. Bypasses Kafka and Debezium complexity by writing directly
                  to Apache Iceberg format.
                </p>

                <ul className="space-y-2.5 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Native Log Parsing:</strong> Postgres WAL, MySQL binlog,
                      MongoDB oplog with low overhead.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Adaptive Batching:</strong> High-throughput Parquet chunking
                      aligned to Iceberg partition layout.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Schema Evolution:</strong> Automatic column additions and
                      type promotions without job restarts.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Connector Suite: 8 Supported
                </span>
                <Link
                  href="/chat?q=What+connectors+does+OLake+support?"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Ask about connectors <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* OLake Fusion Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-amber-400/60 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      OLake Fusion
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Automated Iceberg Table Maintenance
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Continuous maintenance daemon that keeps Apache Iceberg lakehouses
                  performant and cost-efficient by optimizing layout and cleaning
                  orphaned data files.
                </p>

                <ul className="space-y-2.5 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>File Compaction:</strong> Bin-packs small CDC commits into
                      optimal target files (128MB-512MB).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Snapshot Expiration:</strong> Prunes historical snapshots to
                      reclaim S3/GCS storage costs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Table Health Scoring:</strong> Monitors read-amplification
                      and triggers proactive compaction.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Maintenance: Auto Compaction
                </span>
                <Link
                  href="/chat?q=How+does+OLake+Fusion+handle+compaction?"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  Ask about Fusion <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benchmarks & Official QA Audit */}
      <section
        id="benchmark"
        className="py-16 sm:py-24 border-t border-border/60"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              Verified Reliability
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Official QA Audit & Grounding Standards
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Tested against Datazip's official test suite covering Iceberg format
              specifications, connector setup, and failure modes with 100% precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-foreground">
                  Zero Hallucination Policy
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Answers are strictly synthesized from indexed documentation chunks.
                Every response provides verifiable source URLs pointing directly to
                the exact document or repository file.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-sky-600" />
                <h4 className="text-sm font-bold text-foreground">
                  NumPy Fast Vector Cosine
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engineered with pure NumPy vectorized matrix multiplication.
                Zero C++ OpenMP runtime dependencies, delivering 1.09 ms query search
                with rock-solid Vercel serverless stability.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-foreground">
                  Session Persistence
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conversations are preserved in browser tab storage (`sessionStorage`)
                with instant restoration, multi-thread switching, and zero server-side
                data leak risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section
        id="author"
        className="py-16 sm:py-24 border-t border-border/60 bg-card/40"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card to-background p-8 sm:p-12 shadow-sm text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
              Developer & Architect
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-foreground">
              Created by Krithik R
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
              Designed and built Ask OLake as a high-precision, production-grade
              documentation intelligence engine. Features a dual-engine knowledge
              pipeline, sub-millisecond vector cosine search, and seamless serverless
              execution.
            </p>

            {/* Author Links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://krithik-r.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                id="author-portfolio-link"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <span>Visit Portfolio</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href="https://github.com/KRITHIKR007/ask-olake"
                target="_blank"
                rel="noopener noreferrer"
                id="author-github-link"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-all shadow-2xs"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>

            {/* Tech Stack Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="rounded-md bg-muted px-2.5 py-1">FastAPI</span>
              <span className="rounded-md bg-muted px-2.5 py-1">Next.js 15</span>
              <span className="rounded-md bg-muted px-2.5 py-1">Apache Iceberg</span>
              <span className="rounded-md bg-muted px-2.5 py-1">NumPy Vector Cosine</span>
              <span className="rounded-md bg-muted px-2.5 py-1">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20 border-t border-border/60 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Ready to Explore OLake Documentation?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Get instant, grounded answers about connector configurations, CDC
            replication, and table maintenance.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/chat"
              id="cta-bottom-talk"
              className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Talk to Ask OLake</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 bg-card/20 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/olake-logo.svg"
              alt="OLake"
              className="h-4 w-4 object-contain"
            />
            <span className="font-semibold text-foreground">Ask OLake</span>
            <span>— AI Assistant for Apache Iceberg Data Lakes</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://olake.io/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Official Docs
            </a>
            <a
              href="https://github.com/datazip-inc/olake"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              OLake Core
            </a>
            <a
              href="https://krithik-r.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Krithik R
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
