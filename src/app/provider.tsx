// app/providers.tsx
"use client";
import { useSync } from "@/hooks/useSync";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

function SyncProvider({ children }: { children: React.ReactNode }) {
  useSync()
  return <>{ children }</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
         <SyncProvider>{children}</SyncProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}