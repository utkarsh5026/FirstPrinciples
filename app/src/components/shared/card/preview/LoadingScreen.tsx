const LoadingScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[300px] py-12 font-cascadia-code">
      <div className="relative w-16 h-16 mb-6">
        <div
          className="absolute w-full h-full rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--primary) transparent transparent transparent",
          }}
        />
        <div
          className="absolute w-full h-full rounded-full border-4 border-t-transparent animate-spin opacity-70"
          style={{
            borderColor: "var(--secondary) transparent transparent transparent",
            animationDuration: "1.5s",
            animationDelay: "0.2s",
          }}
        />
      </div>
      <div
        className="text-lg font-medium"
        style={{ color: "var(--foreground)" }}
      >
        Loading document...
      </div>
      <div
        className="mt-2 text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        Preparing your content
      </div>
      <div
        className="mt-6 max-w-md w-full h-2 rounded-full overflow-hidden bg-opacity-20"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{
            backgroundColor: "var(--primary)",
            width: "60%",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
