import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Map = lazy(() => import("./LocationPickerMap"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

export function LocationPicker(props: {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-lg border border-border">
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <Map {...props} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}