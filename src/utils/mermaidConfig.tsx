import mermaid from "mermaid";

let isMermaidInitialized = false;

/**
 * Initializes Mermaid globally. This function should be called once
 * in your application to configure Mermaid's settings.
 */
export const initializeMermaid = () => {
  if (!isMermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false, // Prevent auto-rendering
      theme: "default",  // Customize as needed
    });
    isMermaidInitialized = true;
    console.log("Mermaid initialized.");
  }
};

/**
 * Resets Mermaid's internal state. This function clears the
 * diagram registry and other cached states in Mermaid.
 */
export const resetMermaidState = () => {
  try {
    mermaid.mermaidAPI.reset(); // Reset Mermaid's state
    console.log("Mermaid state reset.");
  } catch (error) {
    console.error("Error resetting Mermaid state:", error);
  }
};
