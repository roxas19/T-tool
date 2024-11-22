import React, { useEffect, useState } from "react";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";

interface DiagramSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  excalidrawAPI?: any; // Excalidraw API for interacting with the main canvas
}

// Type for Diagram Elements
type DiagramElement = { type: string; data?: string }; // Excalidraw elements or fallback SVGs

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  excalidrawAPI,
}) => {
  const [diagrams, setDiagrams] = useState<DiagramElement[][]>([]); // Array of arrays for Excalidraw elements or SVG fallbacks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiagrams = async () => {
      const mermaidSyntaxList = [
        // Example 1
        `flowchart TD
          Start[Start] -->|Click| Login[Login Page]
          Login -->|Success| Dashboard[Dashboard]
          Login -->|Failure| Error[Error Page]
          Dashboard -->|Logout| Start`,
        // Example 2
        `flowchart LR
          A[Order Placed] -->|Payment Received| B[Processing]
          B -->|Shipment Scheduled| C[Dispatched]
          C --> D[Out for Delivery]
          D --> E[Delivered]
          C --> F[Return Requested]`,
      ];

      setLoading(true);
      setError(null);
      const loadedDiagrams: any[] = [];

      for (const syntax of mermaidSyntaxList) {
        try {
          // Dynamically import Mermaid
          const { default: mermaid } = await import("mermaid");

          // Reset Mermaid state to avoid "already registered" error
          if (mermaid.mermaidAPI?.reset) {
            console.log("Resetting Mermaid state...");
            mermaid.mermaidAPI.reset();
          }

          // Initialize Mermaid with default configuration
          mermaid.initialize({ startOnLoad: false, theme: "default" });

          console.log(`Processing syntax: ${syntax}`);
          const parsedResult = await parseMermaidToExcalidraw(syntax);
          if (parsedResult?.elements) {
            loadedDiagrams.push(parsedResult.elements);
          } else {
            throw new Error("Parsed result is undefined or malformed.");
          }
        } catch (err) {
          console.error(`Error rendering Mermaid syntax: ${syntax}`, err);

          // Fallback: Render as SVG image
          try {
            const { default: mermaid } = await import("mermaid");
            const { svg } = await mermaid.render(
              `diagram-${Math.random().toString(36).substring(7)}`,
              syntax
            );
            loadedDiagrams.push([{ type: "image", data: svg }]);
          } catch (fallbackErr) {
            console.error(`Fallback rendering failed for: ${syntax}`, fallbackErr);
            setError(`Error processing syntax: ${syntax}`);
          }
        }
      }

      setDiagrams(loadedDiagrams);
      setLoading(false);
    };

    loadDiagrams();
  }, []);

  const addDiagramToCanvas = (diagramElements: DiagramElement[]) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ elements: diagramElements });
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
            diagrams.map((diagramElements, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
                onClick={() =>
                  diagramElements.some((el: DiagramElement) => el.type === "image")
                    ? console.warn("Cannot add SVG fallback to Excalidraw")
                    : addDiagramToCanvas(diagramElements)
                }
              >
                {diagramElements.some((el: DiagramElement) => el.type === "image") ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: diagramElements[0].data || "",
                    }}
                  />
                ) : (
                  <p>Diagram {index + 1}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default DiagramSidebar;
