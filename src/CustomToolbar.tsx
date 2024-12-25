import React from "react";

type CustomToolbarProps = {
  excalidrawAPI: {
    updateScene: (sceneData: any) => void;
  } | null;
  onToolSelect: (toolType: string) => void; // Ensure onToolSelect is included as a prop
};

const CustomToolbar = ({ excalidrawAPI, onToolSelect }: CustomToolbarProps) => {
  const activateTool = (tool: string) => {
    excalidrawAPI?.updateScene({
      appState: { activeTool: { type: tool } },
    });
    onToolSelect(tool); // Notify parent about selected tool
  };

  return (
    <div className="custom-toolbar">
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

export default CustomToolbar;
