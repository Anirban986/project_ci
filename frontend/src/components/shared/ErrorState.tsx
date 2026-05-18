import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger-500" />
      </div>
      <p className="font-semibold text-neutral-700 font-display mb-1">Oops!</p>
      <p className="text-sm text-neutral-500 max-w-xs">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
