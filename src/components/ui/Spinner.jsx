import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Spinner({ className, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-400">
      <Loader2 className={cn("h-6 w-6 animate-spin", className)} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
