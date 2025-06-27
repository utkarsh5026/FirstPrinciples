import { useTheme } from "@/hooks/ui/use-theme";

const FirstPrinciplesLogo: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  const { currentTheme } = useTheme();

  return (
    <button
      onClick={onClick}
      className="group hidden md:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300 hover:scale-105 cursor-pointer font-cascadia-code"
      aria-label="Navigate to home"
    >
      <div className="relative flex items-center justify-center w-10 h-10">
        <div
          className="absolute inset-0 w-10 h-10 border-2 rounded-full animate-spin-slow opacity-30"
          style={{
            borderColor: "transparent",
            borderTopColor: currentTheme.primary,
            animationDirection: "reverse",
            animationDuration: "8s",
          }}
        />

        <div
          className="absolute inset-1 border rounded-full animate-spin opacity-40 border-none bg-primary/20 border-r-2 border-primary"
          style={{ animationDuration: "3s" }}
        />

        <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
          <div className="relative z-10 text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            🥇
          </div>
        </div>
      </div>

      <div className="relative">
        <span className="text-lg font-black tracking-tight transition-all duration-300 group-hover:tracking-wide">
          First <span className="font-black text-primary">Principles</span>
        </span>

        <div className="absolute -bottom-0.5 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full bg-primary" />
      </div>
    </button>
  );
};

export default FirstPrinciplesLogo;
