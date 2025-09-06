import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "green" | "red" | "yellow";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  barClassName,
  size = "md",
  color = "blue",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
  };

  // Map common percentages to Tailwind classes to avoid inline styles
  const getWidthClass = (percent: number): string => {
    if (percent >= 100) return "w-full";
    if (percent >= 75) return "w-3/4";
    if (percent >= 66) return "w-2/3";
    if (percent >= 50) return "w-1/2";
    if (percent >= 40) return "w-2/5";
    if (percent >= 33) return "w-1/3";
    if (percent >= 25) return "w-1/4";
    if (percent >= 20) return "w-1/5";
    if (percent >= 16) return "w-1/6";
    if (percent === 0) return "w-0";

    // For dynamic values, we still need to use inline styles but with data attributes for clarity
    return "";
  };

  const widthClass = getWidthClass(percentage);

  return (
    <div
      className={cn(
        "bg-gray-200 rounded-full overflow-hidden",
        sizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          colorClasses[color],
          widthClass,
          barClassName,
        )}
        {...(!widthClass && {
          style: { width: `${percentage}%` },
          "data-dynamic-width": true,
        })}
      />
    </div>
  );
};
