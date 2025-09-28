import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  value, 
  max, 
  className,
  showPercentage = false 
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={cn("w-full bg-muted rounded-full h-2.5", className)}>
      <div 
        className={cn(
          "h-2.5 rounded-full",
          percentage > 90 ? "bg-red-500" : 
          percentage > 75 ? "bg-orange-500" : 
          "bg-primary"
        )} 
        style={{ width: `${percentage}%` }}
      ></div>
      {showPercentage && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}