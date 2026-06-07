import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import "./types/global.d.ts";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi-config';

const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Intelligence = lazy(() => import("./pages/Intelligence.tsx"));
const Indices = lazy(() => import("./pages/Indices.tsx"));
const Execution = lazy(() => import("./pages/Execution.tsx"));
const Risk = lazy(() => import("./pages/Risk.tsx"));
const Audit = lazy(() => import("./pages/Audit.tsx"));
const Deploy = lazy(() => import("./pages/Deploy.tsx"));
const Download = lazy(() => import("./pages/Download.tsx"));
const Whitepaper = lazy(() => import("./pages/Whitepaper.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050507' }}>
      <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#00f0ff' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00f0ff', animation: 'pulse-live 2s infinite' }} />
        ARGOS // INITIALIZING
      </div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const queryClient = new QueryClient();

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*");
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConvexAuthProvider client={convex}>
            <BrowserRouter>
              <RouteSyncer />
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<AuthPage redirectAfterAuth="/" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/indices" element={<Indices />} />
                  <Route path="/execution" element={<Execution />} />
                  <Route path="/risk" element={<Risk />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/download" element={<Download />} />
                  <Route path="/deploy" element={<Deploy />} />
                  <Route path="/whitepaper" element={<Whitepaper />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster position="bottom-right" toastOptions={{
              style: { background: '#0a0a10', border: '1px solid #1e1e2e', color: '#e8e8ed', fontFamily: 'monospace', fontSize: '12px' },
            }} />
          </ConvexAuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </InstrumentationProvider>
  </StrictMode>,
);