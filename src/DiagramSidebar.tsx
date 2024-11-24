import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import mermaid from "mermaid";
import { initializeMermaid } from "./utils/mermaidConfig";

interface DiagramSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type DiagramData = {
  id: string;
  svg: string;
  syntax: string;
};

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMermaid();

    const loadDiagrams = async () => {
      const mermaidSyntaxList = [
        `flowchart TD
          A[Start] -->|Step 1| B{Decision?}
          B -->|Yes| C[Do Something]
          B -->|No| D[Do Something Else]
          C --> E[End]
          D --> E[End]`,
        `sequenceDiagram
          participant Alice
          participant Bob
          Alice->>Bob: Hello Bob, how are you?
          Bob-->>Alice: I'm good thanks!
          Bob->>Charlie: Hi Charlie, want to grab lunch?
          Charlie-->>Bob: Sure, let's go!`,
      ];

      setLoading(true);
      setError(null);
      const renderedDiagrams: DiagramData[] = [];

      for (const syntax of mermaidSyntaxList) {
        try {
          const { svg } = await mermaid.render(
            `diagram-${Math.random().toString(36).substring(7)}`,
            syntax
          );
          renderedDiagrams.push({
            id: `diagram-${Math.random().toString(36).substring(7)}`,
            svg,
            syntax,
          });
        } catch (err) {
          setError(`Error processing syntax: ${syntax}`);
        }
      }

      setDiagrams(renderedDiagrams);
      setLoading(false);
    };

    loadDiagrams();
  }, []);

  const DraggableDiagram: React.FC<{ diagram: DiagramData }> = ({ diagram }) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: "DIAGRAM",
      item: { id: diagram.id, svg: diagram.svg },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    useEffect(() => {
      if (isDragging) {
        console.log(`Diagram with ID ${diagram.id} is being dragged`);
      }
    }, [isDragging, diagram.id]);

    return (
      <div
        ref={dragRef}
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: isDragging ? "2px dashed #007bff" : "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#ffffff",
          cursor: "move",
        }}
        dangerouslySetInnerHTML={{ __html: diagram.svg }}
      ></div>
    );
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
            diagrams.map((diagram) => (
              <DraggableDiagram key={diagram.id} diagram={diagram} />
            ))
          )}
        </div>
      )}
    </>
  );
};

export default DiagramSidebar;
