import CoffeeBean from "./CoffeeBean";

interface ProgressBarProps {
  current: number;
  total: number;
  size?: "sm" | "md" | "lg";
}

const ProgressBar = ({ current, total, size = "md" }: ProgressBarProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          {current}/{total} ziyaret tamamlandı
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <CoffeeBean
            key={index}
            filled={index < current}
            index={index}
            size={size}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
