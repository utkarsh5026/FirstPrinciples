import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpenText,
  BookMarked,
  BarChart3,
  Zap,
  PenSquare,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import FeatureCard from "./feature-card";
import GettingStarted from "./getting-started";
import WelcomeHeader from "./welcome-header";

const features = [
  {
    icon: BookOpenText,
    title: "Comprehensive Documentation",
    description:
      "Access detailed documentation on various programming concepts and technologies.",
    color: "#8b5cf6", // Purple
  },
  {
    icon: Clock,
    title: "Reading History",
    description:
      "Track your reading history and easily pick up where you left off.",
    color: "#3b82f6", // Blue
  },
  {
    icon: BookMarked,
    title: "Reading List",
    description:
      "Save documents to read later and organize your learning journey.",
    color: "#10b981", // Green
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Visualize your reading habits and track your progress over time.",
    color: "#f97316", // Orange
  },
  {
    icon: Zap,
    title: "Achievements & Challenges",
    description:
      "Complete challenges and earn achievements to level up your learning.",
    color: "#eab308", // Yellow
  },
  {
    icon: PenSquare,
    title: "Annotated Content",
    description:
      "Clear explanations from first principles for better understanding.",
    color: "#ec4899", // Pink
  },
];

interface OnboardingPageProps {
  onComplete: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { currentTheme } = useTheme();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  if (!showContent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-6" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 blur-md animate-pulse" />
          </div>
          <motion.p
            className="text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading First Principles...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-background via-background to-background/95 overflow-y-auto font-cascadia-code">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.primary}40, ${currentTheme.primary}10, transparent)`,
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${currentTheme.primary} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20 relative z-10">
        <WelcomeHeader onGetStarted={handleComplete} />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              Icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
              color={feature.color}
            />
          ))}
        </motion.div>

        {/* Enhanced Getting Started Section */}
        <GettingStarted />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="flex justify-center gap-6 flex-wrap"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="rounded-full px-8 py-6 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={handleComplete}
            >
              <Star className="mr-2 h-5 w-5" />
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
