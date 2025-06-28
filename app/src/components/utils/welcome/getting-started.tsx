import { motion } from "framer-motion";
import {
  BarChart3,
  BookMarked,
  BookOpenText,
  Rocket,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/hooks";

const gettingStartedSteps = [
  {
    icon: BookOpenText,
    title: "Explore Categories",
    description:
      "Browse the sidebar to find documentation on various topics and technologies",
    color: "#8b5cf6",
  },
  {
    icon: BookMarked,
    title: "Build Your Reading List",
    description:
      "Save interesting documents and organize your learning journey",
    color: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "Check analytics to see reading progress and earned achievements",
    color: "#f97316",
  },
  {
    icon: Rocket,
    title: "Complete Challenges",
    description:
      "Take on daily challenges to level up and expand your knowledge",
    color: "#3b82f6",
  },
];

const GettingStarted = () => {
  const { currentTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="relative bg-card/60 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-primary/20 mb-12 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-center mb-8">
          <motion.div
            className="p-3 rounded-xl mr-4"
            style={{ backgroundColor: `${currentTheme.primary}20` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Rocket className="h-6 w-6 text-primary" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Getting Started
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gettingStartedSteps.map((step, index) => (
            <motion.div
              key={step.title}
              className="flex items-start p-4 rounded-xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all duration-300 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <motion.div
                className="flex-shrink-0 p-2 rounded-lg mr-4"
                style={{ backgroundColor: `${step.color}20` }}
                whileHover={{ scale: 1.1 }}
              >
                <step.icon className="h-5 w-5" style={{ color: step.color }} />
              </motion.div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GettingStarted;
