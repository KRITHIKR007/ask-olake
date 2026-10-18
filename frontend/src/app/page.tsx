import { ChatWidget } from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Hero section */}
      <div className="text-center mb-6 mt-8 sm:mt-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Ask <span className="text-blue-600">OLake</span>
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          AI-powered documentation assistant for OLake. Get instant answers about setup, connectors, deployment, and more.
        </p>
      </div>

      {/* Chat widget */}
      <div className="w-full max-w-3xl flex-1 flex flex-col min-h-0" style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}>
        <ChatWidget />
      </div>

      {/* Footer */}
      <footer className="mt-4 mb-2 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Powered by{" "}
          <a href="https://olake.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            OLake
          </a>{" "}
          documentation •{" "}
          <a href="https://olake.io/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Docs
          </a>{" "}
          •{" "}
          <a href="https://github.com/datazip-inc/olake" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
