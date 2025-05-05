import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface ErrorLoadingDocumentProps {
  error: string;
}

/**
 * ErrorLoadingDocument Component 😊
 *
 * This charming component is designed to gracefully inform users
 * when there is an issue loading a document. It provides a friendly
 * message that reassures users that something went wrong, while
 * maintaining a delightful user experience. 🌟
 *
 * The component features a smooth animation that brings the error
 * message into view, making it visually appealing and engaging.
 * Users are presented with a clear indication of the error, helping
 * them understand that they may need to take action or try again.
 *
 * It's all about keeping the experience light-hearted and user-friendly! 💖
 */
const ErrorLoadingDocument: React.FC<ErrorLoadingDocumentProps> = ({
  error,
}) => {
  return (
    <div className="flex items-center justify-center h-64 w-full rounded-4xl bg-card/70 backdrop-blur-[2px] border border-border/30 shadow-sm font-cascadia-code">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-xl max-w-md shadow-lg"
      >
        <h3 className="font-medium mb-2 flex items-center">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Error Loading Document
        </h3>
        <p>{error}</p>
      </motion.div>
    </div>
  );
};

export default ErrorLoadingDocument;
