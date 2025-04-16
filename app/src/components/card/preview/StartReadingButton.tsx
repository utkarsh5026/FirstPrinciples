import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StartReadingButtonProps {
  startReading: () => void;
}

const StartReadingButton: React.FC<StartReadingButtonProps> = ({
  startReading,
}) => {
  return (
    <motion.div
      className="mt-8 flex justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto"
      >
        <Button
          onClick={startReading}
          className="relative overflow-hidden group w-full sm:w-auto px-8 py-6 h-auto rounded-2xl bg-primary/60 hover:bg-primary/30 transition-colors shadow-2xl shadow-primary/40 cursor-pointer perspective-dramatic"
        >
          {/* Enhanced button shine effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-50"
            initial={{
              backgroundPosition: "0% 50%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
              backgroundSize: "200% 100%",
            }}
          />

          {/* Button content */}
          <div className="relative flex items-center justify-center">
            <motion.span
              className="mr-2 h-5 w-5"
              animate={{ rotate: [0, 5, 0, -5], scale: [1, 1.1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
            </motion.span>
            <span className="text-base font-medium">Start Reading</span>
            <motion.div
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default StartReadingButton;
