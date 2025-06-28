import React from "react";
import { LucideProps } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
  delay: number;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  Icon,
  title,
  description,
  delay,
  color,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay * 0.1 + 0.2,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="group relative bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 font-cascadia-code cursor-pointer overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <motion.div
            className="relative p-3 rounded-2xl flex-shrink-0 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `1px solid ${color}30`,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 },
            }}
          >
            <Icon
              className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
              style={{ color: color }}
            />

            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"
              style={{ backgroundColor: color }}
            />
          </motion.div>

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
