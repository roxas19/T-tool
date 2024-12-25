import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

interface DiagramSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDragStart: (elements: any[]) => void; // Callback to notify App.tsx during drag
}

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onDragStart,
}) => {
  const [diagrams, setDiagrams] = useState<{ syntax: string; svg: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { elements: skeletonElements } = await parseMermaidToExcalidraw(
        syntax
      );
      const qualifiedElements = convertToExcalidrawElements(skeletonElements);

      onDragStart(qualifiedElements); // Notify App.tsx
      event.dataTransfer.setData("application/json", JSON.stringify(qualifiedElements));
      event.dataTransfer.effectAllowed = "move";
    } catch (err) {
      console.error("Error converting diagram during drag:", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "10px",
          backgroundColor: isSidebarOpen ? "#ff0000" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      {isSidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            backgroundColor: "#f0f0f0",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            zIndex: 10,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <h2>Diagram Sidebar</h2>
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
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#ffffff",
                  cursor: "grab",
                }}
                dangerouslySetInnerHTML={{ __html: diagram.svg }}
              ></div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default DiagramSidebar;
