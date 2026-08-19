import { Suspense } from "react";
import { PinEntry } from "@/components/PinEntry";

// Full-screen PIN gate (item 1). Kept as its own route (rather than a
// root-layout overlay) so proxy.ts can redirect here with a plain
// server-side redirect before any protected data ever loads client-side.
export default function EntrarPage() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-0 sm:px-4 py-0 sm:py-6">
      <Suspense fallback={null}>
        <PinEntry />
      </Suspense>
    </div>
  );
}
