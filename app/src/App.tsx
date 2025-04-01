// src/App.tsx
import React, { useEffect } from "react";
import Renderer from "./components/core/Renderer";

function App() {
  // Setup focus-optimized environment
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");

    // Set font rendering for optimal legibility
    document.body.style.textRendering = "optimizeLegibility";

    // Add a class to the body for any global focus-related CSS
    document.body.classList.add("focus-mode");

    // Set max line width for optimal reading
    const style = document.createElement("style");
    style.textContent = `
      p, li, blockquote {
        max-width: 70ch;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <Renderer />;
}

export default App;
