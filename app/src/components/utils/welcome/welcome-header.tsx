import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const WelcomeHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="text-center mb-16 md:mb-20"
    >
      <motion.h1
        className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Welcome to{" "}
        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          First Principles
        </span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Your comprehensive documentation viewer with built-in reading tracking,
        analytics, and a focus on understanding{" "}
        <span className="text-primary font-semibold">
          from first principles
        </span>
        .
      </motion.p>

      <motion.div
        className="flex justify-center gap-4 mt-8 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {["Documentation", "Analytics", "Progress Tracking"].map((badge) => (
          <motion.div
            key={badge}
            className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="inline h-3 w-3 mr-1" />
            {badge}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default WelcomeHeader;
