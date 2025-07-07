import { downloadAsFile, downloadAsImage } from "@/utils/download";
import { useCallback, useState } from "react";

export const useCodeActions = (
  codeContent: string,
  language: string,
  drawerCodeRef: React.RefObject<HTMLDivElement | null>
) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<"image" | "file" | null>(null);

  /**
   * Copy to Clipboard Functionality
   *
   * Copies the code content to user's clipboard and provides
   * visual feedback with a temporary success state.
   */
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [codeContent]);

  /**
   * Download as Image Functionality
   *
   * Converts the code display to a canvas and downloads it as PNG.
   * Handles horizontal overflow by temporarily expanding the container.
   */
  const handleDownloadAsImage = useCallback(() => {
    setDownloading("image");
    if (drawerCodeRef.current) {
      downloadAsImage(drawerCodeRef.current, language).then(() => {
        setDownloading(null);
      });
    } else {
      setDownloading(null);
    }
  }, [language, drawerCodeRef]);

  /**
   * Download as File Functionality
   *
   * Creates a text file with the code content and triggers download.
   * File extension is determined by the detected language.
   */
  const handleDownloadAsFile = useCallback(() => {
    setDownloading("file");
    downloadAsFile(codeContent, language);
    setDownloading(null);
  }, [codeContent, language]);

  return {
    copied,
    downloading,
    copyToClipboard,
    handleDownloadAsImage,
    handleDownloadAsFile,
  };
};
