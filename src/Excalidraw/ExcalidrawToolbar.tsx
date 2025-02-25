// ExcalidrawToolbar.tsx
import React, { useState } from "react";
import { useGlobalUI } from "../context/GlobalUIContext";
import AIDiagrammingPanel from "./AIDiagrammingPanel";

export type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  // ...other methods
  setActiveTool: (tool: any) => void;
};

export interface ExcalidrawToolbarProps {
  className?: string;
  onToolSelect: (toolType: string) => void;
}

const ExcalidrawToolbar: React.FC<ExcalidrawToolbarProps> = ({
  className = "custom-toolbar",
  onToolSelect,
}) => {
  // Retrieve the Excalidraw API from the global context
  const { excalidrawAPI } = useGlobalUI();

  // Local state to control toolbar mode: "normal" or "ai"
  const [mode, setMode] = useState<"normal" | "ai">("normal");

  // Function to activate a tool in the normal toolbar mode
  const activateTool = (tool: string) => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({ type: tool });
    }
    onToolSelect(tool);
  };

  return (
    <div className={`${className} ${mode === "ai" ? "ai-mode" : ""}`}>
      {mode === "ai" ? (
        <AIDiagrammingPanel
          onDragStart={(elements) => {
            // Optionally, handle drag events here if needed.
            console.log("AI Diagram dragged:", elements);
          }}
          onSwitchToToolbar={() => setMode("normal")}
        />
      ) : (
        <>
          <button onClick={() => activateTool("selection")}>Selection</button>
          <button onClick={() => activateTool("freedraw")}>Pen</button>
          <button onClick={() => activateTool("eraser")}>Eraser</button>
          <button onClick={() => activateTool("rectangle")}>Rectangle</button>
          <button onClick={() => activateTool("ellipse")}>Ellipse</button>
          <button onClick={() => activateTool("diamond")}>Diamond</button>
          <button onClick={() => activateTool("arrow")}>Arrow</button>
          <button onClick={() => activateTool("line")}>Line</button>
          <button onClick={() => activateTool("text")}>Text</button>
          <button onClick={() => activateTool("laser")}>Laser Pointer</button>
          {/* Button to switch to AI ops mode */}
          <button onClick={() => setMode("ai")}>AI ops</button>
        </>
      )}
    </div>
  );
};

export default ExcalidrawToolbar;
