import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ArrowUp, Trophy, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementDialogProps {
  showAchievementPopup: boolean;
  closeAchievementPopup: () => void;
  levelUp: boolean;
  achievementTitle: string;
  achievementDescription: string;
  xpGained: number;
  newLevel: number;
}

const AchievementDialog: React.FC<AchievementDialogProps> = ({
  showAchievementPopup,
  closeAchievementPopup,
  levelUp,
  achievementTitle,
  achievementDescription,
  xpGained,
  newLevel,
}) => {
  return (
    <Dialog open={showAchievementPopup} onOpenChange={closeAchievementPopup}>
      <DialogContent className="sm:max-w-md border-primary/20 font-cascadia-code">
        <DialogHeader className="text-center">
          <DialogTitle className="flex flex-col items-center gap-2 text-xl">
            {levelUp ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <ArrowUp className="h-10 w-10 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <Trophy className="h-10 w-10 text-primary" />
              </motion.div>
            )}
            <span>{achievementTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {achievementDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          <motion.div
            className="mb-4 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {levelUp ? (
              <div className="text-4xl font-bold text-primary flex items-center">
                {newLevel}
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Star className="h-7 w-7 text-yellow-500 ml-2" />
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xl font-semibold text-primary">
                  +{xpGained} XP
                </span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="text-center text-muted-foreground text-sm max-w-xs"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {levelUp ? (
              <p>
                Keep up the good work! Unlock new features and benefits as you
                level up.
              </p>
            ) : (
              <p>
                Great job! Continue reading to unlock more achievements and gain
                experience.
              </p>
            )}
          </motion.div>
        </div>

        <DialogFooter>
          <Button
            onClick={closeAchievementPopup}
            className="w-full bg-primary/90 hover:bg-primary"
          >
            Continue Reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementDialog;
