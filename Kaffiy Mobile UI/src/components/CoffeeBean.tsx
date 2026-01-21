import { cn } from "@/lib/utils";

interface CoffeeBeanProps {
  filled: boolean;
  index?: number;
  size?: "sm" | "md" | "lg";
}

const CoffeeBean = ({ filled, index = 0, size = "md" }: CoffeeBeanProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-lg",
    md: "w-8 h-8 text-2xl",
    lg: "w-10 h-10 text-3xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        sizeClasses[size],
        filled && "animate-bean-fill"
      )}
      style={{ animationDelay: filled ? `${index * 0.1}s` : "0s" }}
    >
      <span
        className={cn(
          "transition-all duration-300",
          filled ? "text-coffee-filled opacity-100" : "text-coffee-empty opacity-60",
          filled && "drop-shadow-sm"
        )}
      >
        ☕
      </span>
    </div>
  );
};

export default CoffeeBean;
