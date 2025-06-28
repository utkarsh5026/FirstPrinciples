import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Rocket } from "lucide-react";
import { useState, useEffect } from "react";

interface WelcomeHeaderProps {
  onGetStarted?: () => void;
}

const WelcomeHeader = ({ onGetStarted }: WelcomeHeaderProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBreakdown(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center mb-16 md:mb-20 relative overflow-hidden">
      {/* Background Mathematical Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              className="border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* Deconstructed Title Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        {/* Complex Problem (starts big, then breaks down) */}
        <motion.div
          initial={{ scale: 1.5, opacity: 0.8 }}
          animate={{
            scale: showBreakdown ? 0.8 : 1.5,
            y: showBreakdown ? -60 : 0,
            opacity: showBreakdown ? 0.3 : 0.8,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-2xl md:text-4xl font-bold text-muted-foreground/50 blur-sm">
            Complex Problem
          </div>
        </motion.div>

        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2"
          >
            <ArrowDown className="h-6 w-6 text-primary animate-bounce" />
          </motion.div>
        )}

        <Title />

        <LetsGoButton onGetStarted={onGetStarted} />

        {/* Philosophical Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <motion.p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <span className="text-primary font-semibold">
              Break down complexity
            </span>{" "}
            into fundamental truths.{" "}
            <span className="text-primary font-semibold">
              Question assumptions
            </span>
            . Build understanding from the ground up.
          </motion.p>
        </motion.div>

        {/* Subtle Mathematical Formula */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="mt-8 text-xs font-mono text-muted-foreground/40"
        >
          Truth = ∑(Facts ∩ Logic ∩ Evidence) - Assumptions
        </motion.div>
      </motion.div>
    </div>
  );
};

const LetsGoButton: React.FC<WelcomeHeaderProps> = ({ onGetStarted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
      className="mb-8"
    >
      <motion.button
        onClick={onGetStarted}
        className="group relative px-8 py-4 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground font-bold text-lg rounded-full shadow-2xl border-2 border-primary/20 backdrop-blur-sm overflow-hidden cursor-pointer"
        whileHover={{
          scale: 1.05,
          y: -2,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />

        {/* Button content */}
        <span className="relative z-10 flex items-center gap-3">
          <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          Let's Go
          <motion.div
            className="group-hover:translate-x-1 transition-transform duration-300"
            animate={{
              x: [0, 3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </span>

        {/* Sparkle effects on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

const Title = () => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 1, type: "spring" }}
      className="text-5xl md:text-7xl font-black mb-8 relative"
    >
      <span className="block text-2xl md:text-3xl font-light text-muted-foreground mb-2">
        Welcome to
      </span>

      <div className="relative">
        {/* Multiple shadow layers for depth */}
        <motion.span
          className="absolute inset-0 text-primary/30"
          initial={{ x: 8, y: 8 }}
          animate={{ x: [6, 10, 6], y: [6, 10, 6] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            textShadow: "4px 4px 0px rgba(0,0,0,0.3)",
          }}
        >
          First Principles
        </motion.span>

        {/* Bold outline layer */}
        <motion.span
          className="absolute inset-0 text-transparent font-black"
          style={{
            WebkitTextStroke: "3px hsl(var(--primary))",
          }}
          animate={{
            filter: [
              "drop-shadow(0 0 10px hsl(var(--primary)/0.5))",
              "drop-shadow(0 0 20px hsl(var(--primary)/0.8))",
              "drop-shadow(0 0 10px hsl(var(--primary)/0.5))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          First Principles
        </motion.span>

        {/* Main text with bold styling */}
        <motion.span
          className="relative z-10 text-foreground font-black"
          initial={{ letterSpacing: "0.1em", scale: 0.9 }}
          animate={{ letterSpacing: "0em", scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{
            textShadow: `
              2px 2px 0px hsl(var(--primary)),
              4px 4px 0px hsl(var(--primary)/0.8),
              6px 6px 0px hsl(var(--primary)/0.6),
              8px 8px 15px rgba(0,0,0,0.4)
            `,
            filter: "brightness(1.1) contrast(1.2)",
          }}
        >
          <motion.span
            animate={{
              color: [
                "hsl(var(--foreground))",
                "hsl(var(--primary))",
                "hsl(var(--foreground))",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            First
          </motion.span>{" "}
          <motion.span
            animate={{
              color: [
                "hsl(var(--primary))",
                "hsl(var(--foreground))",
                "hsl(var(--primary))",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            Principles
          </motion.span>
        </motion.span>

        {/* Dynamic glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                hsl(var(--primary)/0.2) 0%,
                transparent 70%
              )
            `,
            filter: "blur(20px)",
          }}
        />
      </div>
    </motion.h1>
  );
};
export default WelcomeHeader;
