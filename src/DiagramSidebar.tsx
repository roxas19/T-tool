import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { initializeMermaid } from "./utils/mermaidConfig";

interface DiagramSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDiagramSelect?: (elements: any[]) => void; // Add this optional callback
}

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onDiagramSelect,
}) => {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMermaid(); // Initialize Mermaid globally once

    const loadDiagrams = async () => {
      const mermaidSyntaxList = [
        "graph TD; A-->B; A-->C; B-->D; C-->D;",
        "sequenceDiagram; participant A; participant B; A->>B: Hello;",
      ];

      setLoading(true);
      setError(null);
      const renderedDiagrams: string[] = [];

      for (const syntax of mermaidSyntaxList) {
        try {
          // Render the diagram
          const { svg } = await mermaid.render(
            `diagram-${Math.random().toString(36).substring(7)}`, // Unique ID
            syntax
          );
          renderedDiagrams.push(svg);
        } catch (err) {
          console.error(`Error rendering Mermaid syntax: ${syntax}`, err);
          setError(`Error processing syntax: ${syntax}`);
        }
      }

      setDiagrams(renderedDiagrams);
      setLoading(false);
    };

    loadDiagrams();
  }, []);

  // Handle diagram selection
  const handleDiagramClick = (diagramSvg: string) => {
    if (onDiagramSelect) {
      // Convert SVG into an array of elements for Excalidraw
      const elements = [{ type: "customSvg", svg: diagramSvg }];
      onDiagramSelect(elements);
    }
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
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

      {/* Sidebar */}
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
            diagrams.map((diagramSvg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer", // Add hover indication
                }}
                dangerouslySetInnerHTML={{ __html: diagramSvg }} // Render the SVG
                onClick={() => handleDiagramClick(diagramSvg)} // Trigger diagram selection
              ></div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default DiagramSidebar;
