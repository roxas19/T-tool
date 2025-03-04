// src/Excalidraw/ExcalidrawToolbar.tsx
import React, { useState } from "react";
import { useGlobalUI } from "../context/GlobalUIContext";
import AIDiagrammingPanel from "./AIDiagrammingPanel";

export type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  setActiveTool: (tool: any) => void;
  // ...other methods
};

export interface ExcalidrawToolbarProps {
  className?: string;
  onToolSelect: (toolType: string) => void;
}

const ExcalidrawToolbar: React.FC<ExcalidrawToolbarProps> = ({
  className = "custom-toolbar",
  onToolSelect,
}) => {
  const { state } = useGlobalUI();
  const excalidrawAPI = state.excalidrawAPI;
  const [mode, setMode] = useState<"normal" | "ai">("normal");

  const activateTool = (tool: string) => {
    if (excalidrawAPI) {
      // Set the active tool using the Excalidraw API.
      excalidrawAPI.setActiveTool({ type: tool });
    }
    onToolSelect(tool);
  };

  return (
    <div className={`${className} ${mode === "ai" ? "ai-mode" : ""}`}>
      {mode === "ai" ? (
        <AIDiagrammingPanel
          onDragStart={(elements) => {
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
          <button onClick={() => setMode("ai")}>AI ops</button>
        </>
      )}
    </div>
  );
};

export default ExcalidrawToolbar;
