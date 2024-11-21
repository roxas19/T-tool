import React, { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';

type DiagramSidebarProps = {
  mermaidSyntaxList: string[];
};

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({ mermaidSyntaxList }) => {
  const [renderedDiagrams, setRenderedDiagrams] = useState<any[]>([]);

  useEffect(() => {
    const renderDiagrams = async () => {
      const diagrams = [];
      for (const syntax of mermaidSyntaxList) {
        try {
          // Use parseMermaidToExcalidraw to convert Mermaid syntax to Excalidraw elements
          const elements = await parseMermaidToExcalidraw(syntax);
          diagrams.push(elements);
        } catch (error) {
          console.error(`Error rendering Mermaid syntax: ${syntax}`, error);
        }
      }
      setRenderedDiagrams(diagrams);
    };

    renderDiagrams();
  }, [mermaidSyntaxList]);

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: '25%',
        backgroundColor: '#f9f9f9',
        overflowY: 'auto',
        borderLeft: '1px solid #ddd',
        padding: '10px',
      }}
    >
      <h3>Diagrams</h3>
      {renderedDiagrams.map((diagram, index) => (
        <div
          key={index}
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <Excalidraw
            initialData={{
              elements: diagram.elements,
              appState: {
                viewBackgroundColor: 'transparent',
                gridSize: null,
                editingGroupId: null,
                activeTool: {
                  type: "custom",
                  customType: "diagram-sidebar",
                  lastActiveTool: null,
                  locked: false,
                },
                cursorButton: undefined,
              },
            }}
            onPointerDown={() => {
              console.log('Pointer down event suppressed');
            }}
            onChange={() => {
              console.log('Changes suppressed');
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DiagramSidebar;
