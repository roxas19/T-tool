// AIDiagrammingPanel.tsx
import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

interface AIDiagrammingPanelProps {
  onDragStart: (elements: any[]) => void; // Callback to notify parent during drag
  onSwitchToToolbar: () => void; // Callback to switch back to the normal toolbar
}

const AIDiagrammingPanel: React.FC<AIDiagrammingPanelProps> = ({
  onDragStart,
  onSwitchToToolbar,
}) => {
  const [diagrams, setDiagrams] = useState<{ syntax: string; svg: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load diagrams using Mermaid when the component mounts.
  useEffect(() => {
    const loadDiagrams = async () => {
      const syntaxList = [
        `flowchart TD
          A[Start] --> B{Is it working?}
          B -->|Yes| C[Great!]
          B -->|No| D[Try again]`,
        `flowchart LR
          A --> B`,
      ];

      setLoading(true);
      setError(null);
      const renderedDiagrams: { syntax: string; svg: string }[] = [];

      for (const syntax of syntaxList) {
        try {
          const { svg } = await mermaid.render(
            `diagram-${Math.random().toString(36).substring(7)}`,
            syntax
          );
          renderedDiagrams.push({ syntax, svg });
        } catch (err) {
          console.error(`Error rendering Mermaid syntax: ${syntax}`, err);
          setError(`Error rendering diagram.`);
        }
      }

      setDiagrams(renderedDiagrams);
      setLoading(false);
    };

    loadDiagrams();
  }, []);

  const handleDragStart = async (syntax: string, event: React.DragEvent) => {
    try {
      console.log(`Converting diagram syntax: ${syntax}`);
      const { elements: skeletonElements } = await parseMermaidToExcalidraw(syntax);
      const qualifiedElements = convertToExcalidrawElements(skeletonElements);

      onDragStart(qualifiedElements); // Notify parent (likely the Excalidraw container)
      event.dataTransfer.setData("application/json", JSON.stringify(qualifiedElements));
      event.dataTransfer.effectAllowed = "move";
    } catch (err) {
      console.error("Error converting diagram during drag:", err);
    }
  };

  return (
    <div className="ai-panel-content">
      {/* Toolbar button to switch back to the normal toolbar */}
      <button
        onClick={onSwitchToToolbar}
        className="ai-switch-btn"
      >
        Toolbar
      </button>

      <h2>AI Diagramming</h2>
      {loading ? (
        <p>Loading diagrams...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : diagrams.length === 0 ? (
        <p>No diagrams to display.</p>
      ) : (
        diagrams.map((diagram, index) => (
          <div
            key={index}
            draggable
            onDragStart={(event) => handleDragStart(diagram.syntax, event)}
            className="ai-diagram"
            dangerouslySetInnerHTML={{ __html: diagram.svg }}
          ></div>
        ))
      )}
    </div>
  );
};

export default AIDiagrammingPanel;
