import React from 'react';

type CustomToolbarProps = {
    excalidrawAPI: any;
    onToolSelect: (toolType: string) => void; // Add onToolSelect as a prop
};

const CustomToolbar = ({ excalidrawAPI, onToolSelect }: CustomToolbarProps) => {
    const activateTool = (tool: string) => {
        excalidrawAPI?.updateScene({
            appState: { activeTool: { type: tool } },
        });
        onToolSelect(tool); // Open config menu for this tool
    };

    const activatePenTool = () => {
        excalidrawAPI?.updateScene({
            appState: { activeTool: { type: 'freedraw' } },
        });
        onToolSelect('freedraw'); 
    };

    const activateLaserPointer = () => {
        excalidrawAPI?.updateScene({
            appState: { activeTool: { type: 'laser' } },
        });
        onToolSelect('laser'); // Optionally, handle any laser-specific config
    };

    return (
        <div className="custom-toolbar">
            <button onClick={() => activateTool('selection')}>Selection</button>
            <button onClick={activatePenTool}>Pen</button>
            <button onClick={() => activateTool('eraser')}>Eraser</button>
            <button onClick={() => activateTool('rectangle')}>Rectangle</button>
            <button onClick={() => activateTool('ellipse')}>Ellipse</button>
            <button onClick={() => activateTool('diamond')}>Diamond</button>
            <button onClick={() => activateTool('arrow')}>Arrow</button>
            <button onClick={() => activateTool('line')}>Line</button>
            <button onClick={() => activateTool('text')}>Text</button>
            <button onClick={activateLaserPointer}>Laser Pointer</button>
        </div>
    );
};

export default CustomToolbar;
