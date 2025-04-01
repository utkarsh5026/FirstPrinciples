// src/App.tsx
import React, { useEffect } from "react";
import Renderer from "./components/core/Renderer";

function App() {
  // Setup focus-optimized environment with reduced contrast
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");

    // Set font rendering for optimal legibility
    document.body.style.textRendering = "optimizeLegibility";

    // Add a class to the body for reduced contrast
    document.body.classList.add("reduced-contrast");

    // Set max line width for optimal reading
    const style = document.createElement("style");
    style.textContent = `
      p, li, blockquote {
        max-width: 70ch;
      }
      
      /* Enhanced reduced-contrast text rendering */
      .reduced-contrast {
        font-weight: 300;
        letter-spacing: 0.011em;
      }
      
      /* Slightly increase font weight for better legibility at reduced contrast */
      @media (max-width: 768px) {
        .reduced-contrast {
          font-weight: 400;
        }
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
