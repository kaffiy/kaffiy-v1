interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  compact?: boolean;
}

const StepProgress = ({ currentStep, totalSteps, stepLabels, compact = false }: StepProgressProps) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  if (compact) {
    return (
      <div className="w-full px-4 py-3">
        {/* Progress Bar Container */}
        <div className="relative">
          {/* Background Track */}
          <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-2 -mb-1">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-sm scale-110"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-110"
                      : "bg-secondary text-muted-foreground/70 scale-100"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Step Text */}
        <div className="mt-2 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Adım {currentStep} / {totalSteps}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-4">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                {stepLabels && stepLabels[index] && (
                  <span
                    className={`text-[10px] mt-1 text-center ${
                      isCurrent || isCompleted
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stepLabels[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Step Text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          Adım {currentStep} / {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default StepProgress;
