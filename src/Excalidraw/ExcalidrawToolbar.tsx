// ExcalidrawToolbar.tsx
import React from "react";
import { useGlobalUI } from "../context/GlobalUIContext";

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
  className,
  onToolSelect,
}) => {
  // Retrieve the Excalidraw API from the global context
  const { excalidrawAPI } = useGlobalUI();

  const activateTool = (tool: string) => {
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({ type: tool });
    }
    onToolSelect(tool);
  };

  return (
    <div className={className}>
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
    </div>
  );
};

export default ExcalidrawToolbar;
