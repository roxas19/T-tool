import React, { useState, useRef, useEffect } from 'react';

type ToolConfigMenuProps = {
    excalidrawAPI: any;
    toolType: string;
    onClose: () => void;
};

const ToolConfigMenu = ({ excalidrawAPI, toolType, onClose }: ToolConfigMenuProps) => {
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const menuRef = useRef<HTMLDivElement>(null);

    // Apply settings when any of the configuration changes
    useEffect(() => {
        excalidrawAPI?.updateScene({
            appState: {
                currentItemStrokeColor: strokeColor,
                currentItemBackgroundColor: backgroundColor,
                currentItemStrokeWidth: strokeWidth,
            },
        });
    }, [strokeColor, backgroundColor, strokeWidth, excalidrawAPI]);

    // Close the menu only when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="tool-config-menu">
            <h4>{toolType} Settings</h4>

            <label>Stroke Color</label>
            <div className="color-options">
                {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"].map((color) => (
                    <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setStrokeColor(color)}
                    ></button>
                ))}
            </div>

            <label>Background Color</label>
            <div className="color-options">
                {["#FFFFFF", "#FFCCCC", "#CCFFCC", "#CCCCFF", "#FFFFCC"].map((color) => (
                    <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setBackgroundColor(color)}
                    ></button>
                ))}
            </div>

            <label>Stroke Width</label>
            <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
        </div>
    );
};

export default ToolConfigMenu;
