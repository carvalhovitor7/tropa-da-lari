import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-0 sm:px-4 py-0 sm:py-6">
      <AppProvider>
        <AppShell />
      </AppProvider>
    </div>
  );
}
