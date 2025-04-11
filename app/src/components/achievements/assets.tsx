import type {
  AchievementCategory,
  AchievementTier,
} from "@/services/analytics/AchievmentService";
import {
  BookText,
  Flame,
  Compass,
  Trophy,
  Clock,
  Lock,
  Zap,
  BookOpen,
  BarChart2,
  Target,
  GraduationCap,
  Calendar,
  CheckSquare,
  Timer,
  Moon,
  Sunrise,
  FolderOpen,
  Library,
  Globe,
  CheckCircle,
  Award,
  Map,
} from "lucide-react";

export const categoryInfo: Record<
  AchievementCategory,
  {
    name: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  }
> = {
  reading_volume: {
    name: "Reading Volume",
    icon: <BookText className="h-4 w-4" />,
    description: "Achievements for reading a certain number of documents",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  reading_streaks: {
    name: "Reading Streaks",
    icon: <Flame className="h-4 w-4" />,
    description: "Achievements for consistent reading habits",
    color: "text-red-600 dark:text-red-400",
  },
  exploration: {
    name: "Exploration",
    icon: <Compass className="h-4 w-4" />,
    description: "Achievements for discovering diverse content",
    color: "text-blue-600 dark:text-blue-400",
  },
  mastery: {
    name: "Mastery",
    icon: <Trophy className="h-4 w-4" />,
    description: "Achievements for thoroughly completing documents",
    color: "text-purple-600 dark:text-purple-400",
  },
  time_spent: {
    name: "Time Spent",
    icon: <Clock className="h-4 w-4" />,
    description: "Achievements for dedicating time to reading",
    color: "text-cyan-600 dark:text-cyan-400",
  },
  hidden: {
    name: "Hidden",
    icon: <Lock className="h-4 w-4" />,
    description: "Secret achievements waiting to be discovered",
    color: "text-gray-600 dark:text-gray-400",
  },
  challenges: {
    name: "Challenges",
    icon: <Zap className="h-4 w-4" />,
    description: "Special achievements that test your dedication",
    color: "text-amber-600 dark:text-amber-400",
  },
};

export const getAchievementIcon = (iconName: string) => {
  switch (iconName) {
    case "BookOpen":
      return <BookOpen className="w-full h-full" />;
    case "BookText":
      return <BookText className="w-full h-full" />;
    case "Flame":
      return <Flame className="w-full h-full" />;
    case "Target":
      return <Target className="w-full h-full" />;
    case "Zap":
      return <Zap className="w-full h-full" />;
    case "Compass":
      return <Compass className="w-full h-full" />;
    case "Map":
      return <Map className="w-full h-full" />;
    case "GraduationCap":
      return <GraduationCap className="w-full h-full" />;
    case "Trophy":
      return <Trophy className="w-full h-full" />;
    case "CalendarCheck":
      return <Calendar className="w-full h-full" />;
    case "CheckSquare":
      return <CheckSquare className="w-full h-full" />;
    case "BarChart2":
      return <BarChart2 className="w-full h-full" />;
    case "Clock":
      return <Clock className="w-full h-full" />;
    case "Hourglass":
      return <Timer className="w-full h-full" />;
    case "Moon":
      return <Moon className="w-full h-full" />;
    case "Sunrise":
      return <Sunrise className="w-full h-full" />;
    case "Calendar":
      return <Calendar className="w-full h-full" />;
    case "FolderClosed":
      return <FolderOpen className="w-full h-full" />;
    case "Library":
      return <Library className="w-full h-full" />;
    case "GlobeHemisphereWest":
      return <Globe className="w-full h-full" />;
    case "CheckCircle":
      return <CheckCircle className="w-full h-full" />;
    default:
      return <Award className="w-full h-full" />;
  }
};

export const tierStyles: Record<
  AchievementTier,
  {
    background: string;
    border: string;
    shadow: string;
    textColor: string;
    badgeColor: string;
  }
> = {
  bronze: {
    background: "bg-amber-100 dark:bg-amber-900/20",
    border: "border-amber-300 dark:border-amber-700",
    shadow: "shadow-amber-100 dark:shadow-amber-900/30",
    textColor: "text-amber-900 dark:text-amber-300",
    badgeColor:
      "bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100",
  },
  silver: {
    background: "bg-slate-100 dark:bg-slate-800/30",
    border: "border-slate-300 dark:border-slate-600",
    shadow: "shadow-slate-100 dark:shadow-slate-900/30",
    textColor: "text-slate-900 dark:text-slate-200",
    badgeColor:
      "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
  },
  gold: {
    background: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-300 dark:border-yellow-700",
    shadow: "shadow-yellow-100 dark:shadow-yellow-900/30",
    textColor: "text-yellow-900 dark:text-yellow-300",
    badgeColor:
      "bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100",
  },
  platinum: {
    background: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-300 dark:border-indigo-700",
    shadow: "shadow-indigo-100 dark:shadow-indigo-900/30",
    textColor: "text-indigo-900 dark:text-indigo-300",
    badgeColor:
      "bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100",
  },
};

export const categoryStyles: Record<
  AchievementCategory,
  {
    icon: React.ReactNode;
    color: string;
  }
> = {
  reading_volume: {
    icon: <BookText className="w-full h-full" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  reading_streaks: {
    icon: <Flame className="w-full h-full" />,
    color: "text-red-600 dark:text-red-400",
  },
  exploration: {
    icon: <Compass className="w-full h-full" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  mastery: {
    icon: <Trophy className="w-full h-full" />,
    color: "text-purple-600 dark:text-purple-400",
  },
  time_spent: {
    icon: <Clock className="w-full h-full" />,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  hidden: {
    icon: <Lock className="w-full h-full" />,
    color: "text-gray-600 dark:text-gray-400",
  },
  challenges: {
    icon: <Zap className="w-full h-full" />,
    color: "text-amber-600 dark:text-amber-400",
  },
};
