interface MiniSpookyLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function MiniSpookyLoader({ 
  message = "Loading...", 
  size = "md" 
}: MiniSpookyLoaderProps) {
  const sizeClasses = {
    sm: "text-lg p-4",
    md: "text-xl p-6", 
    lg: "text-2xl p-8"
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}>
      {/* Animated skull */}
      <div className="relative mb-3">
        <div className={`${iconSizes[size]} animate-pulse`}>💀</div>
        <div className={`absolute inset-0 ${iconSizes[size]} animate-ping opacity-30`}>👻</div>
      </div>
      
      {/* Loading text */}
      <p className="text-gray-300 animate-pulse font-medium">
        {message}
      </p>
      
      {/* Mini loading dots */}
      <div className="flex gap-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}