import { LoadingSpinner } from "./loading-spinner";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-sm text-muted-foreground animate-pulse">
          Yükleniyor...
        </div>
      </div>
    </div>
  );
}
